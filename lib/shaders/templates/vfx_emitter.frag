uniform sampler2D noise;
uniform sampler2D state;

/* uniform mat4 model;*/
uniform vec2 statesize;
uniform vec2 noisesize;
uniform float dt;
uniform float mode;
uniform float noiseId;
uniform float emitVar;

uniform float life;
uniform float lifeVar;
uniform vec2 pos;
uniform vec2 posVar;
uniform vec4 color;
uniform vec4 colorVar;
uniform vec4 endColor;
uniform vec4 endColorVar;
uniform float size;
uniform float sizeVar;
uniform float endSize;
uniform float endSizeVar;
uniform float rot;
uniform float rotVar;
uniform float endRot;
uniform float endRotVar;
uniform float angle;
uniform float angleVar;
uniform float speed;
uniform float speedVar;
uniform float radial;
uniform float radialVar;
uniform float tangent;
uniform float tangentVar;
uniform float radius;
uniform float radiusVar;
uniform float endRadius;
uniform float endRadiusVar;
uniform float rotatePS;
uniform float rotatePSVar;

uniform float sizeScale;
uniform float accelScale;
uniform float radiusScale;

varying vec2 index;

const float BASE = 255.0;
const float OFFSET = BASE * BASE / 2.0;
const float NOISE_SCALE = 10000.0;
const float POSITION_SCALE = 1.0;
const float ROTATION_SCALE = 1.0;
const float LIFE_SCALE = 60.0;
const float START_SIZE_EQUAL_TO_END_SIZE = -1.0;
const float START_RADIUS_EQUAL_TO_END_RADIUS = -1.0;

float decode(vec2 channels, float scale) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

vec2 encode(float value, float scale) {
    value = value * scale + OFFSET;
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

float randomMinus1To1(vec2 randomD) {
    float random = decode(randomD, NOISE_SCALE);
    return (random - 0.5) * 2.0;
}

bool doEmit (vec4 randomD) {
    float random1 = decode(randomD.rg, NOISE_SCALE);
    if ((life + lifeVar) * random1 < life) {
        return true;
    }
    else {
        return false;
    }
}

vec4 initLife (vec4 data, vec4 randomD) {
    /* decide whether to revive particle */
    if (doEmit(randomD)) {
        float random2 = randomMinus1To1(randomD.ba);
        float plife = life + lifeVar * random2;
        vec2 l = encode(plife, LIFE_SCALE);
        return vec4(l, l);
    }
    else {
        return data;
    }
}

vec4 initColor (float randr, float randg, float randb, float randa) {
    vec4 random = vec4(randr, randg, randb, randa);
    vec4 result = clamp(color + colorVar * random, 0.0, 255.0);
    return result / 255.0;
}

vec4 initDeltaColor (vec4 startR, float randr, float randg, float randb, float randa) {
    vec4 random = vec4(randr, randg, randb, randa);
    vec4 start = clamp(color + colorVar * startR, 0.0, 255.0);
    vec4 end = clamp(endColor + endColorVar * random, 0.0, 255.0);
    return (end - start) / 255.0;
}

vec4 initSize (float rand1, float rand2) {
    float start = max(0.0, size + sizeVar * rand1);
    if (endSize == START_SIZE_EQUAL_TO_END_SIZE) {
        float delta = 0.0;
        return vec4(encode(start, sizeScale), encode(delta, sizeScale));
    }
    else {
        float end = max(0.0, endSize + endSizeVar * rand2);
        float delta = end - start;
        return vec4(encode(start, sizeScale), encode(delta, sizeScale));
    }
}

vec4 initRotation (float rand1, float rand2) {
    float start = rot + rotVar * rand1;
    float end = endRot + endRotVar * rand2;
    float delta = end - start;
    return vec4(encode(start, ROTATION_SCALE), encode(delta, ROTATION_SCALE));
}

vec4 initControl1 (float rand1, float rand2) {
    /* Mode A: gravity, direction (control1), tangential accel & radial accel (control2) */
    if (mode == 0.0) {
        float pAngle = angle + angleVar * rand1;
        float dirX = cos(pAngle);
        float dirY = sin(pAngle);
        float pSpeed = speed + speedVar * rand2;
        return vec4(encode(dirX * pSpeed, POSITION_SCALE), encode(dirY * pSpeed, POSITION_SCALE));
    }
    /* Mode B: angle & radius (control1), degreesPerSecond & deltaRadius (control2) */
    else {
        float pAngle = angle + angleVar * rand1;
        float pRadius = radius + radiusVar * rand2;
        return vec4(encode(pAngle, ROTATION_SCALE), encode(pRadius, radiusScale));
    }
}

vec4 initControl2 (float startR1, float rand1, float rand2) {
    /* Mode A: gravity, direction (control1), tangential accel & radial accel (control2) */
    if (mode == 0.0) {
        float pRadial = radial + radialVar * rand1;
        float pTangent = tangent + tangentVar * rand2;
        return vec4(encode(pRadial, accelScale), encode(pTangent, accelScale));
    }
    /* Mode B: angle & radius (control1), degreesPerSecond & deltaRadius (control2) */
    else {
        float degreesPerSecond = rotatePS + rotatePSVar * rand1;
        float pDeltaRadius;
        if (endRadius == START_RADIUS_EQUAL_TO_END_RADIUS) {
            pDeltaRadius = 0.0;
        }
        else {
            float pRadius = radius + radiusVar * startR1;
            pDeltaRadius = (endRadius + endRadiusVar * rand2 - pRadius);
        }
        return vec4(encode(degreesPerSecond, ROTATION_SCALE), encode(pDeltaRadius, radiusScale));
    }
}

vec4 initPos (float rand1, float rand2) {
    vec2 result = pos + posVar * vec2(rand1, rand2);
    return vec4(encode(result.x, POSITION_SCALE), encode(result.y, POSITION_SCALE));
}

void main() {
    vec2 pixel = floor(index * statesize);
    vec2 pindex = floor(pixel / 3.0);
    vec2 temp = mod(pixel, vec2(3.0, 3.0));
    float id = floor(temp.y * 3.0 + temp.x);

    vec2 noffset = vec2(floor(noiseId / 4.0), mod(noiseId, 4.0));
    vec2 nid = pixel + noffset;
    vec4 randomD = texture2D(noise, nid / noisesize);
    
    vec4 lifeData = texture2D(state, pindex * 3.0 / statesize);
    float rest = decode(lifeData.rg, LIFE_SCALE);
    float life = decode(lifeData.ba, LIFE_SCALE);
    /* Life */
    if (id == 0.0) {
        vec4 data = texture2D(state, index);
        if (rest <= 0.0) {
            gl_FragColor = initLife(data, randomD);
        }
        else {
            gl_FragColor = data;
        }
        return;
    }

    /* Active particle, skip */
    if (rest > 0.0 || id == 7.0) {
        vec4 data = texture2D(state, index);
        gl_FragColor = data;
        return;
    }

    vec2 lifeNid = pindex * 3.0 + noffset;
    vec4 lifeRandomD = texture2D(noise, lifeNid / noisesize);
    bool emitting = doEmit(lifeRandomD);

    if (!emitting) {
        vec4 data = texture2D(state, index);
        gl_FragColor = data;
        return;
    }

    /* Emitting */
    float random1 = randomMinus1To1(randomD.rg);
    float random2 = randomMinus1To1(randomD.ba);

    /* Color */
    if (id == 1.0) {
        vec4 randomD7 = texture2D(noise, vec2(nid.x, nid.y + 2.0) / noisesize);
        float random3 = randomMinus1To1(randomD7.rg);
        float random4 = randomMinus1To1(randomD7.ba);
        gl_FragColor = initColor(random1, random2, random3, random4);
        return;
    }
    /* Delta color */
    if (id == 2.0) {
        vec4 randomD1 = texture2D(noise, vec2(nid.x - 1.0, nid.y) / noisesize);
        float startR1 = randomMinus1To1(randomD1.rg);
        float startR2 = randomMinus1To1(randomD1.ba);
        vec4 randomD7 = texture2D(noise, vec2(nid.x, nid.y + 2.0) / noisesize);
        float random3 = randomMinus1To1(randomD7.rg);
        float random4 = randomMinus1To1(randomD7.ba);
        vec4 startR = vec4(startR1, startR2, random3, random4);
        gl_FragColor = initDeltaColor(startR, random1, random2, random3, random4);
        return;
    }
    /* Size and delta size */
    if (id == 3.0) {
        gl_FragColor = initSize(random1, random2);
        return;
    }
    /* Rotation and delta rotation */
    if (id == 4.0) {
        gl_FragColor = initRotation(random1, random2);
        return;
    }
    /* Control1 */
    if (id == 5.0) {
        gl_FragColor = initControl1(random1, random2);
        return;
    }
    /* Control2 */
    if (id == 6.0) {
        vec4 randomD5 = texture2D(noise, vec2(nid.x + 2.0, nid.y - 1.0) / noisesize);
        float startR1 = randomMinus1To1(randomD5.rg);
        gl_FragColor = initControl2(startR1, random1, random2);
        return;
    }
    /* Position */
    if (id == 8.0) {
        gl_FragColor = initPos(random1, random2);
        return;
    }
}