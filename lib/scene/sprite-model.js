import gfx from 'gfx.js';

var _vertexFormat = new gfx.VertexFormat([
  { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
  { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
  { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 }
]);

export default class SpriteModel {
  constructor(node, ) {
    this._node = null;
    this._frame = null;
    this._mesh = null;
    this._effect = null;

    // TODO: we calculate aabb based on mesh vertices
    // this._aabb
  }

  setNode(node) {
    this._node = node;
  }

  setSpriteFrame(frame) {
    this._frame = frame;
  }

  setEffect(effect) {
    this._effect = effect;
  }

  get meshCount() {
    return 1;
  }

  get vertexFormat () {
    return _vertexFormat;
  }

  get vertexCount () {
    return 4;
  }

  get indexCount () {
    return 6
  }

  getDrawItem(out, index) {
    out.model = this;
    out.node = this._node;
    out.mesh = null;
    out.effect = this._effect;
  }
}