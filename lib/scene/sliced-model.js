import { mat4 } from 'vmath';
import { Pool } from 'memop';
import vertexFormat from './vertex-format';

var _matrix = mat4.create();
var _x = [0, 0, 0, 0];
var _y = [0, 0, 0, 0];
var _vertex = {
  x: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  y: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
};

var _pool;

export default class SlicedModel {
    constructor() {
      this._node = null;
      this._frame = null;
      this._effect = null;
      this._texture = null;
      this._uv = {
        u: [0, 0, 0, 0],
        v: [0, 0, 0, 0]
      };

      this.width = 0;
      this.height = 0;
    }
    
    _updateUV () {
      let frame = this._frame;
      if (this._effect) {
        let texture = this._effect.getValue('mainTexture');
        let rect = frame._rect;
        let atlasWidth = texture._width;
        let atlasHeight = texture._height;

        // caculate texture coordinate
        let leftWidth = frame.insetLeft;
        let rightWidth = frame.insetRight;
        let centerWidth = rect.width - leftWidth - rightWidth;
        let topHeight = frame.insetTop;
        let bottomHeight = frame.insetBottom;
        let centerHeight = rect.height - topHeight - bottomHeight;

        // uv computation should take spritesheet into account.
        let u = this._uv.u;
        let v = this._uv.v;
        if (frame._rotated) {
          u[0] = (rect.x) / atlasWidth;
          u[1] = (bottomHeight + rect.x) / atlasWidth;
          u[2] = (bottomHeight + centerHeight + rect.x) / atlasWidth;
          u[3] = (rect.x + rect.height) / atlasWidth;

          v[0] = (rect.y) / atlasHeight;
          v[1] = (leftWidth + rect.y) / atlasHeight;
          v[2] = (leftWidth + centerWidth + rect.y) / atlasHeight;
          v[3] = (rect.y + rect.width) / atlasHeight;
        }
        else {
          u[0] = (rect.x) / atlasWidth;
          u[1] = (leftWidth + rect.x) / atlasWidth;
          u[2] = (leftWidth + centerWidth + rect.x) / atlasWidth;
          u[3] = (rect.x + rect.width) / atlasWidth;

          v[3] = (rect.y) / atlasHeight;
          v[2] = (topHeight + rect.y) / atlasHeight;
          v[1] = (topHeight + centerHeight + rect.y) / atlasHeight;
          v[0] = (rect.y + rect.height) / atlasHeight;
        }
      }
    }
  
    setNode(node) {
      this._node = node;
    }
  
    setEffect(effect) {
      this._effect = effect;
    }
    
    get spriteFrame () {
      return this._frame;
    }
  
    set spriteFrame (frame) {
      this._frame = frame;
      this._updateUV();
    }
  
    get meshCount() {
      return 1;
    }
  
    get vertexFormat () {
      return vertexFormat;
    }
  
    get vertexCount () {
      return 36;
    }
  
    get indexCount () {
      return 54;
    }
  
    getDrawItem(out, index) {
      out.model = this;
      out.node = this._node;
      out.mesh = null;
      out.effect = this._effect;
    }
    
    _updateVertex (node) {
      node.getWorldMatrix(_matrix);
      let a = _matrix.m00,
          b = _matrix.m01,
          c = _matrix.m04,
          d = _matrix.m05,
          tx = _matrix.m12,
          ty = _matrix.m13;

      let frame = this._frame;
      let rect = frame._rect;
      let leftWidth = frame.insetLeft;
      let rightWidth = frame.insetRight;
      let topHeight = frame.insetTop;
      let bottomHeight = frame.insetBottom;

      let sizableWidth = this.width - leftWidth - rightWidth;
      let sizableHeight = this.height - topHeight - bottomHeight;
      let xScale = this.width / (leftWidth + rightWidth);
      let yScale = this.height / (topHeight + bottomHeight);
      xScale = (isNaN(xScale) || xScale > 1) ? 1 : xScale;
      yScale = (isNaN(yScale) || yScale > 1) ? 1 : yScale;
      sizableWidth = sizableWidth < 0 ? 0 : sizableWidth;
      sizableHeight = sizableHeight < 0 ? 0 : sizableHeight;
      let x = _x;
      let y = _y;
      x[0] = 0;
      x[1] = leftWidth * xScale;
      x[2] = x[1] + sizableWidth;
      x[3] = this.width;
      y[0] = 0;
      y[1] = bottomHeight * yScale;
      y[2] = y[1] + sizableHeight;
      y[3] = this.height;

      let vx = _vertex.x;
      let vy = _vertex.y;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          vx[row][col] = x[col] * a + y[row] * c + tx;
          vy[row][col] = x[col] * b + y[row] * d + ty;
        }
      }
    }
  
    fillVertexBuffer (index, vbuf, uintbuf) {
      let texture = this._effect.getValue('mainTexture');
      if (texture !== this._texture) {
        this._updateUV();
        this._texture = texture;
      }
  
      let offset = index * vertexFormat._bytes;
      let node = this._node;
      let frame = this._frame;
  
      // for color
      let color = ((255<<24) >>> 0) + (255<<16) + (255<<8) + 255;
  
      // Assign vertex data
      this._updateVertex(node);
      let x = _vertex.x;
      let y = _vertex.y;
      let z = node.lpos.z;
      let u = this._uv.u;
      let v = this._uv.v;
      for (let r = 0; r < 3; ++r) {
        for (let c = 0; c < 3; ++c) {
          // lb
          vbuf[offset] = x[r][c];
          vbuf[offset + 1] = y[r][c];
          vbuf[offset + 2] = z;
          uintbuf[offset + 3] = color;
          vbuf[offset + 4] = u[c];
          vbuf[offset + 5] = v[r];
          offset += 6;
          // rb
          vbuf[offset] = x[r][c+1];
          vbuf[offset + 1] = y[r][c+1];
          vbuf[offset + 2] = z;
          uintbuf[offset + 3] = color;
          vbuf[offset + 4] = u[c+1];
          vbuf[offset + 5] = v[r];
          offset += 6;
          // lt
          vbuf[offset] = x[r+1][c];
          vbuf[offset + 1] = y[r+1][c];
          vbuf[offset + 2] = z;
          uintbuf[offset + 3] = color;
          vbuf[offset + 4] = u[c];
          vbuf[offset + 5] = v[r+1];
          offset += 6;
          // rt
          vbuf[offset] = x[r+1][c+1];
          vbuf[offset + 1] = y[r+1][c+1];
          vbuf[offset + 2] = z;
          uintbuf[offset + 3] = color;
          vbuf[offset + 4] = u[c+1];
          vbuf[offset + 5] = v[r+1];
          offset += 6;
        }
      }
      return 36;
    }
  
    fillIndexBuffer (offset, vertexId, ibuf) {
      for (let r = 0; r < 3; ++r) {
        for (let c = 0; c < 3; ++c) {
          ibuf[offset++] = vertexId;
          ibuf[offset++] = vertexId + 1;
          ibuf[offset++] = vertexId + 2;
          ibuf[offset++] = vertexId + 1;
          ibuf[offset++] = vertexId + 3;
          ibuf[offset++] = vertexId + 2;
          vertexId += 4;
        }
      }
      return 54;
    }

    draw () {

    }
    
    static alloc () {
      return _pool.alloc();
    }
  
    static free (model) {
      if (model instanceof SlicedModel) {
        model._node = null;
        model._frame = null;
        model._effect = null;
        model._texture = null;
        model.width = 0;
        model.height = 0;
        _pool.free(model);
      }
    }
  }
  
  _pool = new Pool(() => {
    return new SlicedModel();
  }, 8);