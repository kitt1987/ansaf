'use strict';

function loading() {
  var self = {};
  self.package = require('./package.json');

  ['config', 'runtime', 'cache', 'middleware', 'rpc'].forEach(l => {
    var Layer = require('./' + l);
    if (typeof Layer === 'function') {
      self[l] = new Layer();
      if (self[l].init) self[l].init(self);
      return;
    }

    if (typeof Layer === 'object') {
      self[l] = Layer;
      return;
    }

    throw new Error('A Layer must be a function or an object');
  });

  return self;
}

var self = loading();
self.runtime.setInterval(() => console.log('Timer'), 5000);
self.rpc.loop();
