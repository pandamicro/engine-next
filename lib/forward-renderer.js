import { vec3, mat4 } from 'vmath';
import renderer from 'renderer.js';

let _camPos = vec3.create();
let _camFwd = vec3.create();
let _v3_tmp1 = vec3.create();

let _a16_view = new Float32Array(16);
let _a16_proj = new Float32Array(16);
let _a16_viewProj = new Float32Array(16);

export default class ForwardRenderer extends renderer.Base {
  constructor(device, builtin) {
    super(device, builtin);

    this._stage2fn[renderer.STAGE_TRANSPARENT] = this._transparentStage.bind(this);
  }

  render(camera, scene) {
    this._reset();

    // visit logic node tree to get zorders
    // scene.visit();

    this._render(camera, scene, [
      renderer.STAGE_TRANSPARENT,
    ]);
  }

  _transparentStage(camera, items) {
    // update uniforms
    this._device.setUniform('view', mat4.array(_a16_view, camera._view));
    this._device.setUniform('proj', mat4.array(_a16_proj, camera._proj));
    this._device.setUniform('viewProj', mat4.array(_a16_viewProj, camera._viewProj));

    // Culling and batch stage items

    // draw it
    for (let i = 0; i < items.length; ++i) {
      let item = items.data[i];
      this._draw(item);
    }
  }
}