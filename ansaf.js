#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');

var CONFIG = 'config';
var CACHE = 'cache';
var MIDDLEWARE = 'middleware';
var RPC = 'rpc';

function createInitFile(dir) {
  fs.writeFileSync(path.join(dir, 'index.js'),
    "'use strict';\n //return a Promise if you need a async-initial.\nexports.init=function() {\n};\n");
}

function initConfig(initPath) {
  fs.writeFileSync(path.join(initPath, 'args.json'), '{\n}\n');
  fs.writeFileSync(path.join(initPath, 'args.test.json'), '{\n}\n');
}

function initCache(dir) {
  createInitFile(dir);
}

function initMiddleware(dir) {
  createInitFile(dir);
  fs.mkdirSync(path.join(dir, 'module'));
}

function initRPC(dir) {
  fs.writeFileSync(path.join(dir, 'index.js'),
    "'use strict';\n //return a Promise if you need a async-initial.\nexports.createServer=function() {\n};\n");
}

function installPackage(p) {
  var exec = require('child_process').exec;
  var child = exec('npm i --save ' + p,
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });
}

function buildProfile() {
  var matchedVersion = process.version.match(/(\d+)(\.\d+){2}/);
  if (!matchedVersion || parseInt(matchedVersion[1]) < 4) {
    console.error('You need to install node at least v4.0.0.');
    return;
  }

  if (process.argv.length < 3 || typeof process.argv[2] !== 'string' || process.argv[2].length === 0) {
    console.error('You need to type a project name');
    return;
  }

  var projectName = process.argv[2];
  if (fs.existsSync(projectName)) {
    console.error('A directory has same name with you project is found!');
    return;
  }

  fs.mkdirSync(projectName);
  var paths = [CONFIG, CACHE, MIDDLEWARE, RPC].map(d => {
    var dir = path.join(projectName, d);
    fs.mkdirSync(dir);
    return dir;
  });

  fs.writeFileSync(path.join(projectName, 'index.js'), "require('ansaf')");
  fs.writeFileSync(path.join(projectName, 'package.json'), '{\n  "name": "' + projectName + '"\n}\n');
  initConfig(paths[0]);
  initCache(paths[1]);
  initMiddleware(paths[2]);
  initRPC(paths[3]);
  // FIXME installPackage('ansaf');
}

buildProfile();
