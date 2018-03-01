// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import Material from '../assets/material';

export default class MaterialUtil {
  constructor () {
      this._cache = {};
  }

  get (key) {
    return this._cache[key];
  }

  register (key, material) {
    if (key === undefined || this._cache[key]) {
        console.warn("Material key is invalid or already exists");
    }
    else if (!material instanceof Material) {
        console.warn("Invalid Material");
    }
    else {
        this._cache[key] = material;
    }
  }

  unregister (key) {
    if (key !== undefined) {
        delete this._cache[key];
    }
  }
}