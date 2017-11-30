import { Pool } from 'memop';
import { vec2 } from 'vmath';

var _pool;

export default class RenderData {
  constructor () {
    this._verts = {
      x: [],
      y: []
    };
    this._uvs = {
      u: [],
      v: []
    };

    this._pivotX = 0;
    this._pivotY = 0;
    this._width = 0;
    this._height = 0;

    this.vertexCount = 0;
    this.indiceCount = 0;

    this.uvDirty = true;
    this.vertDirty = true;
  }

  get xysLength () {
    return this._verts.x.length;
  }

  set xysLength (length) {
    this._verts.x.length = length;
    this._verts.y.length = length;
  }
  
  get uvsLength () {
    return this._uvs.u.length;
  }

  set uvsLength (length) {
    this._uvs.u.length = length;
    this._uvs.v.length = length;
  }

  updateSizeNPivot (width, height, pivotX, pivotY) {
    if (width !== this._width || 
        height !== this._height ||
        pivotX !== this._pivotX ||
        pivotY !== this._pivotY) 
    {
      this._width = width;
      this._height = height;
      this._pivotX = pivotX;
      this._pivotY = pivotY;
      this.vertDirty = true;
    }
  }
  
  static alloc () {
    return _pool.alloc();
  }

  static free (data) {
    if (data instanceof RenderData) {
      data._verts.x.length = 0;
      data._verts.y.length = 0;
      data._uvs.u.length = 0;
      data._uvs.v.length = 0;
      data.uvDirty = true;
      data.vertDirty = true;
      _pool.free(data);
    }
  }
}

_pool = new Pool(() => {
  return new RenderData();
}, 32);