'use strict';

var express = require('express');

class EchoService {
  constructor(ansaf, router) {
    this.router = express.Router();
    this.router.get('/', ansaf.rpc.run((context, req, res) => {
      res.end(JSON.stringify(req.query));
    }));

    router.use('/echo', this.router);
  }
}

module.exports = EchoService;
