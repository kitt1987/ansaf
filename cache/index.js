'use strict';

var Memory = require('./memory');
var CacheKey = require('./key');
var util = require('../utility');

module.exports = Cache;

function Cache() {
}

Cache.prototype.init = function() {
  this.local = new Memory();
  Object.keys(this).filter(k => k !== 'local').forEach(k => this.local[k] = this[k]);
  this.local.init();
};

Cache.prototype.newKey = function(symbol) {
  return new CacheKey(symbol);
};
