{{#useTexture}}
uniform sampler2D texture;
varying vec2 uv0;
{{/useTexture}}

varying vec4 v_fragmentColor;

void main () {
  vec4 o = v_fragmentColor;

  {{#useTexture}}
  o *= texture2D(texture, uv0);
  {{/useTexture}}

  gl_FragColor = o;
}