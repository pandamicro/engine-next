// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
uniform mat4 viewProj;
attribute vec3 a_position;
attribute vec4 a_color;
varying lowp vec4 v_fragmentColor;

#ifdef useModel
  uniform mat4 model;
#endif

#ifdef useTexture
  attribute vec2 a_uv0;
  varying vec2 uv0;
#endif

void main () {
  mat4 mvp;
  #ifdef useModel
    mvp = viewProj * model;
  #else
    mvp = viewProj;
  #endif
  vec4 pos = mvp * vec4(a_position, 1);

  v_fragmentColor = a_color;
  
  #ifdef useTexture
    uv0 = a_uv0;
  #endif

  gl_Position = pos;
}