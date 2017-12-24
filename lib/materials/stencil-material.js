import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';

export default class StencilMaterial extends Material {
  constructor() {
    super(false);

    this._pass = new renderer.Pass('sprite');
    this._pass.setDepth(false, false);
    this._pass.setCullMode(gfx.CULL_NONE);
    this._pass.setBlend(
      gfx.BLEND_FUNC_ADD,
      gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
      gfx.BLEND_FUNC_ADD,
      gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
    );

    let mainTech = new renderer.Technique(
      ['transparent'],
      [
        { name: 'texture', type: renderer.PARAM_TEXTURE_2D },
        { name: 'alphaThreshold', type: renderer.PARAM_FLOAT },
      ],
      [
        this._pass
      ]
    );

    this._effect = new renderer.Effect(
      [
        mainTech,
      ],
      {},
      [
        { name: 'useTexture', value: true },
        { name: 'useModel', value: false },
        { name: 'alphaTest', value: true },
      ]
    );
    
    this._mainTech = mainTech;
  }

  get effect () {
    return this._effect;
  }
  
  get useTexture () {
    this._effect.getOption('useTexture', val);
  }

  set useTexture (val) {
    this._effect.setOption('useTexture', val);
  }

  get texture () {
    return this._effect.getValue('texture');
  }

  set texture (val) {
    this._effect.setValue('texture', val);
  }
  
  get alphaThreshold () {
    return this._effect.getValue('alphaThreshold');
  }

  set alphaThreshold (val) {
    this._effect.setValue('alphaThreshold', val);
  }

  clone () {
    let originValues = this._effect._values,
        values = {};
    for (let name in originValues) {
      let value = originValues[name];
      values[name] = value[name];
    }
    let copy = new StencilMaterial(values);
    copy.useTexture = this.useTexture;
    copy.texture = this.texture;
    copy.alphaThreshold = this.alphaThreshold;
    return copy;
  }
}