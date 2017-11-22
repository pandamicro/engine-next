export default [
  {
    name: 'sprite',
    vert: 'uniform mat4 viewProj;\nattribute vec3 a_position;\nattribute vec4 a_color;\nvarying lowp vec4 v_fragmentColor;\n{{#useModel}}\nuniform mat4 model;\n{{/useModel}}\n{{#useTexture}}\nattribute vec2 a_uv0;\nvarying vec2 uv0;\n{{/useTexture}}\nvoid main () {\n  vec4 pos = viewProj{{#useModel}} * model{{/useModel}} * vec4(a_position, 1);\n  {{#useTexture}}\n  uv0 = a_uv0;\n  {{/useTexture}}\n  gl_Position = pos;\n}',
    frag: '{{#useTexture}}\nuniform sampler2D texture;\nvarying vec2 uv0;\n{{/useTexture}}\n{{#useColor}}\nuniform vec4 color;\n{{/useColor}}\nvoid main () {\n  vec4 o = vec4(1, 1, 1, 1);\n  {{#useTexture}}\n  o *= texture2D(texture, uv0);\n  {{/useTexture}}\n  {{#useColor}}\n  o *= color;\n  {{/useColor}}\n  gl_FragColor = o;\n}',
    options: [
      { name: 'useTexture', },
      { name: 'useModel', },
    ],
  },
];