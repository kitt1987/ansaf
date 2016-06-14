'use strict';

const util = require('./utility');

class Middleware {
  constructor() {
    Object.defineProperty(this, 'keys', {
      enumerable: false,
      configurable: false,
      writable: true
    });
  }

  use(key, obj) {
    util.use(this, key, obj);
  }
}

// function installModules(customMiddleware) {
//   const dir = customMiddleware;
//   var modules = {};
//   fs.readdirSync(dir)
//     .filter((f) => f[0] !== '.' && f.endsWith('.js'))
//     .map((f) => path.basename(f, '.js'))
//     .map((f) => {
//       var M = require('./' + path.relative(path.dirname(module.filename),
//         path.join(dir, f)));
//       modules[f] = new M();
//     });
//
//   Object.keys(modules).forEach((n) => {
//     if (this[n]) throw new Error(n + ' is defined in Middleware Layer');
//     this[n] = modules[n];
//   });
//
//   Object.keys(modules).forEach((n) => {
//     var m = modules[n];
//     Object.keys(this).filter((k) => k !== n).forEach((k) => {
//       if (m[k]) throw new Error(k + ' is defined in Module ' + n);
//       m[k] = this[k];
//     });
//     if (m.init) m.init();
//   });
// }

module.exports = Middleware;
