(() => {
  'use strict';
  const app = window.app;
  const engine = window.engine;

  const resl = engine.resl;
  const gfx = engine.gfx;
  const { Scene, Node, SpriteModel, SpriteMaterial } = engine;
  const { mat4, vec3, quat, color4, randomRange } = engine.math;

  var frames = [
    {x: 2, y: 2, w: 26, h: 37},
    {x: 2, y: 47, w: 26, h: 37},
    {x: 2, y: 86, w: 26, h: 37},
    {x: 2, y: 125, w: 26, h: 37},
    {x: 2, y: 164, w: 26, h: 37},
  ];

  // create material
  let material = new SpriteMaterial();

  // scene
  let scene = new Scene();
  let nodes = [];

  // Add number notification
  let number = document.createElement('div');
  number.style.position = 'absolute';
  number.style.left = '0px';
  number.style.width = '100%';
  number.style.top = '50%';
  number.style.textAlign = 'center';
  number.style.color = 'rgb(0, 0, 0)';
  number.style.font = 'bold 50px Helvetica, Arial';
  document.body.appendChild(number);

  // Add events
  let canvas = app._canvas;
  let isAdding = false;
  function startSpawn () {
    isAdding = true;
  }
  function endSpawn () {
    isAdding = false;
  }
  canvas.addEventListener('mousedown', startSpawn);
  canvas.addEventListener('touchstart', startSpawn);
  canvas.addEventListener('mouseup', endSpawn);
  canvas.addEventListener('mouseleave', endSpawn);
  canvas.addEventListener('touchend', endSpawn);
  canvas.addEventListener('touchcancel', endSpawn);

  // Node and models
  function spawnNode () {
    let node = new Node('node_' + nodes.length);
    node.speedX = Math.random() * 10;
    node.speedY = (Math.random() * 10) - 5;

    vec3.set(node.lpos,
      randomRange(0, canvas.width),
      randomRange(0, canvas.height),
      -100
    );
    quat.fromEuler(node.lrot, 0, 0, randomRange(0, 360));

    let frameId = Math.floor(Math.random() * 5);
    let frame = frames[frameId];
    let model = new SpriteModel();
    model.setSpriteFrame(frame);
    model.setEffect(material._effect);
    model.setNode(node);

    scene.addModel(model);
    nodes.push(node);
  }

  // Settings
  let gravity = 0.5;
  let amount = 100;
  let maxX = canvas.width;
  let minX = 0;
  let maxY = canvas.height;
  let minY = 0;

  // Update
  scene.tick = function () {
    var bunny, i;
    if (isAdding) {
        if (nodes.length < 100000) {
            for (i = 0; i < amount; i++) {
              spawnNode();
            }
            number.innerText = nodes.length;
        }
    }

    for (i = 0; i < nodes.length; i++) 
    {
        bunny = nodes[i];
        
        var x = (bunny.lpos.x += bunny.speedX);
        var y = (bunny.lpos.y -= bunny.speedY);
        bunny.speedY += gravity;
        
        if (x > maxX)
        {
            bunny.speedX *= -1;
            bunny.lpos.x = maxX;
        }
        else if (x < minX)
        {
            bunny.speedX *= -1;
            bunny.lpos.x = minX;
        }
        
        if (y < minY)
        {
            bunny.speedY *= -0.85;
            bunny.lpos.y = minY;
            if (Math.random() > 0.5)
            {
                bunny.speedY -= Math.random() * 6;
            }
        } 
        else if (y > maxY)
        {
            bunny.speedY = 0;
            bunny.lpos.y = maxY;
        }
    }
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

      for (let i = 0; i < 20; ++i) {
        spawnNode();
      }
    }
  });

  return scene;
})();