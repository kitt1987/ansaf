'use strict';
var CacheKey = require('../cache/key');

module.exports = {
  beforeEach: t => {
    t.cache = {};
    t.key = {};
    t.done();
  },
  single: {
    before: t => {
      t.single = {};
      t.single.type = 'single';
      t.single.value = 'single value';
      t.single.object = { id: 123, key: 456};
      t.key[t.single.type] = new CacheKey(t.single.type);
      t.done();
    },
    after: t => {
      t.single = null;
      t.done();
    },
    cacheSingleValue: t => {
      var key = t.key[t.single.type].individualKey();
      t.cache[key()] = t.single.value;
      t.done();
    },
    getSingleValueCached: t => {
      var key = t.key[t.single.type].individualKey();
      t.eq(t.cache[key()], t.single.value);
      t.done();
    },
    cacheObject: t => {
      var key = t.key[t.single.type].individualKey('id');
      t.cache[key(t.single.object)] = t.single.object;
      t.done();
    },
    getObjectCached: t => {
      var key = t.key[t.single.type].individualKey('id');
      t.eq(t.cache[key({
        id: t.single.object.id,
      })], t.single.object);
      t.done();
    },
    cacheObjectWithAnotherKey: t => {
      var key = t.key[t.single.type].individualKey('key');
      t.cache[key(t.single.object)] = t.single.object;
      t.done();
    },
    getObjectCached2: t => {
      var key = t.key[t.single.type].individualKey('key');
      t.eq(t.cache[key({
        key: t.single.object.key,
      })], t.single.object);
      t.done();
    },
    allKeys: t => {
      var keys = t.key[t.single.type].allIndividualKeys();
      t.eq(keys.length, 3);
      t.done();
    },
  },
  range: {
    before: t => {
      t.range = {};
      t.range.type = 'range';
      t.range.value1Lasts40 = Array.from({length: 40}, (v, k) => k + 1);
      t.range.value50Lasts100 = Array.from({length: 50}, (v, k) => k + 50);
      t.key[t.range.type] = new CacheKey(t.range.type);
      t.done();
    },
    after: t => {
      t.range = null;
      t.done();
    },
    oneToForty: t => {
      var key = t.key[t.range.type].rangeKey(1, 40);
      t.cache[key()] = t.range.value1Lasts40;
      t.done();
    },
    getOneLastsForty: t => {
      var key = t.key[t.range.type].rangeKey(1, 40);
      t.eq(t.cache[key()], t.range.value1Lasts40);
      t.done();
    },
    get4Lasts10: t => {
      var key = t.key[t.range.type].rangeKey(4, 10);
      t.eq(t.cache[key()], t.range.value1Lasts40);
      t.eq(key.filter(t.cache[key()]).length, 10);
      t.done();
    },
    no20Lasts41: t => {
      var key = t.key[t.range.type].rangeKey(20, 41);
      t.nothing(t.cache[key()]);
      t.done();
    },
    allKeys: t => {
      var keys = t.key[t.range.type].allRangeKeys();
      t.eq(keys.length, 3);
      t.done();
    }
  }
};
