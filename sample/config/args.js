'use strict';

module.exports = {
  runtime: {
    debug: true,
    lifeline: '/tmp',
    worker: 2,
    hotConfig: true
  },
  cache: {
    debug: false,
    recycle: 300000,
    defaultLife: 86400000,
    transactionRetries: 3,
  },
  rpc: {
    port: 4321,
  },
  redis: {
    host: 'localhost',
    port: 32768,
  }
};
