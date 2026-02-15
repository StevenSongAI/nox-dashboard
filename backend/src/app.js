require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { checkDatabaseHealth, initializePool, closePool } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Import routes
const entriesRouter = require('./routes/entries');
const searchRouter = require('./routes/search');
const statsRouter = require('./routes/stats');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Track active connections for graceful shutdown
let server = null;
const activeConnections = new Set();

// Security middleware
app.use(helmet());
app.use(cookieParser());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: { error: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limits
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// CORS - allow GitHub Pages domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing with size limits to prevent DoS
app.use(express.json({ 
  limit: '100kb',
  verify: (req, res, buf) => {
    req.rawBody = buf; // Store raw body for verification if needed
  }
}));

app.use(express.urlencoded({ 
  limit: '50kb', 
  extended: true 
}));

// Raw body for webhooks/file uploads (larger limit, but still bounded)
app.use(express.raw({ 
  limit: '1mb', 
  type: 'application/octet-stream' 
}));

// Request logging
app.use(logger);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  
  res.status(dbHealth.connected ? 200 : 503).json({
    status: dbHealth.connected ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    database: dbHealth.connected ? 'connected' : 'disconnected',
    ...(dbHealth.error && { dbError: dbHealth.error })
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Nox Dashboard API',
    version: '1.0.0',
    endpoints: ['/health', '/api/entries']
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/search', searchRouter);
app.use('/api/stats', statsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`\n📥 Received ${signal}. Starting graceful shutdown...`);
  
  const shutdownTimeout = setTimeout(() => {
    console.error('⚠️ Forced shutdown: timeout exceeded');
    process.exit(1);
  }, 30000); // 30 second timeout

  try {
    // Stop accepting new connections
    if (server) {
      console.log('🛑 Closing HTTP server (no new connections)...');
      await new Promise((resolve) => {
        server.close(() => {
          console.log('✅ HTTP server closed');
          resolve();
        });
      });
    }

    // Close active connections
    console.log(`🔌 Closing ${activeConnections.size} active connections...`);
    for (const socket of activeConnections) {
      socket.destroy();
    }

    // Close database pool
    await closePool();

    clearTimeout(shutdownTimeout);
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// Start server function
async function startServer() {
  try {
    // Initialize database with retries
    await initializePool();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });

    // Track connections for graceful shutdown
    server.on('connection', (socket) => {
      activeConnections.add(socket);
      socket.on('close', () => {
        activeConnections.delete(socket);
      });
    });

    // Handle graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Continue running but log the error
});

// Start the server
startServer();

module.exports = { app, startServer, gracefulShutdown };
