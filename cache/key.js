'use strict';

class CacheKey {
  constructor(symbol) {
    if (!symbol || typeof symbol !== 'string')
      throw new Error('The symbol of cache key must be string');
    this.type = symbol;
    this.keys = {};
    this.single = {};
  }

  getSingleKey(field) {
    if (!field) return singleKey(this);
    if (!this.single[field]) return;
    return singleKey(this, field);
  }

  createSingleKey(field) {
    var key = this.getSingleKey(field);
    if (key) return key;

    this.single[field] = true;
    return singleKey(this, field);
  }

  allSingleKeys() {
    var keys = Object.keys(this.single).map((k) => singleKey(this, k));
    keys.push(buildKey((obj) => this.type));
    return keys;
  }

  getRangeKey(offset, count) {
    if (offset === undefined || count === undefined)
      return buildKey(() => this.type + '#All');
    var range = offset + count;
    var keys = Object.keys(this.keys);
    for (var i = 0; i < keys.length; i++) {
      var key = this.keys[keys[i]];
      if (key.offset > offset) break;
      if (range <= key.range) {
        return rangeKey(this, key.offset, key.count, offset - key.offset,
          count);
      }
    }
  }

  createRangeKey(offset, count) {
    if (offset === undefined || count === undefined)
      return buildKey(() => this.type + '#All');
    var existKey = this.keys[offset.toString()];
    if (existKey && existKey.count === count)
      return rangeKey(this, existKey.offset, existKey.count);
    this.keys[offset.toString()] = {
      offset,
      count,
      range: offset + count
    };
    return rangeKey(this, offset, count);
  }

  allRangeKeys() {
    var keys = Object.keys(this.keys).map(
      (k) => rangeKey(this, this.keys[k].offset, this.keys[k].count)
    );
    keys.push(buildKey(() => this.type + '#All'));
    return keys;
  }
}

function buildKey(key, filter) {
  filter = filter || ((obj) => obj);
  return {
    key,
    filter,
  };
}

function singleKey(ck, field) {
  if (!field) return buildKey((obj) => ck.type);
  if (!ck.single[field]) return;
  return buildKey((obj) => {
    if (!obj)
      throw new Error('An object is required to calculate its cache key!');
    var value = obj[field];
    if (value === undefined || value === null) return null;

    if (typeof value === 'object') {
      if (!value.id)
        throw new Error('The ' + field + ' of ' + ck.type +
          ' must be sth. but ' + value);
      return ck.type + '#' + field + '#' + value.id;
    }

    return ck.type + '#' + field + '#' + value;
  });
}

function rangeKey(ck, offset, count, reqOff, reqCount) {
  return buildKey(() => ck.type + '#' + offset + ':' + count,
    (obj) => {
      if (typeof reqOff !== 'number' || typeof reqCount !== 'number')
        return obj;
      return obj.slice(reqOff, reqOff + reqCount);
    }
  );
}

module.exports = CacheKey;
