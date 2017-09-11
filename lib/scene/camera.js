import { color4, vec3, mat4 } from 'vmath';
import renderMode from '../utils/render-mode.js';

export default class Camera {
  constructor(viewport, node) {
    this._node = null;
    this._projection = Camera.PROJECTION.PERSPECTIVE;

    // projection properties
    this._near = 0.1;
    this._far = 1024;
    this._fov = Math.PI * 60 / 180; // vertical fov

    // view properties
    this._rect = {
      x: 0, y: 0, w: 1, h: 1
    };
    this._scissor = {
      x: 0, y: 0, w: 1, h: 1
    };

    // clear options
    this._color = color4.create();
    // TODO: this._clearFlags

    // matrix
    this._view = mat4.create();
    this._proj = mat4.create();
    this._viewProj = mat4.create();

    this.setViewport(viewport);
    if (node) {
      this.setNode(node);
    }
  }

  setNode (node) {
    this._node = node;
    // view matrix
    this._node.getWorldMatrix(this._view);
    mat4.invert(this._view, this._view);

    // view-projection
    mat4.mul(this._viewProj, this._proj, this._view);
  }

  setViewport (viewport) {
    if (viewport) {
      this._rect = viewport;
    }

    if (renderMode.supportWebGL) {
      // projection matrix
      // TODO: if this._projDirty
      let aspect = this._rect.w / this._rect.h;
      if (this._projection === Camera.PROJECTION.PERSPECTIVE) {
        // Magic number
        let zeye = this._rect.h / 1.1566;
        let proj = mat4.create();
        mat4.perspective(proj, this._fov, aspect, this._near, zeye * 2);
        let eye = vec3.new(-this._rect.x + this._rect.w / 2, -this._rect.y + this._rect.h / 2, zeye);
        let center = vec3.new(-this._rect.x + this._rect.w / 2, -this._rect.y + this._rect.h / 2, 0.0);
        let up = vec3.new(0.0, 1.0, 0.0);
        let lookup = mat4.create();
        mat4.lookAt(lookup, eye, center, up);
        mat4.mul(this._proj, proj, lookup);
      } else {
        mat4.ortho(this._proj,
          0, this._rect.w, 0, this._rect.h, this._near, this._far
        );
      }
    }
    else {
      mat4.identity(this._proj);
      this._proj.m12 = this._rect.x;
      this._proj.m13 = this._rect.y + this._rect.h;
      this._proj.m05 = -1;
    }
    
    // view-projection
    mat4.mul(this._viewProj, this._proj, this._view);
  }
}
Camera.PROJECTION = {
  PERSPECTIVE: 0,
  ORTHO: 1
}