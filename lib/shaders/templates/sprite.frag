#ifdef useTexture
  uniform sampler2D texture;
  varying vec2 uv0;
#endif

varying vec4 v_fragmentColor;

void main () {
  vec4 o = v_fragmentColor;

  #ifdef useTexture
    o *= texture2D(texture, uv0);
  #endif

  gl_FragColor = o;
}