'use strict';

const path = require('path');

exports = module.exports = {
  init: function(testing) {
    var self = {};
    self.package = require('../package.json');
    var layers = ['package.json', 'config', 'runtime', 'cache', 'middleware', 'rpc'];

    layers = layers.map(l => {
      var layer, layerName = l;
      if (path.extname(l) === '.json') {
        layer = require('../' + l);
        layerName = path.basename(l, '.json');
      } else {
        var Layer = require('../' + l);
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

    self.config.testing = testing;

    var initial = layers.reduce((previous, layer) => {
      if (!layer.init) return previous;
      if (previous) return previous.then(layer.init.bind(layer));
      return layer.init();
    }, null);

    if (initial) return initial.then(() => self);
    return self;
  },
  launch: function() {
    Promise.resolve(exports.init())
      .then((self) => {
        self.runtime.keep(self.rpc.loop.bind(self.rpc));
      });
  }
};
