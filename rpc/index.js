'use strict';

var http = require('http');
var url = require('url');

module.exports = RPC;

function RPC() {
}

RPC.prototype.init = function() {
  this.server = http.createServer((req, res) => {
    if (req.method !== 'GET') {
      res.statusCode = 404;
      res.end();
      return;
    }

    var $ = url.parse(req.url);
    var pathname = $.pathname;
    var query  = $.query;
    switch(pathname) {
      case '/echo':
        res.end(this.middleware.echo.echo(query));
        break;

      case '/cecho':
        res.end(this.middleware.cacheThenEcho.cecho(query));
        break;

      default:
        res.statusCode = 404;
        res.end();
    }
  });
  this.runtime.on('exit', this.server.close.bind(this.server));
};

RPC.prototype.loop = function() {
  this.server.listen(1234);
};
