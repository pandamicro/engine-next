import gfx from 'gfx.js';
import renderer from 'renderer.js';
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
    return copy;
  }
}