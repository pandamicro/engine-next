import Asset from './asset';

export default class Texture extends Asset {
  constructor(persist = true) {
    super(persist);

    this._texture = null;
  }
}