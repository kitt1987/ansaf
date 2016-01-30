'use strict';

var winston = require('winston');
var path = require('path');

module.exports = Logger;

function Logger() {
}

Logger.prototype.init = function() {
  this.enableDebug = this.config.runtime.debug;
  var logDir = this.config.runtime.logDir;
  if (!logDir) {
    if (this.enableDebug) winston.level = 'debug';
		this.logger = winston;
		return;
	}

  var transports = [
    enableLog(logDir, 'error'),
    enableLog(logDir, 'warn'),
    enableLog(logDir, 'info')
  ];

  if (this.enableDebug) transports.push(enableLog(logDir, 'debug'));

	this.logger = new(winston.Logger)({ transports });
};

Logger.prototype.debug = function(t) {
  if (!this.enableDebug) return;
  if (this.logger) {
    this.logger.log('debug', t);
  } else {
    console.trace(t);
  }
};

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
		filename: path.join(dir, path.basename(process.argv[1], '.js') + '.' + process.pid + '.' + level),
		maxsize: 10485760, // 10M
		maxFiles: 10,
		depth: 3,
		tailable: true,
		zippedArchive: true,
		humanReadableUnhandledException: true,
    handleExceptions: true,
	});
}
