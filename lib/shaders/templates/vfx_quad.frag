// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  
 
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D state;
uniform vec2 quadsize;
uniform vec2 statesize;
uniform float sizeScale;

varying vec2 index;

const float BASE = 255.0;
const float OFFSET = BASE * BASE / 2.0;
const float LIFE_SCALE = 100.0;
const float POSITION_SCALE = 1.0;
const float ROTATION_SCALE = 1.0;

float decode(vec2 channels, float scale) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

vec2 encode(float value, float scale) {
    value = value * scale + OFFSET;
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

void main() {
    vec2 pixel = floor(index * quadsize);
    vec2 pIndex = floor(pixel / 2.0) * 3.0;
    vec4 lifeData = texture2D(state, pIndex / statesize);
    float rest = decode(lifeData.rg, LIFE_SCALE);
    if (rest <= 0.0) {
        gl_FragColor = vec4(encode(0.0, POSITION_SCALE), encode(0.0, POSITION_SCALE));
        return;
    }

    vec2 dataIndex = (pIndex + 2.0) / statesize;
    vec4 posData = texture2D(state, dataIndex);
    float x = decode(posData.rg, POSITION_SCALE);
    float y = decode(posData.ba, POSITION_SCALE);
    vec2 pos = vec2(x, y);

    dataIndex = (pIndex + 1.0) / statesize;
    vec4 sizeData = texture2D(state, dataIndex);
    float size = decode(sizeData.rg, sizeScale);

    dataIndex.x = (pIndex.x + 2.0) / statesize.x;
    dataIndex.y = (pIndex.y + 1.0) / statesize.y;
    vec4 rotData = texture2D(state, dataIndex);
    float rot = radians(mod(decode(rotData.rg, ROTATION_SCALE), 180.0));

    float a = cos(rot);
    float b = -sin(rot);
    float c = -b;
    float d = a;

    vec2 vert = (mod(pixel, vec2(2.0)) - 0.5) * size;
    x = vert.x * a + vert.y * c + pos.x;
    y = vert.x * b + vert.y * d + pos.y;
    gl_FragColor = vec4(encode(x, POSITION_SCALE), encode(y, POSITION_SCALE));
}
