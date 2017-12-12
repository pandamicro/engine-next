export default [
  {
    name: 'sprite',
    vert: 'uniform mat4 viewProj;\nattribute vec3 a_position;\nattribute vec4 a_color;\nvarying lowp vec4 v_fragmentColor;\n#ifdef useModel\n  uniform mat4 model;\n#endif\n#ifdef useTexture\n  attribute vec2 a_uv0;\n  varying vec2 uv0;\n#endif\nvoid main () {\n  vec4 pos;\n  #ifdef useModel\n    pos = model * vec4(a_position, 1);\n  #else\n    pos = vec4(a_position, 1);\n  #endif\n  pos = viewProj * pos;\n  v_fragmentColor = a_color;\n  \n  #ifdef useTexture\n    uv0 = a_uv0;\n  #endif\n  gl_Position = pos;\n}',
    frag: '#ifdef useTexture\n  uniform sampler2D texture;\n  varying vec2 uv0;\n#endif\nvarying vec4 v_fragmentColor;\nvoid main () {\n  vec4 o = v_fragmentColor;\n  #ifdef useTexture\n    o *= texture2D(texture, uv0);\n  #endif\n  gl_FragColor = o;\n}',
    options: [
      { name: 'useTexture', },
      { name: 'useModel', },
    ],
  },
];