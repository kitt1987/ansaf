'use strict';

const RedisStorage = require('./redis');
const ANSAF = require('ansaf');
const fs = require('fs');
const path = require('path');

function installMiddleware(ansaf) {
  const MiddlewareDir = 'middleware';
  fs.readdirSync(MiddlewareDir)
    .filter((f) => f[0] !== '.' && f.endsWith('.js'))
    .map((f) => path.basename(f, '.js'))
    .map((middleware) => {
      var M = require('./' + path.relative(path.dirname(module.filename),
        path.join(MiddlewareDir, middleware)));
      ansaf.middleware.use(middleware, new M(ansaf));
    });
}

ANSAF.init()
  .then((ansaf) => {
    ansaf.config.use(require('./config/args.js'));

    var redis = new RedisStorage();
    ansaf.cache.use(redis);
    ansaf.cache.use('transaction', redis.createTransaction.bind(redis));

    installMiddleware(ansaf);

    var server = require('./rpc').createServer(ansaf);
    ansaf.rpc.use('loop', server.loop.bind(server));
    ansaf.rpc.go();
  })
  .catch((err) => console.error(err));
