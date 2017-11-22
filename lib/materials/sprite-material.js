import gfx from 'gfx.js';
import renderer from 'renderer.js';
import { color4 } from 'vmath';
import Material from '../assets/material';

export default class SpriteMaterial extends Material {
  constructor() {
    super(false);

    var pass = new renderer.Pass('sprite');
    pass.setDepth(true, false);
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
        { name: 'color', type: renderer.PARAM_COLOR4, },
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
        color: color4.new(1.0, 1.0, 1.0, 1.0),
      },
      [
        { name: 'useTexture', value: true },
        { name: 'useColor', value: true },
        { name: 'useModel', value: false },
      ]
    );
    
    this._mainTech = mainTech;
  }

  get effect () {
    return this._effect;
  }

  set useTexture(val) {
    this._effect.setOption('useTexture', val);
  }

  set useModel(val) {
    this._effect.setOption('useModel', val);
  }

  get color () {
    return this._effect.getValue('color');
  }

  set color(val) {
    let color = this._effect.getValue('color');
    color.r = val.r;
    color.g = val.g;
    color.b = val.b;
    color.a = val.a;
  }

  get texture () {
    return this._effect.getValue('texture');
  }

  set texture(val) {
    this._effect.setValue('texture', val);
  }

  clone () {
    let originValues = this._effect._values,
        values = {};
    for (let name in originValues) {
      let value = originValues[name];
      values[name] = value[name];
    }
    let copy = new SpriteMaterial(values);
    copy.texture = this.texture;
    copy.color = this.color;
    return copy;
  }
}