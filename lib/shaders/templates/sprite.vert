attribute vec3 a_position;
uniform mat4 viewProj;

{{#useModel}}
uniform mat4 model;
{{/useModel}}

{{#useTexture}}
attribute vec2 a_uv0;
varying vec2 uv0;
{{/useTexture}}

void main () {
  vec4 pos = vec4(a_position, 1);

  pos = viewProj{{#useModel}} * model{{/useModel}} * pos;

  {{#useTexture}}
  uv0 = a_uv0;
  {{/useTexture}}

  gl_Position = pos;
}