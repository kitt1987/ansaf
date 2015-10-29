'use strict';

const path = require('path');

function start() {
  var self = {};
  self.package = require('./package.json');
  var layers = ['package.json', 'config', 'runtime', 'cache', 'middleware', 'rpc'];

  layers = layers.map(l => {
    var layer, layerName = l;
    if (path.extname(l) === '.json') {
      layer = require('./' + l);
      layerName = path.basename(l, '.json');
    } else {
      var Layer = require('./' + l);
      if (typeof Layer === 'function') {
        layer = new Layer();
      } else if (typeof Layer === 'object') {
        layer = Layer;
      } else {
        throw new Error('A Layer must be a function or an object');
      }
    }

    Object.assign(layer, self);
    self[layerName] = layer;
    return layer;
  });

  var asyncInit = layers.reduce((previous, layer) => {
    if (!layer.init) return previous;
    var asyncInit = layer.init();
    if (!asyncInit) return previous;
    if (!previous) return asyncInit;
    return previous.then(asyncInit);
  }, null);

  if (asyncInit) {
    asyncInit.then(() => {
      self.runtime.keep(self.rpc.loop.bind(self.rpc));
    });
  } else {
    self.runtime.keep(self.rpc.loop.bind(self.rpc));
  }
}

start();
