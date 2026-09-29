#version 440
// Wind streaks for WeatherWindField, drawn on the GPU (the CPU only moves
// `phase`). Sparse soft dots (data/wind-dots.png) drift with the wind; each
// pixel looks upwind for a dot, so a dot becomes a streak whose head moves
// at the wind's speed and whose tail fades behind it. Two layers half a cycle
// apart fade in and out in turn, so no dot is seen jumping back to its start.

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float phase;      // 0 … 1, looping once a second
    vec2 viewSize;    // the field's size in pixels
};

// rg: the wind towards east and towards the bottom of the view, 0.5 for
// calm, 0 and 1 for 120 km/h either way (WeatherWindField's vector texture).
layout(binding = 1) uniform sampler2D vectorField;
layout(binding = 2) uniform sampler2D dots;

const float MAX_KMH = 120.0;
const int TAIL = 14;

float layerAt(vec2 px, float t, vec2 offset) {
    vec2 wind = (texture(vectorField, px / viewSize).rg - 0.5) * 2.0 * MAX_KMH;
    float speed = length(wind);
    vec2 dir = speed > 0.01 ? wind / speed : vec2(1.0, 0.0);
    // Where the dot now at this pixel's streak head started the cycle:
    // 1.25 px a second per km/h (25 px/s at 20 km/h).
    vec2 origin = px - dir * speed * 1.25 * t + offset;
    // Tail: longer for faster wind, sampled finer than the dots' size.
    float stepPx = clamp(0.7 + speed * 0.05, 0.7, 1.8);
    float brightest = 0.0;
    for (int i = 0; i < TAIL; ++i) {
        float fade = 1.0 - float(i) / float(TAIL);
        brightest = max(brightest, texture(dots, fract((origin + dir * stepPx * float(i)) / 256.0)).r * fade);
    }
    return brightest;
}

void main() {
    vec2 px = qt_TexCoord0 * viewSize;
    float t0 = phase;
    float t1 = fract(phase + 0.5);
    // Each layer is brightest mid-cycle and gone at the moment it restarts.
    float w0 = 1.0 - abs(2.0 * t0 - 1.0);
    float w1 = 1.0 - abs(2.0 * t1 - 1.0);
    float a = layerAt(px, t0, vec2(0.0)) * w0 + layerAt(px, t1, vec2(97.0, 53.0)) * w1;
    a = clamp(a * 0.95, 0.0, 0.75);
    fragColor = vec4(a, a, a, a) * qt_Opacity;
}
