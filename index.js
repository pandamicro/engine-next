// intenral
import ForwardRendererWebGL from './lib/forward-renderer-webgl';
import ForwardRendererCanvas from './lib/forward-renderer-canvas';
import shaders from './lib/shaders/index';

import Scene from './lib/scene/scene';
import Camera from './lib/scene/camera';

import SpriteModel from './lib/scene/sprite-model';
import SlicedModel from './lib/scene/sliced-model';

import SpriteMaterial from './lib/materials/sprite-material';

import Asset from './lib/assets/asset';
import Material from './lib/assets/material';

import SharedArrayBuffer from './lib/utils/shared-array-buffer';
import renderMode from './lib/utils/render-mode';
import MaterialUtil from './lib/utils/material-util';

// deps
import * as math from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';
import canvas from './lib/canvas';

const ForwardRenderer = renderMode.supportWebGL ? ForwardRendererWebGL : ForwardRendererCanvas;
const Texture2D = renderMode.supportWebGL ? gfx.Texture2D : canvas.Texture2D;
const Device = renderMode.supportWebGL ? gfx.Device : canvas.Device;

let renderEngine = {
  // core classes
  Device,
  ForwardRenderer,
  Texture2D,

  // render scene
  Scene,
  Camera,

  // models
  SpriteModel,
  SlicedModel,
  
  // assets
  Asset,
  Material,
  
  // materials
  SpriteMaterial,

  // shaders
  shaders,

  // utils
  SharedArrayBuffer,
  renderMode,
  MaterialUtil,

  // modules
  math,
  renderer,
  gfx,
  canvas
};

export default renderEngine;