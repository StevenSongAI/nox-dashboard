// Entry point for Nox Dashboard backend
const { app } = require('./app');
const logger = require('./utils/logger');
const { initializePool, checkDatabaseHealth } = require('./config/database');

const PORT = process.env.PORT || 3001;
const MAX_RETRIES = 30;
const RETRY_DELAY = 3000; // 3 seconds

// Initialize database and start server with retry logic
async function startServer() {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // Check database health first
      const health = await checkDatabaseHealth();
      
      if (health.connected) {
        logger.info('Database connection verified');
        
        // Start the server
        app.listen(PORT, () => {
          logger.info(`Server running on port ${PORT}`);
        });
        return; // Success - exit the function
      } else {
        throw new Error('Database health check failed');
      }
    } catch (err) {
      retries++;
      logger.error(`Server start attempt ${retries}/${MAX_RETRIES} failed:`, err.message);
      
      if (retries < MAX_RETRIES) {
        logger.info(`Waiting ${RETRY_DELAY}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        logger.error('Max retries reached. Starting server without database (healthcheck will fail)');
        // Start server anyway - healthcheck will fail but logs will be visible
        app.listen(PORT, () => {
          logger.info(`Server running on port ${PORT} (database unavailable)`);
        });
      }
    }
  }
}

startServer();

module.exports = app;