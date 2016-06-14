'use strict';

module.exports = CacheThenEcho;

class CacheThenEcho {
  constructor(context) {
    this.key = context.cache.newKey('CacheThenEcho');
    this.cacheKey = this.key.individualKey();
  }
}

CacheThenEcho.prototype.cecho = function(o) {
  if (!o) return this.echo.echo(o);
  var cached = this.cache.local.get(this.cacheKey());
  this.cache.local.save(this.cacheKey(), o);
  return this.echo.echo(cached + o);
};
