// intenral
import RenderData from './lib/scene/render-data';

// deps
import * as math from 'vmath';
import { RecyclePool, Pool } from 'memop';
import canvas from './lib/canvas';

const Texture2D = canvas.Texture2D;
const Device = canvas.Device;

let renderEngine = {
  // core classes
  Device,
  Texture2D,

  // Canvas render support
  canvas,

  // render scene
  RenderData,

  // memop
  RecyclePool,
  Pool,

  // modules
  math
};

export default renderEngine;