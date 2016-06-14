'use strict';

const path = require('path');

class Config {
  constructor() {
    this.use(Config.default);
  }

  static get default() {
    return {
      runtime: {
        lifeline: '/tmp',
        worker: 0,
        hotConfig: true
      },
      cache: {
        recycle: 300000,
        defaultLife: 86400000
      }
    };
  }

  loadJSON(pathToProject) {
    // FIXME handle hot loading and user in configuration
    var args = loadArgs(pathToProject);
    if (!args) return;
    this.use(args);
  }

  use(configObj) {
    if (typeof configObj !== 'object')
      throw new Error('Your configuration must be an object.');
    Object.assign(this, configObj);
  }
}

function loadArgs(pathToProject) {
  try {
    const argsFile = path.join('../..', pathToProject);
    const args = require(argsFile);
    if (args.argsFile)
      console.warn('Configuration ' + args.argsFile + ' will be replaced');

    args.argsFile = argsFile;
    require.cache[require.resolve(argsFile)] = null;
    return args;
  } catch (err) {
    console.error(err);
  }
}

module.exports = Config;
