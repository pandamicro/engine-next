// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import Asset from './asset';

export default class Material extends Asset {
  constructor(persist = false) {
    super(persist);

    this._effect = null; // renderer.Effect
  }
}