'use strict';

var util = require('../utility');
var path = require('path');
var fs = require('fs');

module.exports = Middlewares;

function Middlewares() {

}

Middlewares.prototype.init = function() {
  var directory = path.join(path.dirname(module.filename), 'module');
  var modules = {};
  fs.readdirSync(directory)
    .filter(f => f !== 'index.js')
    .map(f => path.basename(f, '.js'))
    .map(f => {
      var M = require(path.relative(path.basename(module.filename), path.join(directory, f)));
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
};
