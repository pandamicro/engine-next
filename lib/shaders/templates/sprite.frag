// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
#ifdef useTexture
  uniform sampler2D texture;
  varying vec2 uv0;
#endif

#ifdef alphaTest
  uniform float alphaThreshold;
#endif

#ifdef useColor
  uniform vec4 color;
#else
  varying vec4 v_fragmentColor;
#endif

void main () {
  #ifdef useColor
    vec4 o = color;
  #else
    vec4 o = v_fragmentColor;
  #endif

  #ifdef useTexture
    o *= texture2D(texture, uv0);
  #endif

  #ifdef alphaTest
    if (o.a <= alphaThreshold)
      discard;
  #endif

  gl_FragColor = o;
}