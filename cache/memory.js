'use strict';

exports = module.exports = Memory;

function Memory() {
	this.cache = {};
}

Memory.prototype.init = function() {
	this.runtime.setInterval(() => {
		var now = Date.now();
		Object.keys(this.cache).forEach(k => {
			var v = this.cache[k];
			if (v && v.expiry && v.expiry < now) this.cache[k] = null;
		});
	}, this.config.cache.recycle);
};

Memory.prototype.save = function(key, object, expiry) {
	if (!key || typeof key !== 'string') throw new Error('Invalid cache key');
	if (expiry && typeof expiry !== 'number') throw new Error('Invalid expiry ' + expiry);

	var valueSaved = this.cache[key];
	if (valueSaved) {
		valueSaved.value = object;
	} else {
		var now = Date.now();
		this.cache[key] = {
			updateTs: now,
			value: object,
			expiry: now + (expiry ? expiry : this.config.cache.defaultLife), // for 1 day
		};
	}
};

Memory.prototype.get = function(key) {
	if (!key || typeof key !== 'string') throw new Error('Invalid cache key');
	var valueSaved = this.cache[key];
	if (!valueSaved) return;
	valueSaved.updateTs = Date.now();
	return valueSaved.value;
};

Memory.prototype.delete = function(key) {
	if (!key || typeof key !== 'string') throw new Error('Invalid cache key');
	if (!this.cache[key]) return;
	this.cache[key] = null;
};
