'use strict';

const SERVER_LOOP_KEY = 'loop';

class RPC {
  runInTransaction(nativeHandle) {
    if (!nativeHandle || !nativeHandle.prototype)
      throw new Error('Arrow function cant work as native handler.');

    var self = this;
    return function(...rpcArgs) {
      self.cache.createTransaction(nativeHandle)
        .then((transaction) => {
          Object.assign(transaction, self);
          return transaction.run.apply(transaction, rpcArgs);
        });
    };
  }

  run(nativeHandle) {
    if (!nativeHandle || !nativeHandle.prototype)
      throw new Error('Arrow function cant work as native handler.');

    var self = this;
    return function(...rpcArgs) {
      return nativeHandle.apply(self, rpcArgs);
    };
  }

  go() {
    if (!this[SERVER_LOOP_KEY] || typeof this[SERVER_LOOP_KEY] !== 'function')
      throw new Error('The server loop must be a function without arguments');
    this.runtime.debug('RPC server loops');
    return this[SERVER_LOOP_KEY].bind(this);
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
    if (key === SERVER_LOOP_KEY && typeof obj !== 'function') {
      throw new Error(
        'The server loop must be a function without arguments'
      );
    }

    this[key] = obj;
  }
}

module.exports = RPC;
