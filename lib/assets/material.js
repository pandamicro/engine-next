import Asset from './asset';

export default class Material extends Asset {
  constructor(persist = false) {
    super(persist);

    this._effect = null; // renderer.Effect
  }
}