'use strict';

var util = require('../utility');
var path = require('path');
var fs = require('fs');

module.exports = Middlewares;

function Middlewares() {

}

function installModules(customMiddleware) {
  var dir = path.join(customMiddleware, 'module');
  var modules = {};
  fs.readdirSync(dir)
    .map(f => path.basename(f, '.js'))
    .map(f => {
      var M = require('./' + path.relative(path.dirname(module.filename), path.join(dir, f)));
      modules[f] = new M();
    });

  Object.keys(modules).forEach(n => {
    if (this[n]) throw new Error(n + ' is defined in Middleware Layer');
    this[n] = modules[n];
  });

  Object.keys(modules).forEach(n => {
    var m = modules[n];
    Object.keys(this).filter(k => k !== n).forEach(k => {
      if (m[k]) throw new Error(k + ' is defined in Module ' + n);
      m[k] = this[k];
    });
    if (m.init) m.init();
  });
}

Middlewares.prototype.init = function() {
  var customMiddleware = path.join(path.dirname(module.filename), '../../../middleware');
  var customInit;
  try {
    customInit = require('./' + path.relative(path.dirname(module.filename), customMiddleware));
  } catch(err) {}

  if (customInit && customInit.init) {
    var init = customInit.init();
    if (init) {
      return init.then(installModules.bind(this, customMiddleware));
    }
  }

  installModules.call(this, customMiddleware);
  this.runtime.debug('Middleware initial done');
};
