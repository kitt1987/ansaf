'use strict';

var fs = require('fs');
var path = require('path');

function mixin(cA, cB) {
  if (typeof cA !== 'function' || typeof cB !== 'function')
    throw new Error('Arguments of mixin must be functions');

  Object.getOwnPropertyNames(cB.prototype).filter(f => f !== 'constructor' && f !== 'init')
  .forEach(f => {
    if (cA.prototype[f]) throw new Error('Both cA and cB has ' + f);
    cA.prototype[f] = cB.prototype[f];
  });
}

module.exports = {
  mixin,
};
