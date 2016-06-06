'use strict';


function mixin(cA, cB) {
  if (typeof cA !== 'function' || typeof cB !== 'function')
    throw new Error('Arguments of mixin must be functions');

  Object.getOwnPropertyNames(cB.prototype)
    .filter((f) => f !== 'constructor' && f !== 'init')
    .forEach((f) => {
      if (cA.prototype[f]) throw new Error('Both cA and cB has ' + f);
      cA.prototype[f] = cB.prototype[f];
    });
}

class PrivateFuncHelper {
  constructor() {
    var self = this;
    Object.defineProperties(this, {
      '_': {
        value: function(func) {
          return func.apply(self, Array.prototype.slice.call(arguments, 1));
        }
      },
      '_bind': {
        value: function(func) {
          var args = Array.prototype.slice.call(arguments, 1);
          return function() {
            return func.apply(
              self,
              Array.prototype.concat(args, Array.from(arguments))
            );
          };
        }
      }
    });
  }
}

module.exports = {
  mixin,
  PrivateFuncHelper,
};
