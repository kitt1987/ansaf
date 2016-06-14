'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');

exports.createServer = function(ansaf) {
  this.mainRouter = express();

  fs.readdirSync('rpc')
    .filter((f) => f[0] !== '.' && f.endsWith('.js') &&
      f !== 'index.js')
    .map((f) => {
      const Service = require('./rpc/' + path.basename(f));
      new Service(ansaf, this.mainRouter);
    });

  var server = http.createServer(this.mainRouter);

  ansaf.runtime.on('exit', server.close.bind(server));
  server.loop = () => server.listen(4321);
  return server;
};
