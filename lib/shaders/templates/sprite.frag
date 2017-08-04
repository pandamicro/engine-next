{{#useTexture}}
uniform sampler2D mainTexture;
varying vec2 uv0;
{{/useTexture}}

varying vec4 v_fragmentColor;

void main () {
  vec4 o = v_fragmentColor;;

  {{#useTexture}}
  o *= texture2D(mainTexture, uv0);
  {{/useTexture}}

  gl_FragColor = o;
}