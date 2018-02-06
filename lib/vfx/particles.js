import gfx from 'gfx.js';
import renderer from 'renderer.js';

const BASE = 255;
const NOISE_SCALE = 10000;
const POS_SCALE = 1;
const LIFE_SCALE = 100;
const COLOR_SCALE = 1;
const ROTATION_SCALE = 1;
const MAX_SCALE = 500;
const START_SIZE_EQUAL_TO_END_SIZE = -1;
// max texture size 2048 * 2048
const MAX_PARTICLE_COUNT = Math.floor(Math.pow(2048 / 3, 2));

let _vertexFmt = new gfx.VertexFormat([
  { name: 'a_quad', type: gfx.ATTR_TYPE_FLOAT32, num: 2 }
]);

let _dataOpts = {
  width: 0,
  height: 0,
  minFilter: gfx.FILTER_NEAREST,
  magFilter: gfx.FILTER_NEAREST,
  wrapS: gfx.WRAP_CLAMP,
  wrapT: gfx.WRAP_CLAMP,
  format: gfx.TEXTURE_FMT_RGBA8,
  images: []
};

function encode (value, scale, outArr, offset) {
  value = value * scale + BASE * BASE / 2;
  outArr[offset] = Math.floor((value % BASE) / BASE * 255);
  outArr[offset+1] = Math.floor(Math.floor(value / BASE) / BASE * 255);
}

function decode (arr, offset, scale) {
  return (((arr[offset] / 255) * BASE +
           (arr[offset+1] / 255) * BASE * BASE) - BASE * BASE / 2) / scale;
}

function clampf (value, min_inclusive, max_inclusive) {
  return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
}

export default class Particles {
  constructor (device, renderer, config) {
    this._device = device;
    this._config = config;
    this._sizeScale = 1;
    this._accelScale = 1;
    this._radiusScale = 1;
    
    let opts = {};
    let programLib = renderer._programLib;
    this.programs = {
      emitter: programLib.getProgram('vfx_emitter', opts),
      update: programLib.getProgram('vfx_update', opts),
      quad: programLib.getProgram('vfx_quad', opts),
    }

    this.textures = {
      // need swap
      state0: new gfx.Texture2D(device, opts),
      state1: new gfx.Texture2D(device, opts),
      // no swap needed
      noise: new gfx.Texture2D(device, opts),
      quads: new gfx.Texture2D(device, opts),
    };

    this.framebuffers = {
      state0: new gfx.FrameBuffer(device, 0, 0, {
        colors: [this.textures.state0]
      }),
      state1: new gfx.FrameBuffer(device, 0, 0, {
        colors: [this.textures.state1]
      }),
      quads: new gfx.FrameBuffer(device, 0, 0, {
        colors: [this.textures.quads]
      })
    };

    let verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    let indices = new Uint8Array([ 0, 1, 2, 1, 3, 2]);
    this.buffers = {
      updateVB: new gfx.VertexBuffer(device, _vertexFmt, gfx.USAGE_STATIC, verts, 4),
      updateIB: new gfx.IndexBuffer(device, gfx.INDEX_FMT_UINT8, gfx.USAGE_STATIC, indices, 6),
      indexes: null,
      particleCache: null
    };

    this._elapsed = 0;
    this._stopped = false;

    this.updateMaxParticle(config);
    this.updateSizeScale(config);
    this.updateRadiusScale(config);
    this.updateAccelScale(config);

    // Vector uniforms
    this._pos = new Float32Array([config.sourcePos.x, config.sourcePos.y]);
    this._posVar = new Float32Array([config.posVar.x, config.posVar.y]);
    this._gravity = new Float32Array([config.gravity.x, config.gravity.y]);
    this._color = new Float32Array([config.startColor.r, config.startColor.g, config.startColor.b, config.startColor.a]);
    this._colorVar = new Float32Array([config.startColorVar.r, config.startColorVar.g, config.startColorVar.b, config.startColorVar.a]);
    this._endColor = new Float32Array([config.endColor.r, config.endColor.g, config.endColor.b, config.endColor.a]);
    this._endColorVar = new Float32Array([config.endColorVar.r, config.endColorVar.g, config.endColorVar.b, config.endColorVar.a]);
  }

  get vertexFormat () {
    return _vertexFmt;
  }

  // TODO: it's too slow, need other approach to retrieve the real particle count
  get particleCount () {
    let particleCount = 0;
    let device = this._device;
    device.setFrameBuffer(this.framebuffers.state0);
    let w = this.statesize[0], h = this.statesize[1],
        tw = this._tw, th = this._th,
        rgba = this.buffers.particleCache;
    device._gl.readPixels(0, 0, w, h, device._gl.RGBA, device._gl.UNSIGNED_BYTE, rgba);
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        let offset = y * 3 * tw * 12 + x * 12;
        let rest = decode(rgba, offset, LIFE_SCALE);
        if (rest > 0) {
          particleCount++;
        }
      }
    }
    return particleCount;
  }

  get stopped () {
    return this._stopped;
  }

  updateMaxParticle (config) {
    let emissionMax = Math.floor(config.emissionRate * (config.life + config.lifeVar));
    let maxParticle;
    if (config.totalParticles > emissionMax) {
      maxParticle = emissionMax;
      this._emitVar = config.lifeVar;
    }
    else {
      maxParticle = config.totalParticles;
      this._emitVar = 0;
    }
    if (maxParticle !== this._maxParticle) {
      this._maxParticle = maxParticle;
      this._tw = Math.ceil(Math.sqrt(maxParticle));
      this._th = Math.floor(Math.sqrt(maxParticle));
      this.initTextures();
      this.initBuffers();
    }
  }

  set pos (pos) {
    this._pos[0] = pos.x;
    this._pos[1] = pos.y;
  }

  set posVar (posVar) {
    this._posVar[0] = posVar.x;
    this._posVar[1] = posVar.y;
  }

  set gravity (gravity) {
    this._gravity[0] = gravity.x;
    this._gravity[1] = gravity.y;
  }

  set startColor (color) {
    this._color[0] = color.r;
    this._color[1] = color.g;
    this._color[2] = color.b;
    this._color[3] = color.a;
  }

  set startColorVar (color) {
    this._colorVar[0] = color.r;
    this._colorVar[1] = color.g;
    this._colorVar[2] = color.b;
    this._colorVar[3] = color.a;
  }

  set endColor (color) {
    this._endColor[0] = color.r;
    this._endColor[1] = color.g;
    this._endColor[2] = color.b;
    this._endColor[3] = color.a;
  }

  set endColorVar (color) {
    this._endColorVar[0] = color.r;
    this._endColorVar[1] = color.g;
    this._endColorVar[2] = color.b;
    this._endColorVar[3] = color.a;
  }

  _updateTex (tex, data, width, height) {
    _dataOpts.images.length = 1;
    _dataOpts.images[0] = data;
    _dataOpts.width = width;
    _dataOpts.height = height;
    tex.update(_dataOpts);
  }

  _initNoise () {
    let tw = this._tw, th = this._th;
    let w = (tw + 1) * 3, h = (th + 1) * 3;
    let data = new Uint8Array(w * h * 4);
    let offset = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        encode(Math.random(), NOISE_SCALE, data, offset);
        encode(Math.random(), NOISE_SCALE, data, offset + 2);
        offset += 4;
      }
    }
    this._noisesize = new Float32Array([w, h]);
    this._updateTex(this.textures.noise, data, w, h);
  }

  initTextures () {
    let tw = this._tw, th = this._th;
    this.statesize = new Float32Array([tw * 3, th * 3]);
    this.quadsize = new Float32Array([tw * 2, th * 2]);
    let data = new Uint8Array(tw * 3 * th * 3 * 4);
    // decode([97, 97], 0, LIFE_SCALE); equals to -128, just for initalize a negative value in life
    data.fill(97);
    this._updateTex(this.textures.state0, data, tw * 3, th * 3);
    this._updateTex(this.textures.state1, data, tw * 3, th * 3);
    this._updateTex(this.textures.quads, null, tw * 2, th * 2);
    this._initNoise();
  }

  initBuffers () {
    var w = this.quadsize[0], h = this.quadsize[1],
        indexes = new Float32Array(w * h * 2),
        i = 0;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        indexes[i + 0] = x;
        indexes[i + 1] = y;
        i += 2;
      }
    }
    this.buffers.indexes = indexes;
    this.buffers.particleCache = new Uint8Array(this.statesize[0] * this.statesize[1] * 4);
  }

  updateSizeScale (config) {
    let size = config.startSize,
        sizeVar = config.startSizeVar,
        endSize = config.endSize,
        endSizeVar = config.endSizeVar;
    let scale = Math.floor(Math.pow(BASE, 2) / Math.max(size + sizeVar, endSize + endSizeVar));
    this._sizeScale = clampf(scale, 1, MAX_SCALE);
  }

  updateAccelScale (config) {
    let radial = config.radialAccel,
        radialVar = config.radialAccelVar,
        tangential = config.tangentialAccel,
        tangentialVar = config.tangentialAccelVar;
    let accelScale = Math.floor(Math.pow(BASE, 2) / Math.max(Math.abs(radial) + radialVar, Math.abs(tangential) + tangentialVar) / 2);
    this._accelScale = clampf(accelScale, 1, MAX_SCALE);
  }

  updateRadiusScale (config) {
    let radius = config.startRadius,
        radiusVar = config.startRadiusVar,
        endRadius = config.endRadius,
        endRadiusVar = config.endRadiusVar;
    let scale = Math.floor(Math.pow(BASE, 2) / Math.max(Math.abs(radius) + radiusVar, Math.abs(endRadius) + endRadiusVar));
    this._radiusScale = clampf(scale, 1, MAX_SCALE);
  }

  resetSystem () {
    this._stopped = false;
  }

  stopSystem () {
    this._stopped = true;
  }

  getState (framebuffer) {
    let device = this._device;
    device.setFrameBuffer(framebuffer);
    let w = this.statesize[0], h = this.statesize[1],
        tw = this._tw, th = this._th,
        rgba = new Uint8Array(w * h * 4);
    device._gl.readPixels(0, 0, w, h, device._gl.RGBA, device._gl.UNSIGNED_BYTE, rgba);
    let particles = [];
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        let offset = y * 3 * tw * 12 + x * 12;
        let colorI = offset + 1 * 4;
        let deltaRGI = offset + 2 * 4;
        let deltaBAI = offset + tw * 12;
        let sizeI = offset + tw * 12 + 1 * 4;
        let rotI = offset + tw * 12 + 2 * 4;
        let control1I = offset + 2 * tw * 12;
        let control2I = offset + 2 * tw * 12 + 1 * 4;
        let posI = offset + 2 * tw * 12 + 2 * 4;
        
        let rest = decode(rgba, offset, LIFE_SCALE);
        let life = decode(rgba, offset + 2, LIFE_SCALE);
        let color = {
          r: rgba[colorI],
          g: rgba[colorI+1],
          b: rgba[colorI+2],
          a: rgba[colorI+3]
        };
        let deltaColor = {
          r: decode(rgba, deltaRGI, COLOR_SCALE),
          g: decode(rgba, deltaRGI + 2, COLOR_SCALE),
          b: decode(rgba, deltaBAI, COLOR_SCALE),
          a: decode(rgba, deltaBAI + 2, COLOR_SCALE)
        };
        let size = decode(rgba, sizeI, this._sizeScale);
        let deltaSize = decode(rgba, sizeI + 2, this._sizeScale);
        let rot = decode(rgba, rotI, ROTATION_SCALE);
        let deltaRot = decode(rgba, rotI + 2, ROTATION_SCALE);
        let control;
        if (this._config.emitterMode === 0) {
          control = [
            decode(rgba, control1I, POS_SCALE),
            decode(rgba, control1I + 2, POS_SCALE),
            decode(rgba, control2I, this._accelScale),
            decode(rgba, control2I + 2, this._accelScale)
          ];
        }
        else {
          control = [
            decode(rgba, control1I, ROTATION_SCALE),
            decode(rgba, control1I + 2, this._radiusScale),
            decode(rgba, control2I, ROTATION_SCALE),
            decode(rgba, control2I + 2, this._radiusScale)
          ];
        }
        let pos = {
          x: decode(rgba, posI, POS_SCALE),
          y: decode(rgba, posI + 2, POS_SCALE)
        }
        particles.push({
          rest,
          life,
          color,
          deltaColor,
          size,
          deltaSize,
          rot,
          deltaRot,
          control: control,
          pos: pos
        });
      }
    }
    return particles;
  }

  getNoise () {
    let device = this._device;
    let framebuffer = new gfx.FrameBuffer(device, 0, 0, {
        colors: [this.textures.noise]
      });
    device.setFrameBuffer(framebuffer);
    let w = this._noisesize[0], h = this._noisesize[1],
        rgba = new Uint8Array(w * h * 4);
    device._gl.readPixels(0, 0, w, h, device._gl.RGBA, device._gl.UNSIGNED_BYTE, rgba);
    let noises = [];
    let offset = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        noises.push(decode(rgba, offset, 10000));
        noises.push(decode(rgba, offset+2, 10000));
        offset += 4;
      }
    }
    return noises;
  }

  getQuads () {
    let device = this._device;
    let framebuffer = new gfx.FrameBuffer(device, 0, 0, {
        colors: [this.textures.quads]
      });
    device.setFrameBuffer(framebuffer);
    let w = this.quadsize[0], h = this.quadsize[1],
        rgba = new Uint8Array(w * h * 4);
    device._gl.readPixels(0, 0, w, h, device._gl.RGBA, device._gl.UNSIGNED_BYTE, rgba);
    let quads = [];
    let off1 = 0, off2 = 0;
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        off1 = (y * w + x) * 4;
        off2 = ((y + 1) * w + x) * 4;
        quads.push([
          decode(rgba, off1, POS_SCALE),
          decode(rgba, off1+2, POS_SCALE),
          decode(rgba, off1+4, POS_SCALE),
          decode(rgba, off1+6, POS_SCALE),
          decode(rgba, off2, POS_SCALE),
          decode(rgba, off2+2, POS_SCALE),
          decode(rgba, off2+4, POS_SCALE),
          decode(rgba, off2+6, POS_SCALE)
        ]);
      }
    }
    return quads;
  }

  step (dt) {
    let config = this._config;
    let device = this._device;

    // setup
    device.setViewport(0, 0, this.statesize[0], this.statesize[1]);

    // Emitter
    device.setFrameBuffer(this.framebuffers.state1);
    device.setTexture('noise', this.textures.noise, 0);
    device.setTexture('state', this.textures.state0, 1);
    device.setUniform('statesize', this.statesize);
    device.setUniform('noisesize', this._noisesize);
    device.setUniform('stopped', this._stopped);
    device.setUniform('dt', dt);
    device.setUniform('mode', config.emitterMode);
    device.setUniform('noiseId', Math.floor(Math.random() * 16));
    device.setUniform('emitVar', this._emitVar);
    device.setUniform('life', config.life);
    device.setUniform('lifeVar', config.lifeVar);
    device.setUniform('pos', this._pos);
    device.setUniform('posVar', this._posVar);
    device.setUniform('color', this._color);
    device.setUniform('colorVar', this._colorVar);
    device.setUniform('endColor', this._endColor);
    device.setUniform('endColorVar', this._endColorVar);
    device.setUniform('size', config.startSize);
    device.setUniform('sizeVar', config.startSizeVar);
    device.setUniform('endSize', config.endSize);
    device.setUniform('endSizeVar', config.endSizeVar);
    device.setUniform('rot', config.startSpin);
    device.setUniform('rotVar', config.startSpinVar);
    device.setUniform('endRot', config.endSpin);
    device.setUniform('endRotVar', config.endSpinVar);
    device.setUniform('angle', config.angle);
    device.setUniform('angleVar', config.angleVar);
    device.setUniform('speed', config.speed);
    device.setUniform('speedVar', config.speedVar);
    device.setUniform('radial', config.radialAccel);
    device.setUniform('radialVar', config.radialAccelVar);
    device.setUniform('tangent', config.tangentialAccel);
    device.setUniform('tangentVar', config.tangentialAccelVar);
    device.setUniform('radius', config.startRadius);
    device.setUniform('radiusVar', config.startRadiusVar);
    device.setUniform('endRadius', config.endRadius);
    device.setUniform('endRadiusVar', config.endRadiusVar);
    device.setUniform('rotatePS', config.rotatePerS);
    device.setUniform('rotatePSVar', config.rotatePerSVar);
    device.setUniform('sizeScale', this._sizeScale);
    device.setUniform('accelScale', this._accelScale);
    device.setUniform('radiusScale', this._radiusScale);
    device.setVertexBuffer(0, this.buffers.updateVB);
    device.setIndexBuffer(this.buffers.updateIB);
    device.setProgram(this.programs.emitter);
    device.draw(0, this.buffers.updateIB.count);

    // Update
    device.setFrameBuffer(this.framebuffers.state0);
    device.setTexture('state', this.textures.state1, 0);
    device.setUniform('statesize', this.statesize);
    device.setUniform('dt', dt);
    device.setUniform('mode', config.emitterMode);
    device.setUniform('gravity', this._gravity);
    device.setUniform('sizeScale', this._sizeScale);
    device.setUniform('accelScale', this._accelScale);
    device.setUniform('radiusScale', this._radiusScale);
    device.setVertexBuffer(0, this.buffers.updateVB);
    device.setIndexBuffer(this.buffers.updateIB);
    device.setProgram(this.programs.update);
    device.draw(0, this.buffers.updateIB.count);

    // Draw quad
    device.setViewport(0, 0, this._tw * 2, this._th * 2);
    device.setFrameBuffer(this.framebuffers.quads);
    device.setTexture('state', this.textures.state0, 0);
    device.setUniform('quadsize', this.quadsize);
    device.setUniform('statesize', this.statesize);
    device.setUniform('sizeScale', this._sizeScale);
    device.setVertexBuffer(0, this.buffers.updateVB);
    device.setIndexBuffer(this.buffers.updateIB);
    device.setProgram(this.programs.quad);
    device.draw(0, this.buffers.updateIB.count);

    this._elapsed += dt;
    if (config.duration !== -1 && config.duration < this._elapsed) {
      this.stopSystem();
    }
  }
}