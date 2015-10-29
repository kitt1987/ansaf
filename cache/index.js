'use strict';

var Memory = require('./memory');
var CacheKey = require('./key');

module.exports = Cache;

function Cache() {
}

Cache.prototype.init = function() {
  var local = new Memory();
  Object.assign(local, this);
  local.init();
  this.local = local;
};

Cache.prototype.newKey = function(symbol) {
  return new CacheKey(symbol);
};
