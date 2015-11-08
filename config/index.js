'use strict';

module.exports = Config;

function Config() {

}

function loadArgs(testing) {
  var args;
  try {
    var argsFile = testing ? './args.test.json' : './args.json';
    args = require(argsFile);
    require.cache[require.resolve(argsFile)] = null;
  } catch (err) {}

  return args;
}


Config.prototype.init = function() {
  this.reload();
};

Config.prototype.reload = function() {
  var args = loadArgs(this.testing);
  if (!args) return;
  Object.assign(this, args);
 };
