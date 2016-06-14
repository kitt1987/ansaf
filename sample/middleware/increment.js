'use strict';

module.exports = Increment;

function Increment() {
  this.sth = {};
}

Increment.prototype.increase = function(context, key) {
  return context.cache.get(key)
    .then((obj) => {
      if (typeof obj !== 'number') return context.cache.save(key, 0);
      console.log('Save ' + key + ':' + (obj + 1));
      return context.cache.update(key, obj + 1);
    });
};
