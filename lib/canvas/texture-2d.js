// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
export default class Texture2D {

  /**
   * @constructor
   * @param {Device} device
   * @param {Object} options
   * @param {Array} options.images
   * @param {Number} options.width
   * @param {Number} options.height
   */
  constructor(device, options) {
    this._device = device;
    
    this._width = 4;
    this._height = 4;

    this._image = null;

    if (options) {
      if (options.width !== undefined) {
        this._width = options.width;
      }
      if (options.height !== undefined) {
        this._height = options.height;
      }

      this.updateImage(options);
    }
  }

  update (options) {
    this.updateImage(options);
  }

  updateImage(options) {
    if (options.images && options.images[0]) {
      let image = options.images[0];
      if (image && image !== this._image) {
        this._image = image;
      }
    }
  }

  destroy () {
    this._image = null;
  }
}