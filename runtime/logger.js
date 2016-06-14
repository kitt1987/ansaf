'use strict';

var winston = require('winston');
const path = require('path');

const DEBUG_LABEL = 'ansaf:D';

module.exports = Logger;

function Logger() {}

Logger.prototype.init = function() {
  const logDir = this.config.runtime.logDir;
  var transports;
  if (logDir) {
    transports = [
      enableLog(logDir, 'error'),
      enableLog(logDir, 'warn'),
      enableLog(logDir, 'info')
    ];
  }

  if (process.env['DEBUG'].includes(DEBUG_LABEL)) {
    console.log('In DEBUG mode!');
    winston.level = 'debug';
    if (logDir) transports.push(enableLog(logDir, 'debug'));
    this.debug = (t) => this.logger.log('debug', t);
  }

  if (transports) {
    this.logger = new(winston.Logger)({
      transports
    });
  } else {
    this.logger = winston;
  }

};

Logger.prototype.debug = function(t) {};

Logger.prototype.info = function(t) {
  this.saveLog('info', t);
};

Logger.prototype.warn = function(t) {
  this.saveLog('warn', t);
};

Logger.prototype.error = function(t) {
  this.saveLog('error', t);
};

Logger.prototype.saveLog = function(level, t) {
  if (this.logger) {
    this.logger[level].call(this.logger, t);
  } else {
    console[level].call(console, t);
  }
};

function enableLog(dir, level) {
  return new(winston.transports.File)({
    name: level,
    level: level,
    filename: path.join(dir, path.basename(process.argv[1], '.js') + '.' +
      process.pid + '.' + level),
    maxsize: 10485760, // 10M
    maxFiles: 10,
    depth: 3,
    tailable: true,
    zippedArchive: true,
    humanReadableUnhandledException: true,
    handleExceptions: true,
  });
}
