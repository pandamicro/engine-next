'use strict';

const fsJetpack = require('fs-jetpack');
const pjson = require('../package.json');
const resolve = require('@gamedev-js/rollup-plugin-node-resolve');

let banner = `
/*
 * ${pjson.name} v${pjson.version}
 * Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 * Released under the Private License.  
 */
`;

let dest = './dist';
let file = 'engine';
let moduleName = 'engine';

// clear directory
fsJetpack.dir(dest, { empty: true });

module.exports = {
  input: './index.js',
  output: [
    { 
      file: `${dest}/${file}.dev.js`, 
      format: 'iife',
      name: moduleName,
      globals: {},
      sourcemap: true,
      banner,
    },
    {
      file: `${dest}/${file}.js`,
      format: 'cjs',
      name: moduleName,
      globals: {},
      sourcemap: true,
      banner,
    },
  ],
  external: ['gfx'],
  plugins: [
    resolve({
      jsnext: true,
      main: true,
    })
  ],
};