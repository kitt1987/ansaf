'use strict';
var Redis = require('ioredis');

class RedisStorage {
  static serialize(record) {
    return record.toJSON ? record.toJSON() : JSON.stringify(record);
  }

  static parse(obj, schema) {
    return schema ? schema.build(obj) : JSON.parse(obj);
  }

  constructor() {
    this.redis = new Redis(32768, 'localhost');
  }

  get(key, schema) {
    return this.redis.get(key)
      .then((obj) => {
        if (!obj) return;
        if (schema) return schema.build(obj);
        return obj;
      });
  }

  set(key, record) {
    return this.redis.set(key, record.toJSON())
      .then(() => record);
  }

  delete(key, record) {
    return this.redis.del(key)
      .then(() => record);
  }

  watch(key) {
    return this.redis.watch(key);
  }

  createTransaction(nativeHandler) {
    return new SoftTransaction(this.redis, nativeHandler);
  }
}

class SoftTransaction {
  constructor(redis, nativeHandler) {
    this.redis = redis;
    this.pending = {};
    this.deleted = {};
    this.nativeHandler = nativeHandler;
    this.retries = 0;
  }

  run() {
    this.args = arguments;
    this.nativeHandler.apply(this, arguments);
  }

  get(key, schema) {
    var pending = this.pending[key];
    if (pending) return Promise.resolve(pending);

    return this.redis.watch(key)
      .then(() => this.redis.get(key))
      .then((record) => {
        record = RedisStorage.parse(record);
        this.pending[key] = record;
        return record;
      });
  }

  save(key, record) {
    if (this.pending[key] !== null && this.pending[key] !== undefined)
      throw new Error('Key ' + key + ' is used. You have to choose another ' +
        'key or call update instead of save.');
    this.pending[key] = record;
    if (this.deleted[key]) this.deleted[key] = null;
    return Promise.resolve(record);
  }

  update(key, record) {
    if (this.pending[key] === null || this.pending[key] === undefined)
      throw new Error('You didnt get record key ' + key + ' referred from ' +
        'transaction.');
    this.pending[key] = record;
    return Promise.resolve(record);
  }

  delete(key, record) {
    if (this.pending[key] !== null && this.pending[key] !== undefined)
      throw new Error('You didnt get record key ' + key + ' referred from ' +
        'transaction.');
    this.pending[key] = null;
    this.deleted[key] = record;
    return Promise.resolve(record);
  }

  commit() {
    var pendingKeys = Object.keys(this.pending).filter(
      (k) => this.pending[k] !== null
    );
    var deletedKeys = Object.keys(this.deleted).filter(
      (k) => this.deleted[k] !== null
    );

    if (pendingKeys.length === 0 && deletedKeys.length == 0) {
      this.runtime.warn('Nothing changed! Transaction will not commit!');
      return;
    }
    var trans = this.redis.multi();
    trans = pendingKeys.reduce((trans, k) => trans.set(
        k, RedisStorage.serialize(this.pending[k])
      ), trans);
    trans = deletedKeys.reduce((trans, k) => trans.del(k), trans);
    return trans.exec()
      .then(() => this.pending)
      .catch((err) => {
        this.runtime.warn('Fail to commit transaction!');
        return this.retry();
      });
  }

  cancel() {

  }

  retry() {
    if (this.retries >= this.config.cache.transactionRetries) {
      throw new Error('This transaction has retried for ' + this.retries +
        ' times.');
    }

    this.pending = {};
    this.deleted = {};
    ++this.retries;
    this.runtime.warn('Transaction retries...');
    return this.nativeHandler.apply(this, this.args);
  }
}

exports.createStorage = function() {
  return new RedisStorage();
};
