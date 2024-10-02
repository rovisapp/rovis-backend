/* eslint-disable new-cap */
const winston = require('winston');
const path = require('path');
// require('winston-syslog').Syslog;

/** *************************************************
 * Set up Winston Logger defaults
 */
module.exports = new winston.createLogger({
  format: winston.format.errors({ stack: true }),
  transports: [
    // new winston.transports.Syslog(),
    // logging to syslog Doesnt work - just use forever to log all console logs to a custom file
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.label({
          label: path.basename(process.mainModule.filename),
        }),
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({
          fillExcept: ['message', 'level', 'timestamp', 'label'],
        }),
        winston.format.align(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`,
        ),
      ),
    }),
  ],
});
