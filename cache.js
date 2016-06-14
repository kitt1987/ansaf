'use strict';

const Memory = require('./cache/memory');
const CacheKey = require('./cache/key');
const util = require('./utility');

const TRANSACTION_KEY = 'transaction';

class Cache {
  constructor() {
    this.cacheKeys = {};
  }

  init() {
    this.local = new Memory();
    Object.keys(this).filter((k) => k !== 'local').forEach(
      (k) => this.local[k] = this[k]
    );
    this.local.init();
  }

  newKey(prefix) {
    var key = this.cacheKeys[prefix];
    if (key) return key;
    key = new CacheKey(prefix);
    this.cacheKeys[prefix] = key;
    return key;
  }

  createTransaction(nativeHandler) {
    if (!this[TRANSACTION_KEY] || typeof this[TRANSACTION_KEY] !== 'function')
      throw new Error('A transaction creator is required.');
    return this[TRANSACTION_KEY](nativeHandler);
  }

  use(key, obj) {
    util.use(this, key, obj);
  }
}

module.exports = Cache;
