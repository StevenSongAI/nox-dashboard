/**
 * Database Configuration
 * 
 * DEFECT-004 FIX: Pool proxy properly exposes end() method
 * RAILWAY FIX: Added connection retry logic for service startup
 */
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection not established
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // DEFECT-RT-004 FIX: Use valid exit code (1 instead of -1)
  process.exit(1);
});

// RAILWAY FIX: Aggressive retry connection for Railway's 60s healthcheck window
async function testConnectionWithRetry(maxRetries = 30, baseDelay = 500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      console.log(`Database connected successfully on attempt ${attempt}`);
      client.release();
      return true;
    } catch (err) {
      // Fixed 500ms delay - no exponential backoff, just rapid retry
      console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${baseDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, baseDelay));
      } else {
        console.error('Max retries reached. Could not connect to database.');
        throw err;
      }
    }
  }
  return false;
}

// Test connection on startup with retry
testConnectionWithRetry().catch(err => {
  console.error('Fatal: Could not establish database connection after retries:', err.message);
  // Don't exit here - let the application decide how to handle this
});

// DEFECT-004 FIX: Export pool directly so all methods (including end()) are accessible
// Instead of using a proxy that might hide methods, we export the pool directly
// and provide a query helper that maintains the same API

module.exports = {
  // Direct pool access - all methods including end() are available
  pool,
  
  // Query helper for convenience
  query: (text, params) => pool.query(text, params),
  
  // Get client helper for transactions
  getClient: async () => {
    const client = await pool.connect();
    return client;
  },
  
  // Initialize pool - no-op since pool is created on startup
  initializePool: async () => {
    // Pool is already initialized, just verify connection
    const client = await pool.connect();
    client.release();
    return true;
  },
  
  // Close pool for graceful shutdown
  closePool: async () => {
    await pool.end();
  },
  
  // Check database health
  checkDatabaseHealth: async () => {
    try {
      const result = await pool.query('SELECT NOW()');
      return { connected: true, timestamp: result.rows[0].now };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  }
};
