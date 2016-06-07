'use strict';

var express = require('express');

class EchoService {
  constructor(rpc) {
    this.router = express.Router();
    this.router.get('/', (req, res) => {
      res.end(JSON.stringify(req.query));
    });

    rpc.mainRouter.use('/echo', this.router);
  }
}

module.exports = EchoService;
