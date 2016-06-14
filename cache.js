'use strict';

const Memory = require('./cache/memory');
const CacheKey = require('./cache/key');

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
    if (typeof key !== 'string') {
      if (obj) throw new Error('The key must be a string');
      var transformer = {key};
      Object.keys(transformer).forEach((k) => {
        key = k;
        obj = transformer[k];
      });
    }

    if (this[key]) throw new Error('Sth with key ' + key + ' exists!');
    if (key === TRANSACTION_KEY && typeof obj !== 'function') {
      throw new Error(
        'Transaction must be a function with an argument as nativeHandler'
      );
    }

    if (typeof obj === 'object') {
      Object.assign(obj, this);
    }

    this[key] = obj;
  }
}

module.exports = Cache;
