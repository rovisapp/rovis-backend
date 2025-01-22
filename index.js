const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./logger/logger');
const { logError, isOperationalError } = require('./errorHandler/errorHandler');
const { getMapsApiUsage } = require('./services/gUsageActuals');
const pool = require('./db/config'); 


const app = express();
const port = 3070;
let server; // To store server instance for graceful shutdown

// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
// const allowedOrigins = ['http://localhost:80', 'http://localhost'];

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  logger.info('Root / route');
  res.send('App works!!!!!');
});

app.use('/api', require('./routes/routes'));

// request to handle undefined or all other routes
app.get('*', (req, res) => {
  logger.info('route undefined');
  res.send('route undefined');
});

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  logger.info(`${signal} signal received: closing HTTP server`);
  
  try {
    // Close HTTP Server
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
      });
    }

    // If you have database pool
    if (global.pg_pool) {
      await global.pg_pool.end();
      logger.info('Database pool closed');
    }

    // Wait a bit for existing requests to complete
    setTimeout(() => {
      logger.info('Process terminated');
      process.exit(0);
    }, 1000);
  } catch (err) {
    logger.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  throw error;  // This will then trigger uncaughtException
});

process.on('uncaughtException', (error) => {
  // console.error(error)
  // Log the full error object, including stack trace
  // logger.error('Uncaught Exception:', {
  //   message: error.message,
  //   name: error.name,
  //   stack: error.stack, // This captures the complete stack trace
  //   // Additional error properties you might want to log
  //   code: error.code,
  //   errno: error.errno,
  //   syscall: error.syscall,
  //   path: error.path
  // });
   logError(`Uncaught Exception \n ${error.stack || error.message}`);
  if (!isOperationalError(error)) {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

// Graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Store server instance instead of just calling app.listen
server = app.listen(port, (err) => {
  logger.info(`running server on from port:::::::${port}`);
  getMapsApiUsage();
  if (err) {
    logger.error(`server launch returned error : ${err}`);
  }
});