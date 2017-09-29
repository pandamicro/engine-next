import { vec3, mat4 } from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';
import { RecyclePool } from 'memop';
import SharedArrayBuffer from './utils/shared-array-buffer';
let Mesh = renderer.Mesh;

let _camPos = vec3.create();
let _camFwd = vec3.create();
let _v3_tmp1 = vec3.create();

let _a16_view = new Float32Array(16);
let _a16_proj = new Float32Array(16);
let _a16_viewProj = new Float32Array(16);

const PER_INDEX_BYTE = 2;
// 500 Quad + 750 Index
const MIN_SHARED_BUFFER_SIZE = 54000;
// 2000 Quad + 3000 Index
const MAX_SHARED_BUFFER_SIZE = 216000;
var _buffers = [];
var _newBuffer = {
  buffer: null,
  offset: -1
};

function _createNewBuffer (bytes) {
  // Allocate buffer
  let buffer = null, offset = -1;
  for (let i = 0, l = _buffers.length; i < l; i++) {
    buffer = _buffers[i];
    offset = buffer.request(bytes);
    if (offset !== -1) {
      break;
    }
  }
  if (offset === -1) {
    let bufferSize = 0;
    if (bytes > MAX_SHARED_BUFFER_SIZE) {
      bufferSize = bytes;
    }
    else {
      bufferSize = Math.max(bytes * 2, MIN_SHARED_BUFFER_SIZE);
    }
    buffer = new SharedArrayBuffer(bufferSize);
    _buffers.push(buffer);
    offset = buffer.request(bytes);
  }
  _newBuffer.buffer = buffer.data;
  _newBuffer.offset = offset;
  return _newBuffer;
}

export default class ForwardRenderer extends renderer.Base {
  constructor (device, builtin) {
    super(device, builtin);

    let defaultFormat = new gfx.VertexFormat([]);
    this._vbPool = new RecyclePool(function () {
      return new gfx.VertexBuffer(
        device,
        defaultFormat,
        gfx.USAGE_DYNAMIC,
        null,
        0
      );
    }, 16);
    this._ibPool = new RecyclePool(function () {
      return new gfx.IndexBuffer(
        device,
        gfx.INDEX_FMT_UINT16,
        gfx.USAGE_STATIC,
        null,
        0
      );
    }, 16);
    this._meshPool = new RecyclePool(function () {
      return new Mesh();
    }, 16);

    this._batchedItems = null;
    
    this._stage2fn[renderer.STAGE_TRANSPARENT] = this._transparentStage.bind(this);
  }

  reset () {
    // Reset intermediate datas
    for (let i = 0; i < _buffers.length; i++) {
      _buffers[i].reset();
    }
    this._vbPool.reset();
    this._ibPool.reset();
    this._meshPool.reset();
    this._batchedItems = null;
    // Reset renderer internal datas
    this._reset();
  }

  render (camera, scene) {
    this.reset();

    // visit logic node tree to get zorders
    // scene.visit();

    // batched stage items, will be released every frame by _reset function
    this._batchedItems = this._stageItemsPools.alloc();
    this._batchedItems.reset();

    this._render(camera, scene, [
      renderer.STAGE_TRANSPARENT,
    ]);
  }

  batchItem (items, start, end, vbuf, ibuf) {
    let uintbuf = new Uint32Array(vbuf.buffer, vbuf.byteOffset, vbuf.length);
    let stageItem = this._batchedItems.add();
    let item0 = items.data[0];
    let vformat = item0.model.vertexFormat;
    stageItem.model = null;
    stageItem.node = item0.node;
    stageItem.effect = item0.effect;
    stageItem.technique = item0.technique;
    stageItem.key = -1;

    let numIndices = 0;
    let numVertices = 0;
    for (let i = start; i < end; i++) {
      let item = items.data[i];
      let vertexId = numVertices;
      numVertices += item.model.fillVertexBuffer(vertexId, vbuf, uintbuf);
      numIndices += item.model.fillIndexBuffer(numIndices, vertexId, ibuf);
    }
    
    let count = end - start;

    let device = this._device;
    let vb = this._vbPool.add();
    device._stats.vb -= vb._bytes;
    vb._format = item0.model.vertexFormat;
    vb._numVertices = numVertices;
    vb._bytes = vformat._bytes * numVertices;
    vb.update(0, vbuf);
    device._stats.vb += vb._bytes;

    let ib = this._ibPool.add();
    device._stats.ib -= ib._bytes;
    ib._numIndices = numIndices;
    ib._bytes = 2 * numIndices;
    ib.update(0, ibuf);
    device._stats.ib += ib._bytes;

    let mesh = this._meshPool.add();
    mesh._vertexBuffer = vb;
    mesh._indexBuffer = ib;
    stageItem.mesh = mesh;
    return stageItem;
  }

  _transparentStage (camera, items) {
    // update uniforms
    this._device.setUniform('view', mat4.array(_a16_view, camera._view));
    this._device.setUniform('proj', mat4.array(_a16_proj, camera._proj));
    this._device.setUniform('viewProj', mat4.array(_a16_viewProj, camera._viewProj));

    // Culling and batch stage items
    let currEffect = null;
    let vertexFormat = null;
    let vertexCount = 0;
    let indexCount = 0;
    let start = 0;
    for (let i = 0, l = items.length; i < l; ++i) {
      let item = items.data[i];
      if (currEffect != item.effect) {
        // breaking batch
        if (vertexCount > 0 && indexCount > 0) {
          let vertexBytes = vertexCount * vertexFormat._bytes;
          let buf = _createNewBuffer(vertexBytes);
          let vbuf = new Float32Array(buf.buffer, buf.offset, vertexBytes / 4);
          buf = _createNewBuffer(indexCount * PER_INDEX_BYTE);
          let ibuf = new Uint16Array(buf.buffer, buf.offset, indexCount);
          this.batchItem(items, start, i, vbuf, ibuf);
          vertexCount = 0;
          indexCount = 0;
        }
        start = i;
        currEffect = item.effect;
        vertexFormat = item.model.vertexFormat;
      }

      vertexCount += item.model.vertexCount;
      indexCount += item.model.indexCount;
    }

    if (vertexCount > 0 && indexCount > 0) {
      let vertexBytes = vertexCount * vertexFormat._bytes;
      let buf = _createNewBuffer(vertexBytes);
      let vbuf = new Float32Array(buf.buffer, buf.offset, vertexBytes / 4);
      buf = _createNewBuffer(indexCount * PER_INDEX_BYTE);
      let ibuf = new Uint16Array(buf.buffer, buf.offset, indexCount);
      this.batchItem(items, start, items.length, vbuf, ibuf);
    }
    
    // draw it
    for (let i = 0; i < this._batchedItems.length; ++i) {
      let item = this._batchedItems.data[i];
      this._draw(item);
    }
  }
}