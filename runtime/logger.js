'use strict';

var winston = require('winston');
var path = require('path');

module.exports = Logger;

function Logger(whole) {
}

Logger.prototype.init = function(whole) {
  if (!whole.config.logDir) {
		this.logger = winston;
		return;
	}

	this.logger = new(winston.Logger)({
		transports: [
			enableLog(whole.config.logDir, 'error'),
			enableLog(whole.config.logDir, 'warn'),
			enableLog(whole.config.logDir, 'info')
		]
	});
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
