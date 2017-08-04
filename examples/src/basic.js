(() => {
  const app = window.app;
  const engine = window.engine;

  const resl = engine.resl;
  const gfx = engine.gfx;
  const { Scene, Node, Model, SpriteMaterial } = engine;
  const { mat4, vec3, quat, color4, randomRange } = engine.math;
  const { Mesh } = engine.renderer;
  const SharedArrayBuffer = engine.SharedArrayBuffer;

  const VERTEX_BYTES = 24;
  const QUAD_BYTES = VERTEX_BYTES * 4;
  const UNIT_VBUFFER_SIZE = QUAD_BYTES * 2000;
  const INDEX_BYTES = 2 * 6;
  const UNIT_IBUFFER_SIZE = INDEX_BYTES * 2000;
  var buffers = [
    {
      vb: new SharedArrayBuffer(UNIT_VBUFFER_SIZE),
      ib: new SharedArrayBuffer(UNIT_IBUFFER_SIZE)
    }
  ];

  var vertexFormat = new gfx.VertexFormat([
    { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
    { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
    { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 }
  ]);

  var matrix = mat4.create();

  var frames = [
    {x: 2, y: 2, w: 26, h: 37},
    {x: 2, y: 47, w: 26, h: 37},
    {x: 2, y: 86, w: 26, h: 37},
    {x: 2, y: 125, w: 26, h: 37},
    {x: 2, y: 164, w: 26, h: 37},
  ];

  let vertices = [
    [-26 / 2, -37 / 2], // bl
    [26 / 2, -37 / 2],  // br
    [-26 / 2, 37 / 2],  // tl
    [26 / 2, 37 / 2]    // tr
  ]

  // create mesh
  function createSpriteMesh (device, node, texture) {
    // Allocate buffer
    let bufferId = -1, voffset, ioffset, vertexData, uint32Data, indexData;
    for (let i = 0, l = buffers.length; i < l; i++) {
      let vb = buffers[i].vb;
      let ib = buffers[i].ib;
      voffset = vb.request(QUAD_BYTES);
      ioffset = ib.request(INDEX_BYTES);
      if (voffset !== -1 && ioffset !== -1) {
        bufferId = i;
        // Create data view
        vertexData = new Float32Array(vb.data, voffset, 24);
        uint32Data = new Uint32Array(vb.data, voffset, 24);
        indexData = new Uint16Array(ib.data, ioffset, 6);
        break;
      }
      voffset = -1;
      ioffset = -1;
    }
    if (voffset === -1) {
      let buffer = {
        vb: new SharedArrayBuffer(UNIT_VBUFFER_SIZE),
        ib: new SharedArrayBuffer(UNIT_IBUFFER_SIZE)
      };
      buffers.push(buffer);
      bufferId = buffers.length - 1;
      voffset = buffer.vb.request(QUAD_BYTES);
      ioffset = buffer.ib.request(INDEX_BYTES);
      // Create data view
      vertexData = new Float32Array(buffer.vb.data, voffset, 24);
      uint32Data = new Uint32Array(buffer.vb.data, voffset, 24);
      indexData = new Uint16Array(buffer.ib.data, ioffset, 6);
    }

    // for position
    node.getWorldMatrix(matrix);
    let a = matrix.m00,
        b = matrix.m01,
        c = matrix.m04,
        d = matrix.m05,
        tx = matrix.m12,
        ty = matrix.m13;

    // for color
    let color = ((255<<24) >>> 0) + (255<<16) + (255<<8) + 255

    // for uv
    let frameId = Math.floor(Math.random() * 5);
    let frame = frames[frameId];

    // Assign vertex data
    for (let i = 0; i < 4; i++) {
      let off = i * 6;
      let x = vertices[i][0],
          y = vertices[i][1],
          wx = x * a + y * c + tx,
          wy = x * b + y * d + ty;
      vertexData[off] = wx;
      vertexData[off+1] = wy;
      vertexData[off+2] = node.lpos.z;
      uint32Data[off+3] = color;
      switch (i) {
      case 0: // bl
        vertexData[off+4] = frame.x / texture._width;
        vertexData[off+5] = (frame.y + frame.h) / texture._height;
        break;
      case 1: // br
        vertexData[off+4] = (frame.x + frame.w) / texture._width;
        vertexData[off+5] = (frame.y + frame.h) / texture._height;
        break;
      case 2: // tl
        vertexData[off+4] = frame.x / texture._width;
        vertexData[off+5] = frame.y / texture._height;
        break;
      case 3: // tr
        vertexData[off+4] = (frame.x + frame.w) / texture._width;
        vertexData[off+5] = frame.y / texture._height;
        break;
      }
    }
    // Assign index data
    let index = 0;
    indexData[0] = index;
    indexData[1] = index + 1;
    indexData[2] = index + 2;
    indexData[3] = index + 1;
    indexData[4] = index + 3;
    indexData[5] = index + 2;

    let vb = new gfx.VertexBuffer(
      device,
      vertexFormat,
      gfx.USAGE_DYNAMIC,
      vertexData,
      4
    );

    let ib = new gfx.IndexBuffer(
      device,
      gfx.INDEX_FMT_UINT16,
      gfx.USAGE_STATIC,
      indexData,
      6
    );

    let ret = new Mesh(vb, ib);
    ret.buffer = {
      bufferId: bufferId,
      voffset: voffset,
      ioffset: ioffset
    }
    return ret;
  }

  // create material
  let material = new SpriteMaterial();

  // scene
  let scene = new Scene();

  scene.tick = function () {

  }

  resl({
    manifest: {
      image: {
        type: 'image',
        src: './assets/bunnys.png'
      },
    },
    onDone (assets) {
      let image = assets.image;
      let texture = new gfx.Texture2D(app.device, {
        width : image.width,
        height: image.height,
        wrapS: gfx.WRAP_CLAMP,
        wrapT: gfx.WRAP_CLAMP,
        mipmap: false,
        flipY: false,
        images : [image]
      });
      material.mainTexture = texture;

      // models
      for (let i = 0; i < 100; ++i) {
        let node = new Node(`node_${i}`);
        vec3.set(node.lpos,
          randomRange(-app._canvas.width/2, app._canvas.width/2),
          randomRange(-app._canvas.height/2, app._canvas.height/2),
          -100
        );
        quat.fromEuler(node.lrot, 0, 0, randomRange(0, 360));

        let model = new Model();
        model.setMesh(createSpriteMesh(app.device, node, texture));

        model.setEffect(material._effect);
        model.setNode(node);

        scene.addModel(model);
      }
    }
  });

  return scene;
})();