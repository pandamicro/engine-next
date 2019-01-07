// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
uniform mat4 viewProj;

#ifdef use2DPos
  attribute vec2 a_position;
#else
  attribute vec3 a_position;
#endif

attribute lowp vec4 a_color;
#ifdef useTint
  attribute lowp vec4 a_color0;
#endif

#ifdef useModel
  uniform mat4 model;
#endif

attribute mediump vec2 a_uv0;
varying mediump vec2 uv0;

varying lowp vec4 v_light;
#ifdef useTint
  varying lowp vec4 v_dark;
#endif

void main () {
  mat4 mvp;
  #ifdef useModel
    mvp = viewProj * model;
  #else
    mvp = viewProj;
  #endif

  #ifdef use2DPos
  vec4 pos = mvp * vec4(a_position, 0, 1);
  #else
  vec4 pos = mvp * vec4(a_position, 1);
  #endif

  v_light = a_color;
  #ifdef useTint
    v_dark = a_color0;
  #endif

  uv0 = a_uv0;

  gl_Position = pos;
}