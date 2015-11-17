'use strict';

exports = module.exports = CacheKey;

function CacheKey(prefix) {
  if (!prefix || typeof prefix !== 'string')
    throw new Error('The prefix of cache key must be string');

  this.prefix = prefix;
  this.range = {};
  this.individual = {};
}

function buildKey(key, filter) {
  key.filter = filter || (obj => obj);
  return key;
}

CacheKey.prototype.individualKey = function(field) {
  if (!field) return buildKey(obj => this.prefix);
  if (!this.individual[field]) this.individual[field] = true;
  return buildKey(obj => {
    if (!obj) throw new Error('An object is required to calculate its text key!');
    var value = obj[field];
    if (value === undefined || value === null)
      throw new Error('The ' + field + ' of ' + this.prefix + ' must be sth. but ' + value);
    return this.prefix + '#' + field + '#' + value;
  });
};

CacheKey.prototype.allIndividualKeys = function() {
  var keys = Object.keys(this.individual).map(k => this.individualKey(k));
  keys.push(buildKey(obj => this.type));
  return keys;
};

function rangeKey(prefix, start, end, reqStart, reqEnd) {
  var noFilter = typeof reqStart !== 'number' || typeof reqEnd !== 'number';
  return buildKey(() => prefix + '#' + start + ':' + end,
    obj => {
      if (noFilter) return obj;
      return obj.slice(reqStart, reqEnd);
    }
  );
}

CacheKey.prototype.rangeKey = function(start, count) {
  if (start === undefined || count === undefined) return buildKey(() => this.prefix + '#All');
  var end = start + count;
  var keys = Object.keys(this.range);
  for (var i = 0; i < keys.length; i++) {
    var endOfKey = this.range[keys[i]];
    if (keys[i] > start) break;
    if (end <= endOfKey) return rangeKey(this.prefix, keys[i], endOfKey, start, end);
  }

  this.range[start] = end;
  return rangeKey(this.prefix, start, end);
};

CacheKey.prototype.allRangeKeys = function() {
  var keys = Object.keys(this.range).map(k => rangeKey(this.prefix, k, this.range[k]));
  keys.push(buildKey(() => this.type + '#All'));
  return keys;
};
