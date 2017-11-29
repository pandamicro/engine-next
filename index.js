// intenral
import ForwardRendererWebGL from './lib/forward-renderer-webgl';
import ForwardRendererCanvas from './lib/forward-renderer-canvas';
import shaders from './lib/shaders/index';

import Camera from './lib/scene/camera';
import RenderData from './lib/scene/render-data';

import SpriteMaterial from './lib/materials/sprite-material';

import Asset from './lib/assets/asset';
import Material from './lib/assets/material';

import renderMode from './lib/utils/render-mode';
import MaterialUtil from './lib/utils/material-util';

// deps
import * as math from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';
import { RecyclePool } from 'memop';
import canvas from './lib/canvas';

const Scene = renderer.Scene;
const ForwardRenderer = renderMode.supportWebGL ? ForwardRendererWebGL : ForwardRendererCanvas;
const Texture2D = renderMode.supportWebGL ? gfx.Texture2D : canvas.Texture2D;
const Device = renderMode.supportWebGL ? gfx.Device : canvas.Device;
const Model = renderer.Model;
const InputAssembler = renderer.InputAssembler;

let renderEngine = {
  // core classes
  Device,
  ForwardRenderer,
  Texture2D,

  // render scene
  Scene,
  Camera,
  Model,
  RenderData,
  InputAssembler,
  
  // assets
  Asset,
  Material,
  
  // materials
  SpriteMaterial,

  // shaders
  shaders,

  // utils
  renderMode,
  MaterialUtil,

  // memop
  RecyclePool,

  // modules
  math,
  renderer,
  gfx,
  canvas
};

export default renderEngine;