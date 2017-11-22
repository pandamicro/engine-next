uniform mat4 viewProj;
attribute vec3 a_position;
attribute vec4 a_color;
varying lowp vec4 v_fragmentColor;

{{#useModel}}
uniform mat4 model;
{{/useModel}}

{{#useTexture}}
attribute vec2 a_uv0;
varying vec2 uv0;
{{/useTexture}}

void main () {
  vec4 pos = viewProj{{#useModel}} * model{{/useModel}} * vec4(a_position, 1);

  {{#useTexture}}
  uv0 = a_uv0;
  {{/useTexture}}

  gl_Position = pos;
}