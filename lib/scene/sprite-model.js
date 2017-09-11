import { mat4 } from 'vmath';
import vertexFormat from './vertex-format';

var _matrix = mat4.create();

export default class SpriteModel {
  constructor() {
    this._node = null;
    this._frame = null;
    this._effect = null;
    this._texture = null;
    this._uv = {
      l: 0,
      r: 1,
      b: 0,
      t: 1
    };
  }
  
  _updateUV () {
    let frame = this._frame;
    if (this._effect) {
      let texture = this._effect.getValue('mainTexture');
      let texw = texture._width,
          texh = texture._height;
      let top = frame.h / 2,
          right = frame.w / 2,
          bottom = -top,
          left = -right;
      
      this._uv.l = texw === 0 ? 0 : frame.x / texw;
      this._uv.r = texw === 0 ? 0 : (frame.x + frame.w) / texw;
      this._uv.b = texh === 0 ? 0 : (frame.y + frame.h) / texh;
      this._uv.t = texh === 0 ? 0 : frame.y / texh;
    }
  }

  setNode(node) {
    this._node = node;
  }

  setSpriteFrame(frame) {
    this._frame = frame;
    this._updateUV();
  }

  setEffect(effect) {
    this._effect = effect;
  }

  get meshCount() {
    return 1;
  }

  get vertexFormat () {
    return vertexFormat;
  }

  get vertexCount () {
    return 4;
  }

  get indexCount () {
    return 6;
  }

  getDrawItem(out, index) {
    out.model = this;
    out.node = this._node;
    out.mesh = null;
    out.effect = this._effect;
  }

  fillVertexBuffer (index, vbuf, uintbuf) {
    let texture = this._effect.getValue('mainTexture');
    if (texture !== this._texture) {
      this._updateUV();
      this._texture = texture;
    }

    let off = index * vertexFormat._bytes;
    let node = this._node;
    let uv = this._uv;
    // for position
    node.getWorldMatrix(_matrix);
    let a = _matrix.m00,
        b = _matrix.m01,
        c = _matrix.m04,
        d = _matrix.m05,
        tx = _matrix.m12,
        ty = _matrix.m13;

    // for color
    let color = ((255<<24) >>> 0) + (255<<16) + (255<<8) + 255;

    // Assign vertex data
    let top = this._frame.h / 2,
        right = this._frame.w / 2,
        bottom = -top,
        left = -right;
    // bl
    vbuf[off++] = left * a + bottom * c + tx;
    vbuf[off++] = left * b + bottom * d + ty;
    vbuf[off++] = node.lpos.z;
    uintbuf[off++] = color;
    vbuf[off++] = uv.l;
    vbuf[off++] = uv.b;
    // br
    vbuf[off++] = right * a + bottom * c + tx;
    vbuf[off++] = right * b + bottom * d + ty;
    vbuf[off++] = node.lpos.z;
    uintbuf[off++] = color;
    vbuf[off++] = uv.r;
    vbuf[off++] = uv.b;
    // tl
    vbuf[off++] = left * a + top * c + tx;
    vbuf[off++] = left * b + top * d + ty;
    vbuf[off++] = node.lpos.z;
    uintbuf[off++] = color;
    vbuf[off++] = uv.l;
    vbuf[off++] = uv.t;
    // tr
    vbuf[off++] = right * a + top * c + tx;
    vbuf[off++] = right * b + top * d + ty;
    vbuf[off++] = node.lpos.z;
    uintbuf[off++] = color;
    vbuf[off++] = uv.r;
    vbuf[off++] = uv.t;

    return 4;
  }

  fillIndexBuffer (offset, vertexId, ibuf) {
    ibuf[offset + 0] = vertexId;
    ibuf[offset + 1] = vertexId + 1;
    ibuf[offset + 2] = vertexId + 2;
    ibuf[offset + 3] = vertexId + 1;
    ibuf[offset + 4] = vertexId + 3;
    ibuf[offset + 5] = vertexId + 2;
    return 6;
  }

  // Canvas draw
  draw (ctx) {
    let texture = this._effect.getValue('mainTexture');
    if (texture !== this._texture) {
      this._texture = texture;
    }

    this._node.getWorldMatrix(_matrix);
    let a = _matrix.m00,
        b = _matrix.m01,
        c = _matrix.m04,
        d = _matrix.m05,
        tx = _matrix.m12,
        ty = _matrix.m13;

    ctx.transform(a, b, c, d, tx, ty);

    let frame = this._frame;
    let dx = -frame.w/2,
        dy = -frame.h/2,
        dw = frame.w,
        dh = frame.h,
        sx = frame.x,
        sy = frame.y,
        sw = frame.w,
        sh = frame.h;
    ctx.drawImage(texture._image, sx, sy, sw, sh, dx, dy, dw, dh);
  }
}