'use strict';
var Redis = require('ioredis');
var Promise = require('bluebird');

class RedisConnectionPool {
  constructor(size) {
    this.idleConn = [];
    this.conn = [];
    this.pendingReq = [];
    this.maxNumConn = size;
  }

  getConnection() {
    return new Promise((resolve) => {
      if (this.idleConn.length > 0) {
        console.log('Found an idle connection, ship it!');
        const conn = this.idleConn.pop();
        console.assert(conn);
        resolve(conn);
        return;
      }

      if (this.conn.length < this.maxNumConn) {
        console.log('Create a new connection!');
        const conn = new Redis(32768, 'localhost');
        this.conn.push(conn);
        resolve(conn);
        return;
      }

      console.log('No idle connection, the request will be pending.');
      this.pendingReq.push(resolve);
    });
  }

  releaseConnection(conn) {
    if (this.pendingReq.length > 0) {
      console.log('Ship a pending request!!');
      const req = this.pendingReq.pop();
      console.assert(req);
      req(conn);
      return;
    }

    console.log('Release a connection!');
    this.idleConn.push(conn);
  }
}

class RedisStorage {
  static serialize(record) {
    return record.toJSON ? record.toJSON() : JSON.stringify(record);
  }

  static parse(obj, schema) {
    return schema ? schema.build(obj) : JSON.parse(obj);
  }

  constructor() {
    this.redis = new Redis(32768, 'localhost');
    this.transConnPool = new RedisConnectionPool(1);
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

  createTransaction(nativeHandler) {
    return this.transConnPool.getConnection()
      .then((conn) => {
        return new SoftTransaction(conn, this.transConnPool, nativeHandler);
      });
  }
}

class TransactionOperator {
  constructor(conn) {
    this.conn = conn;
    this.pending = {};
    this.deleted = {};
  }

  clear() {
    this.pending = {};
    this.deleted = {};
  }

  get(key, schema) {
    var pending = this.pending[key];
    if (pending) return Promise.resolve(pending);

    return this.conn.watch(key)
      .then(() => this.conn.get(key))
      .then((record) => {
        record = RedisStorage.parse(record, schema);
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
}

class SoftTransaction {
  constructor(conn, transConnPool, nativeHandler) {
    this.conn = conn;
    this.transConnPool = transConnPool;
    this.nativeHandler = nativeHandler.bind(null, this);
    this.retries = 0;
    this.cache = new TransactionOperator(conn);
  }

  get pending() {
    return this.cache.pending;
  }

  get deleted() {
    return this.cache.deleted;
  }

  run() {
    this.args = arguments;
    this.nativeHandler.apply(this, arguments)
      .then(() => console.log('Handled'));
  }

  commit(replyCallback) {
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
    var trans = this.conn.multi();
    trans = pendingKeys.reduce((trans, k) => trans.set(
      k, RedisStorage.serialize(this.pending[k])
    ), trans);
    trans = deletedKeys.reduce((trans, k) => trans.del(k), trans);
    return trans.exec()
      .then((result) => {
        if (result) {
          this.transConnPool.releaseConnection(this.conn);
          return replyCallback(this.pending);
        }

        throw new Error('Fail to commit transaction!');
      })
      .catch((err) => {
        this.runtime.warn('Fail to commit transaction!');
        return this.retry();
      });
  }

  cancel() {
    this.transConnPool.releaseConnection(this.conn);
  }

  retry() {
    if (this.retries >= this.config.cache.transactionRetries) {
      this.transConnPool.releaseConnection(this.conn);
      throw new Error('This transaction has retried for ' + this.retries +
        ' times.');
    }

    this.cache.clear();
    ++this.retries;
    this.runtime.warn('Transaction retries...');
    return this.nativeHandler.apply(this, this.args);
  }
}

module.exports = RedisStorage;
