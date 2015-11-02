'use strict';

var request = require('supertest');

module.exports = {
  newCommodityCategory: function(t) {
    var text = '12345=abcd';

    request(t.app)
      .get('/echo?' + text)
      .expect(200)
      .end((err, reply) => {
        t.nothing(err);
        t.eq(reply.text, text);
        t.done();
      });
  },
};
