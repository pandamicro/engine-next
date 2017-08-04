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