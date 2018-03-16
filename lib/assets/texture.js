// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import Asset from './asset';

export default class Texture extends Asset {
  constructor(persist = true) {
    super(persist);

    this._texture = null;
  }

  getImpl () {
    return this._texture;
  }

  getId () {}

  destroy () {
    this._texture && this._texture.destroy();
  }
}