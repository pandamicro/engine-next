import { mat4 } from 'vmath';
import { Pool } from 'memop';
import vertexFormat from './vertex-format';

var _matrix = mat4.create();

var _pool;

export default class SpriteModel {
  constructor () {
    this._node = null;
    this._frame = null;
    this._effect = null;
    this._texture = null;
    this._trimmed = true;
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
      let rect = frame._rect;
      let l, b, r, t;

      if (this._trimmed) {
        l = rect.x;
        b = rect.y;
        r = rect.x + rect.width;
        t = rect.y + rect.height;
      } else {
        let originalSize = frame._originalSize;
        let offset = frame._offset;
        let ow = originalSize.width,
            oh = originalSize.height,
            rw = rect.width,
            rh = rect.height;
        let ox = rect.x + (rw - ow) / 2 - offset.x;
        let oy = rect.y + (rh - oh) / 2 - offset.y;

        l = ox;
        b = oy;
        r = ox + ow;
        t = oy + oh;
      }
      
      this._uv.l = texw === 0 ? 0 : l / texw;
      this._uv.r = texw === 0 ? 0 : r / texw;
      this._uv.b = texh === 0 ? 0 : b / texh;
      this._uv.t = texh === 0 ? 0 : t / texh;
    }
  }

  setNode (node) {
    this._node = node;
  }

  setEffect (effect) {
    this._effect = effect;
  }
  
  get spriteFrame () {
    return this._frame;
  }

  set spriteFrame (frame) {
    this._frame = frame;
    this._updateUV();
  }

  get trimmed () {
    return this._trimmed;
  }

  set trimmed (trimmed) {
    this._trimmed = !!trimmed;
    this._updateUV();
  }

  get meshCount () {
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

  getDrawItem (out, index) {
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
    let frame = this._frame,
        width, height;
    if (this._trimmed) {
      width = frame._rect.width;
      height = frame._rect.height;
    }
    else {
      width = frame._originalSize.width;
      height = frame._originalSize.height;
    }
    let top = height / 2,
        right = width / 2,
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
    let dx = -frame.width/2,
        dy = -frame.height/2,
        dw = frame.width,
        dh = frame.height,
        sx = frame.x,
        sy = frame.y,
        sw = frame.width,
        sh = frame.height;
    ctx.drawImage(texture._image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  static alloc () {
    return _pool.alloc();
  }

  static free (model) {
    if (model instanceof SpriteModel) {
      model._node = null;
      model._frame = null;
      model._effect = null;
      model._texture = null;
      model._trimmed = true;
      _pool.free(model);
    }
  }
}

_pool = new Pool(() => {
  return new SpriteModel();
}, 8);