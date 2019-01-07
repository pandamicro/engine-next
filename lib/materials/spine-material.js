// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';

export default class SpineMaterial extends Material {
  constructor() {
    super(false);

    var pass = new renderer.Pass('spine');
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
        { name: 'texture', type: renderer.PARAM_TEXTURE_2D }
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
        
      },
      [
        { name: 'useModel', value: true },
        { name: 'alphaTest', value: false },
        { name: 'use2DPos', value: true },
        { name: 'useTint', value: false },
      ]
    );
    
    this._mainTech = mainTech;
    this._texture = null;
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

  get use2DPos () {
    return this._effect.getDefine('use2DPos');
  }

  set use2DPos(val) {
    this._effect.define('use2DPos', val);
  }

  get useTint () {
    return this._effect.getDefine('useTint');
  }

  set useTint(val) {
    this._effect.define('useTint', val);
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
    let copy = new SpineMaterial();
    copy._mainTech.copy(this._mainTech);
    copy.texture = this.texture;
    copy.useModel = this.useModel;
    copy.use2DPos = this.use2DPos;
    copy.useTint = this.useTint;
    copy._hash = this._hash;
    return copy;
  }
}