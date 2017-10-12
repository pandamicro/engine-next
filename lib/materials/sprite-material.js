import gfx from 'gfx.js';
import renderer from 'renderer.js';
import Material from '../assets/material';

export default class SpriteMaterial extends Material {
  constructor(values = {}) {
    super(false);

    let mainTech = new renderer.Technique(
      renderer.STAGE_TRANSPARENT,
      [
        { name: 'mainTexture', type: renderer.PARAM_TEXTURE_2D },
      ],
      [
        new renderer.Pass('sprite')
      ]
    );

    this._effect = new renderer.Effect(
      [
        mainTech,
        // shadowTech
      ],
      values,
      {
        useTexture: true,
        useModel: false,
      }
    );
    
    let pass = mainTech.passes[0];
    mainTech.stages = renderer.STAGE_TRANSPARENT;
    pass.setDepth(true, false);
    pass.setCullMode(gfx.CULL_NONE);
    pass.setBlend(
      gfx.BLEND_FUNC_ADD,
      gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
      gfx.BLEND_FUNC_ADD,
      gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
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

  get mainTexture () {
    return this._effect.getValue('mainTexture');
  }

  set mainTexture(val) {
    this._effect.setValue('mainTexture', val);
  }

  clone () {
    let originValues = this._effect._values,
        values = {};
    for (let name in originValues) {
      let value = originValues[name];
      values[name] = value[name];
    }
    let copy = new SpriteMaterial(values);
    copy.mainTexture = this.mainTexture;
    return copy;
  }
}