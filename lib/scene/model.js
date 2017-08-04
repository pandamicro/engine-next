export default class Model {
  constructor() {
    this._node = null;
    this._mesh = null;
    this._effect = null;

    // TODO: we calculate aabb based on mesh vertices
    // this._aabb
  }

  setNode(node) {
    this._node = node;
  }

  setMesh(mesh) {
    this._mesh = mesh;
  }

  setEffect(effect) {
    this._effect = effect;
  }

  get meshCount() {
    return 1;
  }

  getDrawItem(out, index) {
    // Extract node's data to mesh and effect
    // here or in visit process

    out.node = this._node;
    out.mesh = this._mesh;
    out.effect = this._effect;
  }
}