export default [
  {
    name: 'sprite',
    vert: 'attribute vec3 a_position;\nuniform mat4 viewProj;\n{{#useModel}}\nuniform mat4 model;\n{{/useModel}}\n{{#useTexture}}\nattribute vec2 a_uv0;\nvarying vec2 uv0;\n{{/useTexture}}\nvoid main () {\n  vec4 pos = vec4(a_position, 1);\n  pos = viewProj{{#useModel}} * model{{/useModel}} * pos;\n  {{#useTexture}}\n  uv0 = a_uv0;\n  {{/useTexture}}\n  gl_Position = pos;\n}',
    frag: '{{#useTexture}}\nuniform sampler2D mainTexture;\nvarying vec2 uv0;\n{{/useTexture}}\n{{#useColor}}\nuniform vec4 color;\n{{/useColor}}\nvoid main () {\n  vec4 o = vec4(1, 1, 1, 1);\n  {{#useTexture}}\n  o *= texture2D(mainTexture, uv0);\n  {{/useTexture}}\n  {{#useColor}}\n  o *= color;\n  {{/useColor}}\n  gl_FragColor = o;\n}',
    options: [
      { name: 'useTexture', },
      { name: 'useModel', },
      { name: 'useColor', },
    ],
  },
];