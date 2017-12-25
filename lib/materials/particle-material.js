import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';
import { vec2 } from 'vmath';

export default class ParticleMaterial extends Material {
  constructor() {
    super(false);

    var pass = new renderer.Pass('vfx_particle');
    pass.setDepth(false, false);
    pass.setCullMode(gfx.CULL_NONE);
    pass.setBlend(
      gfx.BLEND_FUNC_ADD,
      gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
      gfx.BLEND_FUNC_ADD,
      gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
    );

    let mainTech = new renderer.Technique(
      ['transparent'],
      [
        { name: 'texture', type: renderer.PARAM_TEXTURE_2D },
        { name: 'state', type: renderer.PARAM_TEXTURE_2D },
        { name: 'quad', type: renderer.PARAM_TEXTURE_2D },
        { name: 'z', type: renderer.PARAM_FLOAT },
        { name: 'statesize', type: renderer.PARAM_FLOAT2 },
        { name: 'quadsize', type: renderer.PARAM_FLOAT2 },
        { name: 'lb', type: renderer.PARAM_FLOAT2 },
        { name: 'rt', type: renderer.PARAM_FLOAT2 },
      ],
      [
        pass
      ]
    );

    this._effect = new renderer.Effect(
      [
        mainTech,
      ],
      {},
      []
    );
    
    this._mainTech = mainTech;
    this._lb = vec2.create();
    this._rt = vec2.create();
  }

  get effect () {
    return this._effect;
  }

  get texture () {
    return this._effect.getValue('texture');
  }

  set texture (val) {
    this._effect.setValue('texture', val);
  }

  get stateMap () {
    return this._effect.getValue('state');
  }

  set stateMap (val) {
    this._effect.setValue('state', val);
  }

  get quadMap () {
    return this._effect.getValue('quad');
  }

  set quadMap (val) {
    this._effect.setValue('quad', val);
  }

  get stateSize () {
    return this._effect.getValue('statesize');
  }

  set stateSize (val) {
    this._effect.setValue('statesize', val);
  }

  get quadSize () {
    return this._effect.getValue('quadsize');
  }

  set quadSize (val) {
    this._effect.setValue('quadsize', val);
  }

  get z () {
    return this._effect.getValue('z');
  }

  set z (val) {
    this._effect.setValue('z', val);
  }

  get uv () {
    let lb = this._effect.getValue('lb');
    let rt = this._effect.getValue('rt');
    return {
      l: lb.x,
      r: rt.x,
      b: lb.y,
      t: rt.y
    }
  }

  set uv (val) {
    this._lb.x = val.l;
    this._lb.y = val.b;
    this._rt.x = val.r;
    this._rt.y = val.t;
    this._effect.setValue('lb', this._lb);
    this._effect.setValue('rt', this._rt);
  }

  clone () {
    let originValues = this._effect._values,
        values = {};
    for (let name in originValues) {
      let value = originValues[name];
      values[name] = value[name];
    }
    let copy = new ParticleMaterial(values);
    copy.texture = this.texture;
    copy.stateMap = this.stateMap;
    copy.quadMap = this.quadMap;
    copy.stateSize = this.stateSize;
    copy.quadSize = this.quadSize;
    copy.z = this.z;
    copy.uv = this.uv;
    return copy;
  }
}