uniform mat4 viewProj;
attribute vec3 a_position;
attribute vec4 a_color;
varying lowp vec4 v_fragmentColor;

attribute vec2 a_uv0;
varying vec2 uv0;

void main () {
  vec4 pos = viewProj * vec4(a_position, 1);

  v_fragmentColor = a_color;
  uv0 = a_uv0;

  gl_Position = pos;
}