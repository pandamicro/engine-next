// intenral
import ForwardRendererWebGL from './lib/forward-renderer-webgl.js';
import ForwardRendererCanvas from './lib/forward-renderer-canvas.js';
import shaders from './lib/shaders/index.js';

import Scene from './lib/scene/scene';
import Camera from './lib/scene/camera';
import SpriteModel from './lib/scene/sprite-model';

import SpriteMaterial from './lib/materials/sprite-material';

import Asset from './lib/assets/asset';
import Material from './lib/assets/material';

import SharedArrayBuffer from './lib/utils/shared-array-buffer';
import renderMode from './lib/utils/render-mode';

const ForwardRenderer = renderMode.supportWebGL ? ForwardRendererWebGL : ForwardRendererCanvas;

// deps
import * as math from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';
import canvas from './lib/canvas';

let renderEngine = {
  // render scene
  ForwardRenderer,
  Scene,
  Camera,
  SpriteModel,
  
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

  // modules
  math,
  renderer,
  gfx,
  canvas
};

export default renderEngine;