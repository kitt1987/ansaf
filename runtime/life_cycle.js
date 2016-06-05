'use strict';

const fs = require('fs');
const path = require('path');
var cluster = require('cluster');
var os = require('os');
var util = require('../utility');
const EventEmitter = require('events');

module.exports = LifeCycle;

const BEFORE_EXIT = 'exit';

function LifeCycle() {
  EventEmitter.call(this);
}

util.mixin(LifeCycle, EventEmitter);

LifeCycle.prototype.init = function() {
  this.worker = this.config.runtime.worker !== undefined ? this.config.runtime.worker : os.cpus().length;
  this.user = this.config.runtime.user;
  this.maxRivival = this.worker * 3;

  var lifeline = this.config.runtime.lifeline;
  if (!lifeline) {
    this.runtime.warn("Lifeline is not set such that you can't stop the app manually!");
    return;
  }

  const lifelineState = fs.statSync(lifeline);
  if (!lifelineState.isDirectory()) throw new Error('Lifeline must be a directory');
  const stopFile = this.package.name + '.stop';
  const stopFilePath = path.join(lifeline, stopFile);
  if (fs.existsSync(stopFilePath)) fs.unlinkSync(stopFilePath);

  var watcher = fs.watch(lifeline, (ev, filename) => {
    if (filename === stopFile) {
      watcher.close();
      watcher = null;
      fs.unlinkSync(stopFilePath);
      this.halt();
    }
  });

  this.on('exit', () => {
    if (watcher) watcher.close();
  });

  if (this.config.runtime.hotConfig && this.config.argsFile) {
    var argsFile = path.resolve(path.dirname(module.filename), path.dirname(this.config.argsFile));
    var configWatcher = fs.watch(argsFile, (ev, filename) => {
      if (filename !== 'args.json') return;
      if (!this.config.runtime.hotConfig) {
        configWatcher.close();
        this.removeListener('exit', () => {
          configWatcher.close();
        });
        configWatcher = null;
        return;
      }

      this.info('Configuration changed');
      this.config.reload();
    });

    this.on('exit', () => {
      configWatcher.close();
    });
  }

  process.on('uncaughtException', err => {
    this.error('Caught exception: ' + err);
    this.error(err.stack);
    this.halt();
  });
};

function updatePidFile(pidFile) {
  fs.writeFileSync(pidFile, process.pid.toString(), {
    encoding: 'utf8',
    flag: 'w+'
  });

  process.on('exit', function(code) {
    fs.unlinkSync(pidFile);
  });
}

function getSysUid(uName) {
  var content = fs.readFileSync('/etc/passwd');
  var users = content.toString().split('\n');
  users.pop();
  for (var i = 0; i < users.length; i++) {
    var line = users[i];
    var cols = line.split(':');
    if (cols[0] === uName) {
      return parseInt(cols[2]);
    }
  }
}

LifeCycle.prototype.keep = function(loop) {
  if (cluster.isMaster) {
    cluster.on('exit', (worker, code, signal) => {
      this.error('free backing instance ' + worker.process.pid + ' died');
      if (this.maxRivival <= 0) {
        this.error('Cluster can not revive free backing any more');
        return;
      }

      --this.maxRivival;
      this.warn('A new free backing instance is revived');
      cluster.fork();
    });

    if (os.type() !== 'Darwin' && this.user) {
      process.setuid(getSysUid(this.user));
    }

    updatePidFile(path.join(this.config.runtime.lifeline, this.config.package.name + '.pid'));

    for (var i = 0; i < this.worker; i++) {
      cluster.fork();
    }

    if (this.worker > 0) return;
  }

  loop();
};

LifeCycle.prototype.halt = function() {
  this.emit(BEFORE_EXIT);
};
