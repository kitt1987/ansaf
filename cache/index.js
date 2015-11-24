'use strict';

var Memory = require('./memory');
var CacheKey = require('./key');
var util = require('../utility');
var path = require('path');

module.exports = Cache;

function Cache() {
}

Cache.prototype.init = function() {
  this.cacheKeys = {};
  this.local = new Memory();
  Object.keys(this).filter(k => k !== 'local').forEach(k => this.local[k] = this[k]);
  this.local.init();
  var customCache = path.join(path.dirname(module.filename), '../../../cache');
  var init = require('./' + path.relative(path.dirname(module.filename), customCache));

  return new Promise((resolve, reject) => {
    if (init.createORM) {
      resolve(init.createORM.call(this));
      return;
    }

    resolve();
  })
  .then(orm => this.orm = orm)
  .then(() => {
    if (init.createUniversalCache) {
      var cache = init.createUniversalCache.call(this);
      if (cache) {
        if (cache instanceof Promise) {
          return cache.then(cache => this.cache = cache);
        } else {
          this.cache = cache;
        }
      }
    }
  })
  .then(cache => this.cache = cache);
};

Cache.prototype.newKey = function(schemaName) {
  var key = this.cacheKeys[schemaName];
  if (key) return key;
  key = new CacheKey(schemaName);
  this.cacheKeys[schemaName] = key;
  return key;
};

// interfaces of Cache save/get/update/delete
// interfaces of ORM query/new/update

Cache.prototype.save = function(schema, value, cacheKey, expiry) {
  // new permanent data
  // and/or new cache entry
};

Cache.prototype.get = function(schema, cacheKey) {
  // load from cache or permanent layer
};

Cache.prototype.update = function(schema, value, cacheKey) {
  // update permanent layer
  // update all cache entries or flush them
};

Cache.prototype.delete = function(schema, cacheKey) {
  // delete permanent data
  // delete all cache entries
};

Cache.prototype.flush = function(cacheKey) {
  // flush cache cacheKey indicate to
};
