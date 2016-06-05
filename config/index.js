'use strict';

module.exports = Config;

function Config() {
}

function loadArgs(configTag) {
  configTag = configTag ? configTag : '';
  try {
    var argsFile = '../../../config/args.' + configTag + '.js';
    var args = require(argsFile);
    args.argsFile = argsFile;
    require.cache[require.resolve(argsFile)] = null;
  } catch (err) {}

  return args;
}

Config.prototype.init = function(configTag) {
  this.reload(configTag);
};

Config.prototype.reload = function(configTag) {
  var args = loadArgs(configTag);
  if (!args) return;
  Object.assign(this, args);
};
