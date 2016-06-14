'use strict';

var express = require('express');

const KEY = 'IncrementKey';
const KEY2 = 'IncrementKey2';

class IncrementService {
  constructor(ansaf, router) {
    this.router = express.Router();
    this.router.post('/', ansaf.rpc.runInTransaction(function(req, res) {
      return this.get(KEY)
        .then((obj) => {
          if (typeof obj !== 'number') return this.save(KEY, 0);
          console.log('Save ' + KEY + ':' + (obj + 1));
          return this.update(KEY, obj + 1);
        })
        .then(() => this.get(KEY2))
        .then((obj) => {
          if (typeof obj !== 'number') return this.save(KEY2, 0);
          console.log('Save ' + KEY2 + ':' + (obj + 1));
          return this.update(KEY2, obj + 1);
        })
        .then(() => this.commit((objs) => {
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
