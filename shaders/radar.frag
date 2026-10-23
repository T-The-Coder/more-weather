#version 440
// The globe's radar picture on the GPU from z2 (WeatherGlobeRadarSurface.qml):
// the radar tiles of the view painted into one picture of their
// longitude/latitude box (`radar`: west..east across, north..south down, at
// about the tiles' own resolution), projected per fragment onto the globe
// (or the flat map) exactly as shaders/globe.frag projects the earth, over
// it. More Weather's own (not shared): the same view uniforms, a box
// instead of the whole earth. Built by tools/build-shaders.sh.

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    vec2 itemSize;
    vec2 center;
    float radius;
    vec3 rowRight;
    vec3 rowUp;
    vec3 rowDepth;
    float flatMap;
    float mapScale;
    vec2 mapCenter;
    // The picture's box in degrees: west, east, south, north (west/east may
    // run past ±180°).
    vec4 box;
};
layout(binding = 1) uniform sampler2D radar;

const float PI = 3.14159265358979;
const float DEG = 57.2957795130823;
// Equal Earth (EqualEarth.js).
const float A1 = 1.340264;
const float A2 = -0.081106;
const float A3 = 0.000893;
const float A4 = 0.003796;
const float M = 0.866025403784439;
const float Y_MAX = 1.3173627591574133;

// Coverage of a threshold: 1 well below `edge`, 0 well above, a smooth
// step one pixel (`fw`) wide.
float below(float v, float edge, float fw) {
    return 1.0 - smoothstep(edge - 0.5 * fw, edge + 0.5 * fw, v);
}

void main() {
    vec2 p = qt_TexCoord0 * itemSize;
    vec3 v;
    float coverage;
    if (flatMap > 0.5) {
        // Inverse Equal Earth: Newton on y, as EqualEarth.unproject.
        float mx = (p.x - center.x) / mapScale + mapCenter.x;
        float my = -(p.y - center.y) / mapScale + mapCenter.y;
        float yc = clamp(my, -Y_MAX, Y_MAX);
        float theta = yc;
        for (int i = 0; i < 6; i++) {
            float t2 = theta * theta;
            float t6 = t2 * t2 * t2;
            float fy = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)) - yc;
            float fpy = A1 + 3.0 * A2 * t2 + t6 * (7.0 * A3 + 9.0 * A4 * t2);
            theta -= fy / fpy;
        }
        float u2 = theta * theta;
        float u6 = u2 * u2 * u2;
        float lam = M * mx * (A1 + 3.0 * A2 * u2 + u6 * (7.0 * A3 + 9.0 * A4 * u2)) / cos(theta);
        float phi = asin(clamp(sin(theta) / M, -1.0, 1.0));
        // The outline: the poles' flat edges (map units) and the ±180°
        // meridians (radians of longitude), each over a pixel.
        float pole = (Y_MAX - abs(my)) * mapScale;
        float side = (PI - abs(lam)) / max(fwidth(lam), 1e-6);
        coverage = clamp(pole + 0.5, 0.0, 1.0) * clamp(side + 0.5, 0.0, 1.0);
        lam = clamp(lam, -PI, PI);
        float cp = cos(phi);
        v = vec3(cp * cos(lam), cp * sin(lam), sin(phi));
    } else {
        vec2 uw = vec2(p.x - center.x, center.y - p.y) / radius;
        float d = length(uw);
        // Alpha falls to 0 over the rim's last pixel.
        coverage = clamp((1.0 - d) * radius, 0.0, 1.0);
        if (d > 1.0) uw /= d;
        float f = sqrt(max(0.0, 1.0 - dot(uw, uw)));
        v = uw.x * rowRight + uw.y * rowUp + f * rowDepth;
    }
    float lat = asin(clamp(v.z, -1.0, 1.0)) * DEG;
    float lon = atan(v.y, v.x) * DEG;
    // The longitude nearest the box's middle (a box across ±180°).
    float mid = 0.5 * (box.x + box.y);
    lon += 360.0 * floor((mid - lon) / 360.0 + 0.5);
    vec2 st = vec2((lon - box.x) / (box.y - box.x), (box.w - lat) / (box.w - box.z));
    float inside = step(0.0, st.x) * step(st.x, 1.0) * step(0.0, st.y) * step(st.y, 1.0);
    vec4 c = texture(radar, clamp(st, 0.0, 1.0)) * inside;
    fragColor = c * (coverage * qt_Opacity);
}
