'use strict';

const util = require('./utility');

class Middleware {
  constructor() {
    Object.defineProperty(this, 'keys', {
      enumerable: false,
      configurable: false,
      writable: true
    });
  }

  use(key, obj) {
    util.use(this, key, obj);
  }
}

module.exports = Middleware;
