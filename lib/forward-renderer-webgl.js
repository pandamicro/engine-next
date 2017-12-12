import { vec3, mat4 } from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';
import { RecyclePool } from 'memop';

let _camPos = vec3.create();
let _camFwd = vec3.create();
let _v3_tmp1 = vec3.create();

let _a16_view = new Float32Array(16);
let _a16_proj = new Float32Array(16);
let _a16_viewProj = new Float32Array(16);

// Add stage to renderer
renderer.addStage('transparent');

export default class ForwardRenderer extends renderer.Base {
  constructor (device, builtin) {
    super(device, builtin);
    this._registerStage('transparent', this._transparentStage.bind(this));
  }

  render (scene) {
    this._reset();

    for (let i = 0; i < scene._cameras.length; ++i) {
      let view = scene._cameras.data[i].getView();
      this._render(view, scene);
    }
  }

  _transparentStage (view, items) {
    // update uniforms
    this._device.setUniform('view', mat4.array(_a16_view, view._matView));
    this._device.setUniform('proj', mat4.array(_a16_proj, view._matProj));
    this._device.setUniform('viewProj', mat4.array(_a16_viewProj, view._matViewProj));

    // draw it
    for (let i = 0; i < items.length; ++i) {
      let item = items.data[i];
      var ia = item.ia;
      var vb = ia._vertexBuffer;
      var ib = ia._indexBuffer;
      if (vb && ib) {
        vb.update(0, vb._data);
        ib.update(0, ib._data);
      }
      this._draw(item);
    }
  }
}