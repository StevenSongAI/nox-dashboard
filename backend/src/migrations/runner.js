const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

// Create migrations tracking table
async function initMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
  return result.rows.map(row => row.filename);
}

// Run a single migration
async function runMigration(filename) {
  const filepath = path.join(__dirname, '../../migrations', filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  
  console.log(`Running migration: ${filename}`);
  
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
    await pool.query('COMMIT');
    console.log(`✅ ${filename} completed`);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(`❌ ${filename} failed:`, err.message);
    throw err;
  }
}

// Run all pending migrations
async function migrate() {
  try {
    await initMigrationsTable();
    
    const executed = await getExecutedMigrations();
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files`);
    console.log(`Executed: ${executed.length}`);
    
    for (const file of files) {
      if (!executed.includes(file)) {
        await runMigration(file);
      } else {
        console.log(`⏭️  ${file} already executed`);
      }
    }
    
    console.log('✅ All migrations complete');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
