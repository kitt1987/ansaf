'use strict';

var Memory = require('./memory');
var CacheKey = require('./key');
var path = require('path');

module.exports = Cache;

function Cache() {}

Cache.prototype.init = function() {
  this.cacheKeys = {};
  this.local = new Memory();
  Object.keys(this).filter((k) => k !== 'local').forEach(
    (k) => this.local[k] = this[k]
  );
  this.local.init();
  var customCache = path.join(path.dirname(module.filename), '../../../cache');
  var init = require('./' + path.relative(
    path.dirname(module.filename), customCache));

  return new Promise(
      (resolve, reject) => {
        if (init.createStorage) {
          var storage = init.createStorage.call(this);
          if (!storage)
            this.warn(
              'You didnt create any storage, so just local cache is available.'
            );
          if (storage) {
            if (storage instanceof Promise) {
              resolve(storage.then((storage) => this.storage = storage));
              return;
            }
          }

          this.storage = storage;
          resolve();
        }
      });
};

Cache.prototype.newKey = function(schemaName) {
  var key = this.cacheKeys[schemaName];
  if (key) return key;
  key = new CacheKey(schemaName);
  this.cacheKeys[schemaName] = key;
  return key;
};

Cache.prototype.get = function(key, schema) {
  if (!this.storage) throw new Error('You didnt create any storage!');
  return this.storage.get(key, schema);
};

Cache.prototype.createTransaction = function() {
  return this.storage.createTransaction(this);
};
