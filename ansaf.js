#!/usr/bin/env node

'use strict';
var fs = require('fs');
var path = require('path');

var CONFIG = 'config';
var CACHE = 'cache';
var MIDDLEWARE = 'middleware';
var RPC = 'rpc';

function initConfig(initPath) {
  fs.createReadStream('node_modules/ansaf/config/args.js')
    .pipe(fs.createWriteStream(path.join(initPath, 'args.js')));
  fs.createReadStream('node_modules/ansaf/config/args.test.js')
    .pipe(fs.createWriteStream(path.join(initPath, 'args.test.js')));
}

function initCache(dir) {
  fs.writeFileSync(path.join(dir, 'index.js'),
    `'use strict';
    //return a Promise if you need a async-initial.
    exports.createStorage = function() {
      return {
        get: (key, schema) => {},
        createTransaction: (cache) => {}
      };
    };`
  );
}

function initMiddleware(dir) {
  fs.writeFileSync(path.join(dir, 'index.js'),
    `'use strict';
    //return a Promise if you need a async-initial.
    exports.init=function() {
    };`
  );
  fs.mkdirSync(path.join(dir, 'module'));
}

function initRPC(dir) {
  fs.writeFileSync(path.join(dir, 'index.js'),
    `'use strict';
    //return a Promise if you need a async-initial.
    exports.createServer = function() {
    };`
  );
}

function installPackage(p) {
  return new Promise((resolve, reject) => {
    var exec = require('child_process').exec;
    exec('npm i --save ' + p,
      (error, stdout, stderr) => {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error) {
          console.log('exec error: ' + error);
          reject(error);
          return;
        }

        resolve();
      });
  });
}

function buildProfile() {
  var matchedVersion = process.version.match(/(\d+)(\.\d+){2}/);
  if (!matchedVersion || parseInt(matchedVersion[1]) < 4) {
    console.error('You need to install node at least v4.0.0.');
    return;
  }

  if (process.argv.length < 3 || typeof process.argv[2] !== 'string' ||
    process.argv[2].length === 0) {
    console.error('You need to type a project name');
    return;
  }

  var projectName = process.argv[2];
  if (fs.existsSync(projectName)) {
    console.error('A dirctory has same name with you project is found!');
    return;
  }

  fs.mkdirSync(projectName);
  var paths = [CONFIG, CACHE, MIDDLEWARE, RPC].map((d) => {
    var dir = path.join(projectName, d);
    fs.mkdirSync(dir);
    return d;
  });

  fs.writeFileSync(path.join(projectName, 'index.js'), "require('ansaf')");
  fs.writeFileSync(path.join(projectName, 'package.json'),
    '{\n  "name": "' + projectName + '"\n}\n'
  );

  process.chdir(projectName);

  installPackage('ansaf')
    .then(() => {
      initConfig(paths[0]);
      initCache(paths[1]);
      initMiddleware(paths[2]);
      initRPC(paths[3]);
    });
}

buildProfile();
