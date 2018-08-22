// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
uniform sampler2D texture;
varying vec2 uv0;

uniform vec4 color;

void main () {
  #ifdef useColor
    vec4 o = color;
  #else
    vec4 o = v_fragmentColor;
  #endif

  o *= texture2D(texture, uv0);

  gl_FragColor = o;
}