'use strict';

(() => {
  const { App, Camera } = window.engine;
  const { vec3 } = window.engine.math;

  function _loadPromise(url) {
    return new Promise((resolve, reject) => {
      let xhr = new window.XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = onreadystatechange;
      xhr.send(null);

      function onreadystatechange(e) {
        if (xhr.readyState !== 4) {
          return;
        }

        // Testing harness file:/// results in 0.
        if ([0, 200, 304].indexOf(xhr.status) === -1) {
          reject(`While loading from url ${url} server responded with a status of ${xhr.status}`);
        } else {
          resolve(e.target.response);
        }
      }
    });
  }

  function _load(view, url) {
    if (window.reqID) {
      window.cancelAnimationFrame(window.reqID);
    }

    _loadPromise(url).then(result => {
      // destroy old instances
      if (view.firstElementChild) {
        view.firstElementChild.remove();
      }

      if (window.app) {
        window.app.destroy();
        window.app = null;
      }

      // create new canvas
      let canvas = document.createElement('canvas');
      canvas.classList.add('fit');
      canvas.tabIndex = -1;
      view.appendChild(canvas);

      // init app
      let app = new App(canvas);
      app.resize();
      window.app = app;

      // init example modules
      let scene = eval(`${result}\n//# sourceURL=${url}`);

      // add camera
      let camera = new Camera({
        x: 0, y: 0, w: canvas.width, h: canvas.height
      });

      app.onTick = function () {
        window.stats.tick();
        scene.tick();
      };
      app.setCamera(camera);
      app.run(scene);

    }).catch(err => {
      console.error(err);
    });
  }

  document.addEventListener('readystatechange', () => {
    if (document.readyState !== 'complete') {
      return;
    }

    // let spector = new window.SPECTOR.Spector();
    // spector.displayUI();

    let view = document.getElementById('view');
    let showFPS = document.getElementById('showFPS');
    let exampleList = document.getElementById('exampleList');

    // update profile
    showFPS.checked = localStorage.getItem('gfx.showFPS') === 'true';
    let exampleIndex = parseInt(localStorage.getItem('gfx.exampleIndex'));
    if (isNaN(exampleIndex)) {
      exampleIndex = 0;
    }
    exampleList.selectedIndex = exampleIndex;

    // init
    let stats = new window.LStats(document.body);
    showFPS.checked ? stats.show() : stats.hide();

    window.stats = stats;
    _load(view, exampleList.value);

    showFPS.addEventListener('click', event => {
      localStorage.setItem('gfx.showFPS', event.target.checked);
      if (event.target.checked) {
        stats.show();
      } else {
        stats.hide();
      }
    });

    exampleList.addEventListener('change', event => {
      localStorage.setItem('gfx.exampleIndex', event.target.selectedIndex);
      _load(view, exampleList.value);
    });
  });
})();