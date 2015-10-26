'use strict';

const fs = require('fs');
const path = require('path');
var util = require('../utility');
const EventEmitter = require('events');

module.exports = LifeCycle;

const BEFORE_EXIT = 'exit';

function LifeCycle() {
  EventEmitter.call(this);
}

util.mixin(LifeCycle, EventEmitter);

LifeCycle.prototype.init = function(whole) {
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
};

LifeCycle.prototype.halt = function() {
  this.emit(BEFORE_EXIT);
};
