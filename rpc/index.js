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
  var self = this;
  var rpcHandle = function() {
    var transaction = self.cache.createTransaction(nativeHandle);
    Object.assign(transaction, self);
    return transaction.run.apply(transaction, arguments);
  };

  return rpcHandle;
};

RPC.prototype.loop = function() {
  this.runtime.debug('RPC server loops on ' + this.config.rpc.port + '.');
  this.server.loop(this.config.rpc.port);
};
