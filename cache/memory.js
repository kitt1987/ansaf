'use strict';

class Memory {
  constructor() {
    this.cache = {};
  }

  init() {
    this.runtime.setInterval(() => {
      var now = Date.now();
      Object.keys(this.cache).forEach((k) => {
        var v = this.cache[k];
        if (v && v.expiry && v.expiry < now) this.cache[k] = null;
      });
    }, this.config.cache.recycle);
  }

  save(key, object, expiry) {
    if (!key || typeof key !== 'string') throw new Error('Invalid cache key');
    if (expiry && typeof expiry !== 'number')
      throw new Error('Invalid expiry ' + expiry);

    var valueSaved = this.cache[key];
    if (valueSaved) {
      valueSaved.value = object;
    } else {
      var now = Date.now();
      this.cache[key] = {
        updateTs: now,
        value: object,
        expiry: now + (expiry ? expiry : this.config.cache.defaultLife),
      };
    }
  }

  get(key) {
    if (!key || typeof key !== 'string') throw new Error('Invalid cache key');
    var valueSaved = this.cache[key];
    if (!valueSaved) return;
    valueSaved.updateTs = Date.now();
    return valueSaved.value;
  }

  delete(key) {
    if (!key || typeof key !== 'string') throw new Error('Invalid cache key');
    if (!this.cache[key]) return;
    this.cache[key] = null;
  }
}

module.exports = Memory;
