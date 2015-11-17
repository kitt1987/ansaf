'use strict';

var Memory = require('./memory');
var CacheKey = require('./key');
var util = require('../utility');

module.exports = Cache;

function Cache() {
}

Cache.prototype.init = function() {
  this.cacheKeys = {};
  this.local = new Memory();
  Object.keys(this).filter(k => k !== 'local').forEach(k => this.local[k] = this[k]);
  this.local.init();
};

Cache.prototype.newKey = function(schemaName) {
  var key = this.cacheKeys[schemaName];
  if (key) return key;
  key = new CacheKey(schemaName);
  this.cacheKeys[schemaName] = key;
  return key;
};

Cache.prototype.save = function() {

};

Cache.prototype.get = function() {

};

Cache.prototype.update = function() {

};

Cache.prototype.delete = function() {

};
