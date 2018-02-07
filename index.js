// intenral
import ForwardRendererWebGL from './lib/forward-renderer-webgl';
import ForwardRendererCanvas from './lib/forward-renderer-canvas';
import shaders from './lib/shaders/index';

import RenderData from './lib/scene/render-data';

import Particles from './lib/vfx/particles';

import Asset from './lib/assets/asset';
import Material from './lib/assets/material';
import MaterialUtil from './lib/utils/material-util';
import SpriteMaterial from './lib/materials/sprite-material';
import GraySpriteMaterial from './lib/materials/gray-sprite-material';
import StencilMaterial from './lib/materials/stencil-material';
import ParticleMaterial from './lib/materials/particle-material';

import renderMode from './lib/utils/render-mode';

// deps
import * as math from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';
import { RecyclePool, Pool } from 'memop';
import canvas from './lib/canvas';

const Scene = renderer.Scene;
const Camera = renderer.Camera;
const View = renderer.View;
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
  View,
  Model,
  RenderData,
  InputAssembler,

  // vfx
  Particles,
  
  // assets
  Asset,
  Material,
  
  // materials
  SpriteMaterial,
  GraySpriteMaterial,
  StencilMaterial,
  ParticleMaterial,

  // shaders
  shaders,

  // utils
  renderMode,
  MaterialUtil,

  // memop
  RecyclePool,
  Pool,

  // modules
  math,
  renderer,
  gfx,
  canvas
};

export default renderEngine;