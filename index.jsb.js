import './lib/jsb-adapter/gfx';
import './lib/jsb-adapter/renderer';

let gfx = window.gfx;
let renderer = window.renderer;
let ForwardRenderer = window.renderer.ForwardRenderer;

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

const Scene = renderer.Scene;
const Camera = renderer.Camera;
const View = renderer.View;
const Texture2D = gfx.Texture2D;
const Device = gfx.Device;
const Model = renderer.Model;
const InputAssembler = renderer.InputAssembler;

// Add stage to renderer
renderer.config.addStage('transparent');

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