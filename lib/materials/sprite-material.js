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
      ]
    );
    
    this._mainTech = mainTech;
    this._texture = null;
  }

  get effect () {
    return this._effect;
  }
  
  get useTexture () {
    this._effect.getDefine('useTexture', val);
  }

  set useTexture(val) {
    this._effect.define('useTexture', val);
  }
  
  get useModel () {
    this._effect.getDefine('useModel', val);
  }

  set useModel(val) {
    this._effect.define('useModel', val);
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

  clone () {
    let copy = new SpriteMaterial(values);
    copy.texture = this.texture;
    copy.useTexture = this.useTexture;
    copy.useModel = this.useModel;
    copy.updateHash();
    return copy;
  }
}