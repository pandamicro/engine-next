import canvas from './canvas';
import rendererWebGL from 'renderer.js';
const renderer = canvas.renderer;
const STAGE_TRANSPARENT = rendererWebGL.STAGE_TRANSPARENT;

export default class ForwardRenderer extends renderer.Base {
  constructor (device, builtin) {
    super(device, builtin);
    
    this._stage2fn[STAGE_TRANSPARENT] = this._transparentStage.bind(this);
  }

  reset () {
    // Reset renderer internal datas
    this._reset();
  }

  render (camera, scene) {
    this.reset();

    // visit logic node tree to get zorders
    // scene.visit();

    this._render(camera, scene, [
      STAGE_TRANSPARENT,
    ]);
  }

  _transparentStage (camera, items) {
    let ctx = this._device._ctx;
    let mat = camera._viewProj;

    // Culling and draw items
    for (let i = 0, l = items.length; i < l; ++i) {
      ctx.setTransform(mat.m00, mat.m01, mat.m04, mat.m05, mat.m12, mat.m13);
      let item = items.data[i];
      this._draw(item);
    }
  }
}