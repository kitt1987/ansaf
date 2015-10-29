'use strict';

module.exports = CacheThenEcho;

function CacheThenEcho() {

}

CacheThenEcho.prototype.init = function() {
  this.key = this.cache.newKey('CacheThenEcho');
  this.cacheKey = this.key.createSingleKey().key();
};

CacheThenEcho.prototype.cecho = function(o) {
  var cached = this.cache.local.get(this.cacheKey);
  this.cache.local.save(this.cacheKey, o);
  return this.echo.echo(cached + o);
};
