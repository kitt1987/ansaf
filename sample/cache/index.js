'use strict';
//return a Promise if you need a async-initial.
exports.createStorage = function() {
  return {
    get: (key, schema) => {},
    createTransaction: (cache) => {}
  };
};
