'use strict';

var express = require('express');

const KEY = 'IncrementKey';

class IncrementService {
  constructor(rpc) {
    this.router = express.Router();
    this.router.post('/', rpc.runInTransaction(function(req, res) {
      this.get(KEY)
        .then((obj) => {
          if (typeof obj !== 'number') return this.save(KEY, 0);
          return this.update(KEY, obj + 1);
        })
        .then(() => this.commit())
        .then((objs) => {
          var reply = 'nothing';
          if (objs) reply = JSON.stringify(objs[KEY]);
          res.end(reply);
        });
    }));

    rpc.mainRouter.use('/increase', this.router);
  }
}

module.exports = IncrementService;
