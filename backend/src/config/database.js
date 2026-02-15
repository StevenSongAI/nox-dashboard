const { Pool } = require('pg');

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000,  // Start with 1 second
  maxDelay: 30000,  // Cap at 30 seconds
};

// Calculate exponential backoff delay
function getRetryDelay(attempt) {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

// Create pool with initial config (will retry on connection failures)
let pool;

async function createPoolWithRetry() {
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const newPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000, // Increased for cloud environments
      });

      // Test the connection
      const client = await newPool.connect();
      await client.query('SELECT NOW() as time');
      client.release();

      console.log(`✅ PostgreSQL connected on attempt ${attempt + 1}`);
      
      // Set up error handling
      newPool.on('error', (err) => {
        console.error('❌ PostgreSQL pool error:', err.message);
      });

      newPool.on('connect', () => {
        console.log('✅ New PostgreSQL client connected to pool');
      });

      return newPool;
    } catch (err) {
      const delay = getRetryDelay(attempt);
      console.error(`❌ Database connection attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries} failed: ${err.message}`);
      
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Fatal: Max database retry attempts exceeded');
        throw new Error(`Database connection failed after ${RETRY_CONFIG.maxRetries} attempts: ${err.message}`);
      }
    }
  }
}

// Initialize pool
async function initializePool() {
  if (!pool) {
    pool = await createPoolWithRetry();
  }
  return pool;
}

// Query-level retry wrapper for transient errors
async function withRetry(operation, context = 'database operation') {
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (err) {
      // Only retry on connection/transient errors
      const isRetryable = 
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        err.code === '08006' || // connection_failure
        err.code === '08003' || // connection_does_not_exist
        err.code === '08001' || // sqlclient_unable_to_establish_sqlconnection
        err.code === '08004' || // sqlserver_rejected_establishment_of_sqlconnection
        err.code === '40001' || // serialization_failure
        err.code === '40P01' || // deadlock_detected
        err.code === '55P03' || // lock_not_available
        err.message?.includes('Connection terminated unexpectedly');

      if (!isRetryable || attempt === RETRY_CONFIG.maxRetries - 1) {
        throw err;
      }

      const delay = getRetryDelay(attempt);
      console.warn(`⚠️ ${context} failed (attempt ${attempt + 1}), retrying in ${delay}ms: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Health check function with retry
async function checkDatabaseHealth() {
  return withRetry(async () => {
    const result = await pool.query('SELECT NOW() as time');
    return { connected: true, time: result.rows[0].time };
  }, 'database health check').catch(err => {
    return { connected: false, error: err.message };
  });
}

// Query helper with built-in retry
async function query(text, params) {
  return withRetry(async () => {
    const result = await pool.query(text, params);
    return result;
  }, 'database query');
}

// Get client from pool with retry
async function getClient() {
  return withRetry(async () => {
    const client = await pool.connect();
    return client;
  }, 'get database client');
}

// Graceful pool shutdown
async function closePool() {
  if (pool) {
    console.log('📊 Closing database pool...');
    await pool.end();
    console.log('✅ Database pool closed');
    pool = null;
  }
}

// Export for use in other modules
module.exports = { 
  pool: new Proxy({}, {
    get: (target, prop) => {
      if (!pool) {
        throw new Error('Database pool not initialized. Call initializePool() first.');
      }
      if (prop === 'query') {
        return query;
      }
      return pool[prop];
    }
  }),
  initializePool,
  createPoolWithRetry,
  withRetry,
  checkDatabaseHealth,
  query,
  getClient,
  closePool,
  RETRY_CONFIG
};
