import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';

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
        { name: 'us', type: renderer.PARAM_FLOAT2 },
        { name: 'vs', type: renderer.PARAM_FLOAT2 },
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
    let us = this._effect.getValue('us');
    let vs = this._effect.getValue('vs');
    return {
      l: us[0],
      r: us[1],
      b: vs[0],
      t: vs[1]
    }
  }

  set uv (val) {
    let us = new Float32Array([val.l, val.r]);
    let vs = new Float32Array([val.b, val.t]);
    this._effect.setValue('us', us);
    this._effect.setValue('vs', vs);
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