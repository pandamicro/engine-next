import { color4, vec3, mat4 } from 'vmath';
import renderer from 'renderer.js';
import renderMode from '../utils/render-mode.js';

export default class Camera {
  constructor(viewport, node) {
    this.view = null;

    this._node = null;
    this._poolID = -1;
    this._projection = Camera.PROJECTION.PERSPECTIVE;

    // clear options
    this._color = color4.new(0, 0, 0, 1);
    this._depth = 1;
    this._stencil = 1;
    this._clearFlags = renderer.CLEAR_COLOR | renderer.CLEAR_DEPTH;

    // projection properties
    this._near = 0.1;
    this._far = 1024;
    this._fov = Math.PI * 60 / 180; // vertical fov

    // view properties
    this._rect = {
      x: 0, y: 0, w: 1, h: 1
    };
    this._stages = [];
    this._framebuffer = null;

    // matrix
    this._matView = mat4.create();
    this._matProj = mat4.create();
    this._matViewProj = mat4.create();
    this._matInvViewProj = mat4.create();

    this.setViewport(viewport);
    if (node) {
      this.setNode(node);
    }
  }
  
  setColor(r, g, b, a) {
    color4.set(this._color, r, g, b, a);
  }

  setDepth(depth) {
    this._depth = depth;
  }

  setStencil(stencil) {
    this._stencil = stencil;
  }

  setClearFlags(flags) {
    this._clearFlags = flags;
  }

  setStages(stages) {
    this._stages = stages;
  }

  setFramebuffer(framebuffer) {
    this._framebuffer = framebuffer;
  }

  setNode (node) {
    this._node = node;
    // view matrix
    this._node.getWorldMatrix(this._matView);
    mat4.invert(this._matView, this._matView);

    // view-projection
    mat4.mul(this._matViewProj, this._matProj, this._matView);
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
        mat4.mul(this._matProj, proj, lookup);
      } else {
        mat4.ortho(this._matProj,
          0, this._rect.w, 0, this._rect.h, this._near, this._far
        );
      }
    }
    else {
      mat4.identity(this._matProj);
      this._matProj.m12 = this._rect.x;
      this._matProj.m13 = this._rect.y + this._rect.h;
      this._matProj.m05 = -1;
    }
    
    // view-projection
    mat4.mul(this._matViewProj, this._matProj, this._matView);
    mat4.invert(this._matInvViewProj, this._matViewProj);
  }

  getView() {
    return this;
  }
}
Camera.PROJECTION = {
  PERSPECTIVE: 0,
  ORTHO: 1
}