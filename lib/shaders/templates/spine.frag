// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  

uniform sampler2D texture;
varying mediump vec2 uv0;

#ifdef alphaTest
  uniform lowp float alphaThreshold;
#endif

varying lowp vec4 v_light;
#ifdef useTint
  varying lowp vec4 v_dark;
#endif

void main () {
  vec4 texColor = texture2D(texture, uv0);
  vec4 finalColor;

  #ifdef useTint
    finalColor.a = v_light.a * texColor.a;
    finalColor.rgb = ((texColor.a - 1.0) * v_dark.a + 1.0 - texColor.rgb) * v_dark.rgb + texColor.rgb * v_light.rgb;
  #else
    finalColor = texColor * v_light;
  #endif

  #ifdef alphaTest
    if (finalColor.a <= alphaThreshold)
      discard;
  #endif

  gl_FragColor = finalColor;
}