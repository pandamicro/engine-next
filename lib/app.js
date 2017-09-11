import gfx from 'gfx.js';
import canvas from './canvas/index.js';
import Input from 'input.js';
import ForwardRendererWebGL from './forward-renderer-webgl.js';
import ForwardRendererCanvas from './forward-renderer-canvas.js';
import chunks from './shaders/chunks/index.js';
import templates from './shaders/templates/index.js';
import renderMode from './utils/render-mode.js';

const Device = renderMode.supportWebGL ? gfx.Device : canvas.Device;
const Texture2D = renderMode.supportWebGL ? gfx.Texture2D : canvas.Texture2D;
const ForwardRenderer = renderMode.supportWebGL ? ForwardRendererWebGL : ForwardRendererCanvas;

function _initBuiltins(device) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');

  // default texture
  canvas.width = canvas.height = 128;
  context.fillStyle = '#ddd';
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = '#555';
  context.fillRect(0, 0, 64, 64);
  context.fillStyle = '#555';
  context.fillRect(64, 64, 64, 64);

  let defaultTexture = new Texture2D(device, {
    images: [canvas],
    width: 128,
    height: 128,
    wrapS: gfx.WRAP_REPEAT,
    wrapT: gfx.WRAP_REPEAT,
    format: gfx.TEXTURE_FMT_RGB8,
    mipmap: true,
  });

  return {
    defaultTexture,
    // defaultTextureCube, // TODO
  };
}

function _makeTick(app_) {
  const app = app_;

  return function (timestamp) {
    app._tickID = requestAnimationFrame(app._tick);

    if (timestamp === undefined) {
      timestamp = 0;
    }
    app.deltaTime = (timestamp - app._lasttime) / 1000;
    app.totalTime = timestamp / 1000;
    app._lasttime = timestamp;

    // TODO: change this to this.emit('update');
    if (app.onTick) {
      app.onTick();
    }

    // update renderer
    app._activeCamera._rect.w = app._canvas.width;
    app._activeCamera._rect.h = app._canvas.height;
    app._forward.render(app._activeCamera, app._scene);

    // TODO: update other system

    // TODO
    // app.lstats.tick();

    app._input.reset();
  };
}

export default class App {
  constructor(canvas, opts) {
    // sub-systems
    this._canvas = canvas;
    this._device = new Device(canvas, opts);
    this._input = new Input(canvas, {
      lock: true
    });
    let builtins = _initBuiltins(this._device);
    this._forward = new ForwardRenderer(this._device, {
      defaultTexture: builtins.defaultTexture,
      programTemplates: templates,
      programChunks: chunks,
    });

    // life callback
    this.onTick = null;
    this._tick = _makeTick(this);

    // public
    this.deltaTime = 0;
    this.totalTime = 0;

    // internal
    this._tickID = null;
    this._lasttime = 0;
    this._scene = null;
    this._activeCamera = null;

    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  get device() {
    return this._device;
  }

  setCamera(camera) {
    this._activeCamera = camera;
  }

  run(scene) {
    if (this._scene) {
      // TODO: unload scene??
    }
    this._scene = scene;
    this._tickID = requestAnimationFrame(this._tick);
  }

  resize() {
    if (!this._canvas) {
      return;
    }

    let bcr = this._canvas.parentElement.getBoundingClientRect();
    this._canvas.width = bcr.width;
    this._canvas.height = bcr.height;

    this._input.resize();
  }

  destroy () {
    this._input.destroy();
    if (this._tickID) {
      cancelAnimationFrame(this._tickID);
    }
  }
}