'use strict';

class Timer {
  constructor() {
    this.timeouts = new TimerContainer(setTimeout, clearTimeout, true);
    this.intervals = new TimerContainer(setInterval, clearInterval);
  }

  init() {
    this.on('exit', this.clearAllTimers);
  }

  setTimeout(fn, delay) {
    return this.timeouts.set(fn, delay);
  }

  clearTimeout(id) {
    this.timeouts.clear(id);
  }

  setInterval(fn, delay) {
    return this.intervals.set(fn, delay);
  }

  clearInterval(id) {
    this.intervals.clear(id);
  }

  clearAllTimers() {
    this.timeouts.clearAll();
    this.intervals.clearAll();
  }
}

class TimerContainer {
  constructor(setter, cleaner, autoCycle) {
    this.setter = setter;
    this.cleaner = cleaner;
    this.timers = [];
    this.idles = [];
    this.autoCycle = autoCycle;
  }

  set(fn, delay) {
    var id;
    if (this.idles.length > 0) {
      id = this.idles[this.idles.length - 1];
      this.idles.pop();
      if (this.timers[id]) throw new Error('The timer ID is occupied!');
      if (this.autoCycle) {
        delay = () => {
          delay();
          this.clear(id);
        };
      }
      this.timers[id] = this.setter(fn, delay);
    } else {
      id = this.timers.length;
      this.timers.push(this.setter(fn, delay));
    }

    return id;
  }

  clear(id) {
    if (id === undefined)
      throw new Error('You should set ID of the timer you want to cancel!');
    var timerID = this.timers[id];
    if (timerID === undefined) {
      if (this.autoCycle) return;
      throw new Error('The timer ID you offered is not correct!');
    }

    this.cleaner(timerID);
    this.idles.push(id);
    this.timers[id] = null;
  }

  clearAll() {
    this.idles = [];
    this.timers.forEach((id) => this.cleaner(id));
  }
}

module.exports = Timer;
