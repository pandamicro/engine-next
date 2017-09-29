const sys = window.cc && window.cc.sys;

let canvas = document.createElement("canvas");
let supportWebGL = false;

function create3DContext (canvas, opt_attribs) {
  try {
    return canvas.getContext('webgl', opt_attribs) || canvas.getContext('experimental-webgl', opt_attribs);
  } catch (e) {
    return null;
  }
}

if (window.WebGLRenderingContext) {
  if (create3DContext(canvas)) {
    supportWebGL = true;
  }
  if (supportWebGL && sys && sys.os === sys.OS_ANDROID) {
    var browserVer = parseFloat(sys.browserVersion);
    switch (sys.browserType) {
    case sys.BROWSER_TYPE_MOBILE_QQ:
    case sys.BROWSER_TYPE_BAIDU:
    case sys.BROWSER_TYPE_BAIDU_APP:
      // QQ & Baidu Brwoser 6.2+ (using blink kernel)
      if (browserVer >= 6.2) {
          supportWebGL = true;
      }
      else {
          supportWebGL = false;
      }
      break;
    case sys.BROWSER_TYPE_ANDROID:
      // Android 5+ default browser
      if (sys.osMainVersion && sys.osMainVersion >= 5) {
          supportWebGL = true;
      }
      break;
    case sys.BROWSER_TYPE_CHROME:
      // Chrome on android supports WebGL from v. 30
      if (browserVer >= 30.0) {
          supportWebGL = true;
      } else {
          supportWebGL = false;
      }
      break;
    case sys.BROWSER_TYPE_UC:
      if (browserVer > 11.0) {
          supportWebGL = true;
      } else {
          supportWebGL = false;
      }
    case sys.BROWSER_TYPE_360:
      supportWebGL = false;
    }
  }
}

export default {
  supportWebGL,
  create3DContext
};