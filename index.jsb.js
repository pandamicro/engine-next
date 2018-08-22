import gfx from './lib/jsb-adapter/jsb-gfx';
import renderer from './lib/jsb-adapter/jsb-renderer';

// intenral
import shaders from './lib/shaders/index';

import RenderData from './lib/scene/render-data';
import IARenderData from './lib/scene/ia-render-data';

import Asset from './lib/assets/asset';
import TextureAsset from './lib/assets/texture';
import Material from './lib/assets/material';
import SpriteMaterial from './lib/materials/sprite-material';
import GraySpriteMaterial from './lib/materials/gray-sprite-material';
import StencilMaterial from './lib/materials/stencil-material';

// deps
import * as math from 'vmath';
import { RecyclePool, Pool } from 'memop';
import canvas from './lib/canvas';

// Add stage to renderer
renderer.config.addStage('transparent');

let renderEngine = {
  // core classes
  Device: gfx.Device,
  ForwardRenderer: renderer.ForwardRenderer,
  Texture2D: gfx.Texture2D,

  // Canvas render support
  canvas,

  // render scene
  Scene: renderer.Scene,
  Camera: renderer.Camera,
  View: renderer.View,
  Model: renderer.Model,
  RenderData,
  IARenderData,
  InputAssembler: renderer.InputAssembler,
  
  // assets
  Asset,
  TextureAsset,
  Material,
  
  // materials
  SpriteMaterial,
  GraySpriteMaterial,
  StencilMaterial,

  // shaders
  shaders,

  // memop
  RecyclePool,
  Pool,

  // modules
  math,
  renderer,
  gfx,
};

export default renderEngine;