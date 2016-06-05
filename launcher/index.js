'use strict';

const path = require('path');

function startLayers(layers, configTag) {
  var self = {};

  layers = layers.map((l) => {
    var layer, layerName = l;
    if (path.extname(l) === '.json') {
      layer = require(path.join('..', l));
      layerName = path.basename(l, '.json');
    } else {
      var Layer = require(path.join('..', l));
      if (typeof Layer === 'function') {
        layer = new Layer();
      } else if (typeof Layer === 'object') {
        layer = Layer;
      } else {
        throw new Error('A Layer must be a function or an object');
      }
    }

    self.config.testing = configTag === 'test';

    Object.assign(layer, self);
    self[layerName] = layer;
    return layer;
  });

  var initial = layers.reduce((previous, layer) => {
    if (!layer.init) return previous;
    if (previous) return previous.then(layer.init.bind(layer, configTag));
    return layer.init(configTag);
  }, null);

  if (initial) return initial.then(() => self);
  return self;
}

var allLayers = [
  '../../package.json',
  'config',
  'runtime',
  'cache',
  'middleware',
  'rpc'
];

module.exports = {
  init: startLayers.bind(null, allLayers),
  launch: function(configTag) {
    Promise.resolve(startLayers(allLayers, configTag))
      .then((self) => {
        self.runtime.keep(self.rpc.loop.bind(self.rpc));
      })
      .catch((err) => {
        if (err.stack) console.log(err.stack);
        else console.log(err);
      });
  }
};
