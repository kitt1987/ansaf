'use strict';

module.exports = Config;

function Config() {

}

function loadArgs() {
  var args;
  try {
    var argsFile = './args.json';
    args = require(argsFile);
    require.cache[require.resolve(argsFile)] = null;
  } catch (err) {}

  return args;
}


Config.prototype.init = function() {
  this.reload();
};

Config.prototype.reload = function() {
  var args = loadArgs();
  if (!args) return;
  Object.assign(this, args);
 };
