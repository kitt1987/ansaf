'use strict';

module.exports = {
  before: function(t) {
    Promise.resolve(require('../launcher').init('test'))
      .then((whole) => {
        t.whole = whole;
        t.app = whole.rpc.server;
        t.done();
      }).catch((err) => {
        console.log(err.stack);
      });
  },
  after: function(t) {
    if (t.whole) t.whole.runtime.halt();
    t.done();
  },
};
