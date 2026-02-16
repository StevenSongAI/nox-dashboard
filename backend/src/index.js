// Entry point for Nox Dashboard backend
const { app } = require('./app');
const logger = require('./utils/logger');
const { initializePool } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database pool first
    await initializePool();
    logger.info('Database pool initialized');
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;