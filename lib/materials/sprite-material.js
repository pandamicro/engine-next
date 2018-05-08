// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';

export default class SpriteMaterial extends Material {
  constructor() {
    super(false);

    var pass = new renderer.Pass('sprite');
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
        { name: 'color', type: renderer.PARAM_COLOR4 },
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
      [
        { name: 'useTexture', value: true },
        { name: 'useModel', value: false },
        { name: 'alphaTest', value: false },
        { name: 'use2D', value: true },
        { name: 'useUniformColor', value: true },
      ]
    );
    
    this._mainTech = mainTech;
    this._texture = null;
    this._color = {r: 0, g: 0, b: 0, a: 1};
  }

  get effect () {
    return this._effect;
  }
  
  get useTexture () {
    this._effect.getDefine('useTexture');
  }

  set useTexture(val) {
    this._effect.define('useTexture', val);
  }
  
  get useModel () {
    this._effect.getDefine('useModel');
  }

  set useModel(val) {
    this._effect.define('useModel', val);
  }

  get use2D () {
    this._effect.getDefine('use2D');
  }

  set use2D(val) {
    this._effect.define('use2D', val);
  }

  get useUniformColor () {
    this._effect.getDefine('useUniformColor');
  }

  set useUniformColor(val) {
    this._effect.define('useUniformColor', val);
  }

  get texture () {
    return this._texture;
  }

  set texture(val) {
    if (this._texture !== val) {
      this._texture = val;
      this._effect.setProperty('texture', val.getImpl());
      this._texIds['texture'] = val.getId();
    }
  }

  get color () {
    return this._effect.getProperty('color');
  }

  set color (val) {
    let color = this._color;
    color.r = val.r / 255;
    color.g = val.g / 255;
    color.b = val.b / 255;
    color.a = val.a / 255;
    this._effect.setProperty('color', color);
  }

  clone () {
    let copy = new SpriteMaterial();
    copy.texture = this.texture;
    copy.useTexture = this.useTexture;
    copy.useModel = this.useModel;
    copy.updateHash();
    copy.use2D = this.use2D;
    copy.useUniformColor = this.useUniformColor;
    return copy;
  }
}