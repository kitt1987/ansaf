'use strict';

const path = require('path');

function loading() {
  var self = {};
  self.package = require('./package.json');
  var layers = ['package.json', 'config', 'runtime', 'cache', 'middleware', 'rpc'];

  layers.forEach((l, i) => {
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
    if (layer.init) layer.init();
    self[layerName] = layer;
  });

  return self;
}

var self = loading();
self.runtime.keep(self.rpc.loop.bind(self.rpc));
