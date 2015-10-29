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

function installLayerModules(layer, directory) {
  var moduleNames = fs.readdirSync(directory).filter(f => f !== 'index.js').map(f => path.basename(f, '.js'));
  var modules = moduleNames.map(f => {
    var M = require(path.relative(path.basename(module.filename), path.join(directory, f)));
    if (layer[f]) throw new Error(f + ' is defined in the Layer');
    layer[f] = new M();
  });

  moduleNames.forEach(n => {
    var m = layer[n];
    Object.keys(layer).filter(k => k !== n).forEach(k => {
      if (m[k]) throw new Error(k + ' is defined in Module ' + n);
      m[k] = layer[k];
    });
    if (m.init) m.init();
  });
}

module.exports = {
  mixin,
  installLayerModules,
};
