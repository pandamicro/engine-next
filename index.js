// intenral
import App from './lib/app';
import Scene from './lib/scene/scene';
import Camera from './lib/scene/camera';
import Model from './lib/scene/model';
import resl from './lib/resl';

import SpriteMaterial from './lib/materials/sprite-material';

import Asset from './lib/assets/asset';
import Mesh from './lib/assets/mesh';
import Material from './lib/assets/material';

import SharedArrayBuffer from './lib/utils/shared-array-buffer';

// deps
import { Node } from 'scene-graph';
import * as math from 'vmath';
import renderer from 'renderer.js';
import gfx from 'gfx.js';

let engine = {
  // classes
  App,
  Scene,
  Node,
  Camera,
  Model,

  // materials
  SpriteMaterial,

  // assets
  Asset,
  Mesh,
  Material,

  // utils
  SharedArrayBuffer,

  // modules
  math,
  renderer,
  gfx,

  // DELME: temporary
  resl,
};

export default engine;