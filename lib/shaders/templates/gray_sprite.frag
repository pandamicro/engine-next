// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
uniform sampler2D texture;
varying vec2 uv0;
uniform vec4 color;

void main () {
  vec4 c = color * texture2D(texture, uv0);
  float gray = 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;
  gl_FragColor = vec4(gray, gray, gray, c.a);
}