'use strict';

var express = require('express');

const KEY = 'IncrementKey';
const KEY2 = 'IncrementKey2';

class IncrementService {
  constructor(ansaf, router) {
    this.router = express.Router();
    this.router.post('/', ansaf.rpc.runInTransaction(
      (context, req, res) => {
        return context.middleware.increment.increase(context, KEY)
          .then((obj) => context.middleware.increment.increase(context, KEY2))
          .then(() => context.commit((objs) => {
            var reply = 'nothing';
            if (objs) reply = JSON.stringify(objs);
            console.log('Reply ' + reply);
            res.end(reply);
          }));
      }));

    router.use('/increase', this.router);
  }
}

module.exports = IncrementService;
