'use strict';

var util = require('../utility');
var Logger = require('./logger');
var LifeCycle = require('./life_cycle');
var Timer = require('./timer');

module.exports = Runtime;

function Runtime() {
  Logger.call(this);
  LifeCycle.call(this);
  Timer.call(this);
}

util.mixin(Runtime, Logger);
util.mixin(Runtime, LifeCycle);
util.mixin(Runtime, Timer);

Runtime.prototype.init = function(whole) {
  Logger.prototype.init.call(this, whole);
  LifeCycle.prototype.init.call(this, whole);
  Timer.prototype.init.call(this, whole);
};
