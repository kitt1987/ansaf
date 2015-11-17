'use strict';

module.exports = Config;

function Config() {
}

function loadArgs(testing) {
  var args = require(testing ? './args.test.json' : './args.json');
  try {
    var argsFile = testing ? '../../../config/args.test.json' : '../../../config/args.json';
    var customArgs = require(argsFile);
    args.argsFile = argsFile;
    Object.assign(args, customArgs);
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
