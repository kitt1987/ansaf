'use strict';

var util = require('../utility');
var path = require('path');

module.exports = Middlewares;

function Middlewares() {

}

Middlewares.prototype.init = function() {
  util.installLayerModules(this, path.dirname(module.filename));
};
