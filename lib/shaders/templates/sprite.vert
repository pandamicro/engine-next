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
  vec4 pos;
  #ifdef useModel
    pos = model * vec4(a_position, 1);
  #else
    pos = vec4(a_position, 1);
  #endif
  pos = viewProj * pos;

  v_fragmentColor = a_color;
  
  #ifdef useTexture
    uv0 = a_uv0;
  #endif

  gl_Position = pos;
}