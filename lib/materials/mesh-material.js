// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';

export default class SpriteMaterial extends Material {
  constructor() {
    super(false);

    var pass = new renderer.Pass('mesh');
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

        { name: 'u_jointsTexture', type: renderer.PARAM_TEXTURE_2D },
        { name: 'u_jointsTextureSize', type: renderer.PARAM_FLOAT },
      ],
      [
        pass
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
        { name: 'useModel', value: false },
        { name: 'useskinning', value: false },
        { name: 'alphaTest', value: false },
      ]
    );
    
    this._mainTech = mainTech;
    this._texture = null;
    this._jointsTexture = null;
    this._jointsTextureSize = 0;
    this._color = {r: 1, g: 1, b: 1, a: 1};
  }

  get effect () {
    return this._effect;
  }
  
  get useModel () {
    return this._effect.getDefine('useModel');
  }

  set useModel(val) {
    this._effect.define('useModel', val);
  }

  get useSkinning () {
    return this._effect.getDefine('useSkinning');
  }

  set useSkinning(val) {
    this._effect.define('useSkinning', val);
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

  get jointsTexture () {
    return this._jointsTexture;
  }

  set jointsTexture(val) {
    if (this._jointsTexture !== val) {
      this._jointsTexture = val;
      this._effect.setProperty('u_jointsTexture', val.getImpl());
      this._texIds['jointsTexture'] = val.getId();
    }
  }

  get jointsTextureSize () {
    return this._jointsTextureSize;
  }

  set jointsTextureSize(val) {
    if (this._jointsTextureSize !== val) {
      this._jointsTextureSize = val;
      this._effect.setProperty('u_jointsTextureSize', val);
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
    copy.color = this.color;
    copy.useModel = this.useModel;
    copu.useSkinning = this.useSkinning;
    copy.updateHash();
    return copy;
  }
}