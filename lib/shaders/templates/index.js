export default [
  {
    name: 'sprite',
    vert: 'uniform mat4 viewProj;\nattribute vec3 a_position;\nattribute vec4 a_color;\nvarying lowp vec4 v_fragmentColor;\n{{#useModel}}\nuniform mat4 model;\n{{/useModel}}\n{{#useTexture}}\nattribute vec2 a_uv0;\nvarying vec2 uv0;\n{{/useTexture}}\nvoid main () {\n  vec4 pos = viewProj{{#useModel}} * model{{/useModel}} * vec4(a_position, 1);\n  v_fragmentColor = a_color;\n  \n  {{#useTexture}}\n  uv0 = a_uv0;\n  {{/useTexture}}\n  gl_Position = pos;\n}',
    frag: '{{#useTexture}}\nuniform sampler2D texture;\nvarying vec2 uv0;\n{{/useTexture}}\nvarying vec4 v_fragmentColor;\nvoid main () {\n  vec4 o = v_fragmentColor;\n  {{#useTexture}}\n  o *= texture2D(texture, uv0);\n  {{/useTexture}}\n  gl_FragColor = o;\n}',
    options: [
      { name: 'useTexture', },
      { name: 'useModel', },
    ],
  },
];