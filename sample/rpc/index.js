'use strict';

const fs = require('fs');
const path = require('path');
var http = require('http');
var express = require('express');

exports.createServer = function() {
  this.mainRouter = express();

  fs.readdirSync('rpc')
    .filter((f) => f[0] !== '.' && f.endsWith('.js') &&
      f !== 'index.js')
    .map((f) => {
      const Service = require('./' + path.basename(f));
      new Service(this);
    });

  var server = http.createServer(this.mainRouter);

  this.runtime.on('exit', server.close.bind(server));
  server.loop = (port) => server.listen(port);
  return server;
};
