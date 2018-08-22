// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
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
        { name: 'color', type: renderer.PARAM_COLOR4 },
      ],
      [
        this._pass
      ]
    );

    this._effect = new renderer.Effect(
      [
        mainTech,
      ],
      {
        'color': {r: 1, g: 1, b: 1, a: 1}
      },
      [
        { name: 'useTexture', value: true },
        { name: 'useModel', value: false },
        { name: 'alphaTest', value: true },
        { name: 'use2DPos', value: true },
        { name: 'useColor', value: true },
      ]
    );
    
    this._mainTech = mainTech;
    this._texture = null;
  }

  get effect () {
    return this._effect;
  }
  
  get useTexture () {
    this._effect.getDefine('useTexture');
  }

  set useTexture (val) {
    this._effect.define('useTexture', val);
  }

  get useModel () {
    this._effect.getDefine('useModel');
  }

  set useModel(val) {
    this._effect.define('useModel', val);
  }

  get useColor () {
    this._effect.getDefine('useColor');
  }

  set useColor(val) {
    this._effect.define('useColor', val);
  }

  get texture () {
    return this._texture;
  }

  set texture (val) {
    if (this._texture !== val) {
      this._texture = val;
      this._effect.setProperty('texture', val.getImpl());
      this._texIds['texture'] = val.getId();
    }
  }
  
  get alphaThreshold () {
    return this._effect.getProperty('alphaThreshold');
  }

  set alphaThreshold (val) {
    this._effect.setProperty('alphaThreshold', val);
  }

  clone () {
    let copy = new StencilMaterial();
    copy.useTexture = this.useTexture;
    copy.useModel = this.useModel;
    copy.useColor = this.useColor;
    copy.texture = this.texture;
    copy.alphaThreshold = this.alphaThreshold;
    copy.updateHash();
    return copy;
  }
}