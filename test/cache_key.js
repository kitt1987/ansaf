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
      t.key[t.single.type] = new CacheKey(t.single.type);
      t.done();
    },
    after: t => {
      t.single = null;
      t.done();
    },
    cacheSingle: t => {
      var key = t.key[t.single.type];
      t.nothing(key.getKey());
      t.cache[key.createSingleKey().key()] = t.single.value;
      t.done();
    },
    getValueCached: t => {
      t.eq(t.cache[t.key[t.single.type].getKey().key()], t.single.value);
      t.done();
    },
    allKeys: t => {
      var keys = t.key[t.single.type].allKeys();
      t.eq(keys.length, 1);
      t.done();
    }
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
      var key = t.key[t.range.type];
      t.nothing(key.getKey(1, 40));
      t.cache[key.createRangeKey(1, 40).key()] = t.range.value1Lasts40;
      t.done();
    },
    getOneLastsForty: t => {
      t.eq(t.cache[t.key[t.range.type].getKey(1, 40).key()], t.range.value1Lasts40);
      t.done();
    },
    get4Lasts10: t => {
      var key = t.key[t.range.type].getKey(4, 10);
      t.eq(t.cache[key.key()], t.range.value1Lasts40);
      t.eq(key.filter(t.cache[key.key()]).length, 10);
      t.done();
    },
    no20Lasts41: t => {
      t.nothing(t.key[t.range.type].getKey(20, 41));
      t.done();
    }
  }
};
