import { color4, mat4 } from 'vmath';

export default class Camera {
  constructor(viewport, node) {
    this._node = null;
    this._projection = Camera.PROJECTION.ORTHO;

    // projection properties
    this._near = 0.1;
    this._far = 1000;
    this._fov = Math.PI/4.0; // vertical fov

    // ortho properties
    this._orthoHeight = viewport.h / 2;

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
    // projection matrix
    // TODO: if this._projDirty
    let aspect = this._rect.w / this._rect.h;
    if (this._projection === Camera.PROJECTION.PERSPECTIVE) {
      mat4.perspective(this._proj,
        this._fov,
        aspect,
        this._near,
        this._far
      );
    } else {
      mat4.ortho(this._proj,
        0, this._rect.w, 0, this._rect.h, this._near, this._far
      );
    }

    // view-projection
    mat4.mul(this._viewProj, this._proj, this._view);
  }
}
Camera.PROJECTION = {
  PERSPECTIVE: 0,
  ORTHO: 1
}