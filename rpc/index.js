'use strict';

var path = require('path');

module.exports = RPC;

function RPC() {}

RPC.prototype.init = function() {
  var customRPC = path.join(path.dirname(module.filename), '../../../rpc');
  var init = require('./' + path.relative(path.dirname(module.filename),
    customRPC));
  var server = init.createServer.call(this);
  if (!server)
    throw new Error('You have to create a RPC server.');
  if (server instanceof Promise) return server.then((s) => this.server = s);
  this.server = server;
  this.runtime.debug('RPC initial DONE.');
};

RPC.prototype.runInTransaction = function(nativeHandle) {
  if (!nativeHandle || !nativeHandle.prototype)
    throw new Error('An arrow function cant work as native handler.');

  var self = this;
  var rpcHandle = function(...rpcArgs) {
    self.cache.createTransaction(nativeHandle)
      .then((transaction) => {
        Object.assign(transaction, self);
        return transaction.run.apply(transaction, rpcArgs);
      });
  };

  return rpcHandle;
};

RPC.prototype.loop = function() {
  this.runtime.debug('RPC server loops on ' + this.config.rpc.port + '.');
  this.server.loop(this.config.rpc.port);
};
