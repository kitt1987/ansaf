'use strict';

var path = require('path');

module.exports = RPC;

function RPC() {
}

RPC.prototype.init = function() {
  var customRPC = path.join(path.dirname(module.filename), '../../../rpc');
  var init = require('./' + path.relative(path.dirname(module.filename), customRPC));
  var server = init.createServer.call(this);
  if (!server) throw new Error('You should return an instance of RPC server from RPC initial');
  if (server instanceof Promise) return server.then(s => this.server = s);
  this.server = server;
};

RPC.prototype.loop = function() {
  this.server.loop(1234);
};
