'use strict';

module.exports = {
  runtime: {
    debug: false,
    lifeline: '/tmp',
    worker: 0,
    user: 'freeman',
    hotConfig: true
  },
  cache: {
    debug: false,
    recycle: 300000,
    defaultLife: 86400000
  },
  rpc: {
    port: 1234
  }
};
