'use strict';

const SERVER_LOOP_KEY = 'loop';
const util = require('./utility');

class RPC {
  runInTransaction(nativeHandler) {
    if (!nativeHandler)
      throw new Error('The native handler must be function.');

    var self = this;
    return function(...rpcArgs) {
      self.cache.createTransaction(nativeHandler)
        .then((transaction) => {
          Object.keys(self).filter((k) => k !== 'cache')
            .forEach((k) => transaction[k] = self[k]);
          return transaction.run.apply(transaction, rpcArgs);
        });
    };
  }

  run(nativeHandler) {
    if (!nativeHandler)
      throw new Error('The native handler must be function.');

    var self = this;
    return function(...rpcArgs) {
      nativeHandler = nativeHandler.bind(null, self);
      return nativeHandler.apply(null, rpcArgs);
    };
  }

  go() {
    if (!this[SERVER_LOOP_KEY] || typeof this[SERVER_LOOP_KEY] !== 'function')
      throw new Error('The server loop must be a function without arguments');
    this.runtime.debug('RPC server loops');
    return this[SERVER_LOOP_KEY].bind(this);
  }

  use(key, obj) {
    util.use(this, key, obj);
  }
}

module.exports = RPC;
