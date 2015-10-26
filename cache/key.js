'use strict';

exports = module.exports = CacheKey;

function CacheKey(type) {
  this.type = type;
  this.keys = {};
  this.single = null;
}

function singleKey(ck) {
  if (!ck.single) return;
  return {
    key: obj => {
      if (obj) return ck.type + '#' + ck.single + '#' + obj[ck.single];
      return ck.type + '#' + ck.single;
    },
    filter: obj => obj,
  };
}

function rangeKey(ck, offset, count, reqOff, reqCount) {
  return {
    key: () => ck.type + '#' + offset + ':' + count,
    filter: obj => {
      if (typeof reqOff !== 'number' || typeof reqCount !== 'number') return obj;
      return obj.slice(reqOff, reqOff + reqCount);
    }
  };
}

CacheKey.prototype.getKey = function(offset, count) {
  if (typeof offset !== 'number' || typeof count !== 'number')
    return singleKey(this);

  var range = offset + count;
  var keys = Object.keys(this.keys);
  for (var i = 0; i < keys.length; i++) {
    var key = this.keys[keys[i]];
    if (key.offset > offset) break;
    if (range <= key.range) return rangeKey(this, key.offset, key.count, offset, count);
  }
};

CacheKey.prototype.createRangeKey = function(offset, count) {
  this.keys[offset.toString()] = {offset, count, range: offset + count};
  return rangeKey(this, offset, count);
};

CacheKey.prototype.createSingleKey = function(objField) {
  this.single = objField || true;
  return singleKey(this);
};

CacheKey.prototype.allKeys = function() {
  var keys = Object.keys(this.keys).map(k => rangeKey(this, k.offset, k.count));
  if (this.single) keys.push(singleKey(this));
  return keys;
};
