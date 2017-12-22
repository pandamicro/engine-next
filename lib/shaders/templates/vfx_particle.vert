#ifdef GL_ES
precision highp float;
#endif

attribute vec2 index;

uniform sampler2D state;
uniform sampler2D quad;
uniform vec2 statesize;
uniform float z;
uniform vec2 us;
uniform vec2 vs;

varying lowp vec4 v_fragmentColor;
varying vec2 uv0;

const float BASE = 255.0;
const float OFFSET = BASE * BASE / 2.0;
const float LIFE_SCALE = 60.0;
const float POSITION_SCALE = 1.0;

float decode(vec2 channels, float scale) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

void main() {
    vec2 pIndex = (index / 2.0) * 3.0;
    vec4 lifeData = texture2D(state, pIndex);
    float life = decode(lifeData.rg, LIFE_SCALE);

    if (life <= 0.0) {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        v_fragmentColor = vec4(0.0, 0.0, 0.0, 0.0);
        uv0 = vec2(0.0, 0.0);
    }
    else {
        vec2 posIndex = (pIndex + 2.0) / statesize;
        vec4 posData = texture2D(state, posIndex);
        vec2 pos = vec2(decode(posData.rg, POSITION_SCALE), decode(posData.ba, POSITION_SCALE));
        vec2 cIndex = vec2(pIndex.x + 1.0, pIndex.y) / statesize;
        vec4 color = texture2D(state, cIndex);

        gl_Position = vec4(pos, z, 1.0);
        v_fragmentColor = color;

        float u, v;
        vec2 uvId = mod(index, vec2(2.0, 2.0));
        if (uvId.x == 0.0) {
            u = us[0];
        }
        else {
            u = us[1];
        }
        if (uvId.y == 0.0) {
            v = vs[0];
        }
        else {
            v = vs[1];
        }
        uv0 = vec2(u, v);
    }    
}
