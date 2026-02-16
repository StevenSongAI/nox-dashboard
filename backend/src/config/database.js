/**
 * Database Configuration
 * 
 * DEFECT-004 FIX: Pool proxy properly exposes end() method
 */
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection not established
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // DEFECT-RT-004 FIX: Use valid exit code (1 instead of -1)
  process.exit(1);
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
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
      return { healthy: true, timestamp: result.rows[0].now };
    } catch (err) {
      return { healthy: false, error: err.message };
    }
  }
};
