'use strict';

var http = require('http');
var url = require('url');

//return a Promise if you need a async-initial.
exports.createServer = function() {
  var server = http.createServer((req, res) => {
    if (req.method !== 'GET') {
      res.statusCode = 404;
      res.end();
      return;
    }

    var $ = url.parse(req.url);
    var pathname = $.pathname;
    var query = $.query;
    switch (pathname) {
      case '/echo':
        res.end(this.middleware.echo.echo(query));
        break;

      case '/cecho':
        res.end(this.middleware.cacheThenEcho.cecho(query));
        break;

      default:
        this.runtime.error('No path ' + pathname);
        res.statusCode = 404;
        res.end();
    }
  });

  this.runtime.on('exit', server.close.bind(server));
  server.loop = (port) => server.listen(port);
  return server;
};
