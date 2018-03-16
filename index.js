// intenral
import ForwardRenderer from './lib/forward-renderer';
import shaders from './lib/shaders/index';

import RenderData from './lib/scene/render-data';
import IARenderData from './lib/scene/ia-render-data';

import Particles from './lib/vfx/particles';

import Asset from './lib/assets/asset';
import TextureAsset from './lib/assets/texture';
import Material from './lib/assets/material';
import MaterialUtil from './lib/utils/material-util';
import SpriteMaterial from './lib/materials/sprite-material';
import GraySpriteMaterial from './lib/materials/gray-sprite-material';
import StencilMaterial from './lib/materials/stencil-material';
import ParticleMaterial from './lib/materials/particle-material';

// deps
import * as math from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';
import { RecyclePool, Pool } from 'memop';
import canvas from './lib/canvas';

const Scene = renderer.Scene;
const Camera = renderer.Camera;
const View = renderer.View;
const Texture2D = gfx.Texture2D;
const Device = gfx.Device;
const Model = renderer.Model;
const InputAssembler = renderer.InputAssembler;

let renderEngine = {
  // core classes
  Device,
  ForwardRenderer,
  Texture2D,

  // Canvas render support
  canvas,

  // render scene
  Scene,
  Camera,
  View,
  Model,
  RenderData,
  IARenderData,
  InputAssembler,

  // vfx
  Particles,
  
  // assets
  Asset,
  TextureAsset,
  Material,
  
  // materials
  SpriteMaterial,
  GraySpriteMaterial,
  StencilMaterial,
  ParticleMaterial,

  // shaders
  shaders,

  // utils
  MaterialUtil,

  // memop
  RecyclePool,
  Pool,

  // modules
  math,
  renderer,
  gfx,
};

export default renderEngine;