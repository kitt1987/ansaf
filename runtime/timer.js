'use strict';

module.exports = Timer;

function Timer() {
  this.timeouts = new TimerContainer(setTimeout, clearTimeout);
  this.intervals = new TimerContainer(setInterval, clearInterval);
}

Timer.prototype.init = function(whole) {
  whole.runtime.on('exit', this.clearAllTimers);
};

Timer.prototype.setTimeout = function(fn, delay) {
  return this.timeouts.set(fn, delay);
};

Timer.prototype.clearTimeout = function(id) {
  this.timeouts.clear(id);
};

Timer.prototype.setInterval = function(fn, delay) {
  return this.intervals.set(fn, delay);
};

Timer.prototype.clearInterval = function(id) {
  this.intervals.clear(id);
};

Timer.prototype.clearAllTimers = function() {
  this.timeouts.clearAll();
  this.intervals.clearAll();
};

function TimerContainer(setter, cleaner) {
  this.setter = setter;
  this.cleaner = cleaner;
  this.timers = [];
  this.idles = [];
}

TimerContainer.prototype.set = function(fn, delay) {
  var id;
  if (this.idles.length > 0) {
    id = this.idles[this.idles.length - 1];
    this.idles.pop();
    if (this.timers[id]) throw new Error('The timer ID is occupied!');
    this.timers[id] = this.setter(fn, delay);
  } else {
    id = this.timers.length;
    this.timers.push(this.setter(fn, delay));
  }

  return id;
};

TimerContainer.prototype.clear = function(id) {
  if (id === undefined) throw new Error('You should set ID of the timer you want to cancel!');
  var timerID = this.timers[id];
  if (timerID === undefined) throw new Error('The timer ID you offered is not correct!');
  this.cleaner(timerID);
  this.idles.push(id);
  this.timers[id] = null;
};

TimerContainer.prototype.clearAll = function() {
  this.idles = [];
  this.timers.forEach(id => this.cleaner(id));
};
