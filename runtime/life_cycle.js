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

LifeCycle.prototype.init = function(whole) {
  this.worker = whole.config.runtime.worker !== undefined ? whole.config.runtime.worker : os.cpus().length;
  this.user = whole.config.runtime.user;
  this.maxRivival = this.worker * 3;

  var lifeline = whole.config.runtime.lifeline;
  if (!lifeline) {
    whole.runtime.warn("Lifeline is not set such that you can't stop the app manually!");
    return;
  }

  const lifelineState = fs.statSync(lifeline);
  if (!lifelineState.isDirectory()) throw new Error('Lifeline must be a directory');
  const stopFile = whole.package.name + '.stop';
  const stopFilePath = path.join(lifeline, stopFile);
  if (fs.existsSync()) fs.unlinkSync();

  var watcher = fs.watch(lifeline, (ev, filename) => {
    if (filename === stopFile) {
      fs.unlinkSync(stopFilePath);
      watcher.close();
      this.halt();
    }
  });

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
