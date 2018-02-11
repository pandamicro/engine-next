'use strict';

const fsJetpack = require('fs-jetpack');
const pjson = require('../package.json');
const resolve = require('@gamedev-js/rollup-plugin-node-resolve');

let banner = `
/*
 * ${pjson.name} v${pjson.version}
 * (c) ${new Date().getFullYear()} @pandamicro
 * Released under the MIT License.
 */
`;

let dest = './dist';
let file = 'engine';
let moduleName = 'engine';

// clear directory
fsJetpack.dir(dest, { empty: true });

module.exports = {
  entry: './index.js',
  targets: [
    { dest: `${dest}/${file}.dev.js`, format: 'iife' },
    { dest: `${dest}/${file}.js`, format: 'cjs' },
  ],
  moduleName,
  banner,
  external: [],
  globals: {},
  sourceMap: true,
  plugins: [
    resolve({
      jsnext: true,
      main: true,
    })
  ],
};