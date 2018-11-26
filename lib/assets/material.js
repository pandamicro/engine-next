// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import Asset from './asset';
import computeHash from '../utils/utils';

export default class Material extends Asset {
  constructor(persist = false) {
    super(persist);

    this._effect = null; // renderer.Effect
    this._texIds = {}; // ids collected from texture defines
    this._hash = '';
  }

  get hash () {
    return this._hash;
  }

  updateHash (value) {
    this._hash = value || computeHash(this);
    if (CC_JSB && this._effect) {
      this._effect.updateHash(this._hash);
    }
  }
}