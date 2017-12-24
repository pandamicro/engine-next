uniform sampler2D state;
uniform vec2 quadsize;
uniform vec2 statesize;
uniform float sizeScale;

varying vec2 index;

const float BASE = 255.0;
const float OFFSET = BASE * BASE / 2.0;
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
    vec2 pIndex = floor(index * quadsize / 2.0) * 3.0;
    vec2 dataIndex = (pIndex + 2.0) / statesize;
    vec4 posData = texture2D(state, dataIndex);
    vec2 pos = vec2(decode(posData.rg, POSITION_SCALE), decode(posData.ba, POSITION_SCALE));

    dataIndex.x = pIndex.x / statesize.x;
    dataIndex.y = (pIndex.y + 1.0) / statesize.y;
    vec4 sizeData = texture2D(state, dataIndex);
    float size = decode(sizeData.rg, sizeScale);

    dataIndex = (pIndex + 1.0) / statesize;
    vec4 rotData = texture2D(state, dataIndex);
    float rot = radians(floor(decode(rotData.rg, ROTATION_SCALE)));

    float a = cos(rot);
    float b = -sin(rot);
    float c = -b;
    float d = a;

    vec2 vert = (mod(floor(index * quadsize), vec2(2.0)) - 0.5) * size;
    float x = vert.x * a + vert.y * c + pos.x;
    float y = vert.x * b + vert.y * d + pos.y;
    gl_FragColor = vec4(encode(x, POSITION_SCALE), encode(y, POSITION_SCALE));
}
