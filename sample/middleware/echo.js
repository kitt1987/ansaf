'use strict';

module.exports = SampleEcho;

function SampleEcho() {

}

SampleEcho.prototype.echo = function(o) {
  if (!o) return typeof o;
  return o;
};
