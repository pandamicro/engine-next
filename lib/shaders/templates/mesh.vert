// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
uniform mat4 viewProj;

attribute vec3 a_position;
attribute vec2 a_uv0;
varying vec2 uv0;

#ifdef useModel
  uniform mat4 model;
#endif


#ifdef useSkinning
  #include <skinning.vert>
#endif

void main () {
  mat4 mvp;
  #ifdef useModel
    mvp = viewProj * model;
  #else
    mvp = viewProj;
  #endif

  vec4 pos = mvp * vec4(a_position, 1);

  #ifdef useSkinning
    pos = skinMatrix() * pos;
  #endif

  uv0 = a_uv0;

  gl_Position = pos;
}