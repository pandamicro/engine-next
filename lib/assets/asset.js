// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
export default class Asset {
  constructor(persist = true) {
    this._loaded = false;
    this._persist = persist;
  }

  unload() {
    this._loaded = false;
  }

  reload() {
    // TODO
  }
}