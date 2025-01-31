require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../logger/logger');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
   max: 20, // maximum number of clients in the pool
   idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
   connectionTimeoutMillis: 10000, // how long to wait when connecting to a new client

});

// Log any pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

pool.cleanDatabasePool = async function() {
  try {
    console.log('Closing database pool...');
    await this.end();
    console.log('Database pool successfully closed');
  } catch (dbError) {
    console.error('Error while closing database pool:', dbError);
  }
};


// Make pool available globally
// global.pg_pool = pool;

module.exports = pool;