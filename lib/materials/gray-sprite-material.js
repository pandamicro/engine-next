// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';

export default class GraySpriteMaterial extends Material {
  constructor() {
    super(false);

    var pass = new renderer.Pass('gray_sprite');
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

    this._color = {r: 1, g: 1, b: 1, a: 1};
    this._effect = new renderer.Effect(
      [
        mainTech,
      ],
      {
        'color': this._color
      },
      []
    );
    
    this._mainTech = mainTech;
    this._texture = null;
  }

  get effect () {
    return this._effect;
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

  get color () {
    return this._color;
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
    let copy = new GraySpriteMaterial();
    copy.texture = this.texture;
    copy.color = this.color;
    copy.updateHash();
    return copy;
  }
}