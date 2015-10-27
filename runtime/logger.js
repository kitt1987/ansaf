'use strict';

var winston = require('winston');
var path = require('path');

module.exports = Logger;

function Logger() {
}

Logger.prototype.init = function() {
  this.debug = this.config.runtime.debug;
  var logDir = this.config.runtime.logDir;
  if (!logDir) {
		this.logger = winston;
		return;
	}

  var transports = [
    enableLog(logDir, 'error'),
    enableLog(logDir, 'warn'),
    enableLog(logDir, 'info')
  ];

  if (this.debug) transports.push(enableLog(logDir, 'debug'));

	this.logger = new(winston.Logger)({ transports });
};

Logger.prototype.debug = function(t) {
  if (!this.debug) return;
  if (this.logger) {
    this.logger.debug(t);
  } else {
    console.trace(t);
  }
};

['info', 'warn', 'error'].map(l => {
	Logger.prototype[l] = (t) => {
		if (this.logger) {
			this.logger[l].call(this.logger, t);
		} else {
			console[l].call(console, t);
		}
	};
});

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
