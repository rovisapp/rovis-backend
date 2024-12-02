const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./logger/logger');
const { logError, isOperationalError } = require('./errorHandler/errorHandler');
const {getMapsApiUsage} = require('./services/gUsageActuals');

const app = express();
const port = 3070;

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

// if the Promise is rejected this will catch it
process.on('unhandledRejection', (error) => {
  throw error;
});

process.on('uncaughtException', (error) => {
  logError(JSON.stringify(error));

  if (!isOperationalError(error)) {
    process.exit(1);
  }
});

app.listen(port, (err) => {
  logger.info(`running server on from port:::::::${port}`);
  getMapsApiUsage();
  if (err) {
    logger.error(`server launch returned error : ${err}`);
  }
});
