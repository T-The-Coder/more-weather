#version 440
// The globe's surface on the GPU (WeatherGlobeSurface.qml, GLOBE-SHADER.md):
// an equirectangular picture of the earth (`source`: lon -180..180 across x,
// lat +90..-90 down y, premultiplied RGBA) projected per fragment onto the
// orthographic globe (or, with `flatMap`, the Equal Earth map), over a base
// colour, with the night in three stepped bands on top and the rim (or the
// map's outline) antialiased over its last pixel. Coordinates as in
// GlobeProjection.js: view vectors (u right, w up, depth towards the viewer)
// of unit length, Earth-fixed vectors (x to 0°/0°, y to 90° E, z north).
// Built by tools/build-shaders.sh into globe.frag.qsb.

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    // The item's size and the disc's centre in item pixels, its radius.
    vec2 itemSize;
    vec2 center;
    float radius;
    // Globe.viewMatrix as rows: screen right, screen up, towards the viewer.
    vec3 rowRight;
    vec3 rowUp;
    vec3 rowDepth;
    // Unit vector to the subsolar point (Earth-fixed).
    vec3 sunDir;
    // Night: on (1) or off (0); the alphas of the bands below 0°, -6° and
    // -12° of sun elevation; the night colour (rgb, not premultiplied).
    float nightOn;
    vec3 nightAlpha;
    vec4 nightColor;
    // Under the picture, premultiplied (the sphere's faint fill).
    vec4 baseColor;
    // The flat Equal Earth map instead of the globe (1), its pixels per map
    // unit and the map point (map units) at `center`.
    float flatMap;
    float mapScale;
    vec2 mapCenter;
    // Optional twilight bands under the night (More Time's golden and blue
    // hour): rgb straight; the alphas of the three steps of each band,
    // gold +6..+4, +4..+2, +2..0 and blue 0..-3, -3..-6, -6..-8 degrees of
    // sun elevation (Sky.GOLDEN_STEPS, Sky.BLUE_STEPS). All zero (the
    // default): no bands.
    vec4 goldColor;
    vec3 goldAlpha;
    vec4 blueColor;
    vec3 blueAlpha;
};
layout(binding = 1) uniform sampler2D source;

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
    float lat = asin(clamp(v.z, -1.0, 1.0));
    float lon = atan(v.y, v.x);
    vec2 st = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);
    // No mipmaps, so the longitude's jump at ±180° picks no other level.
    vec4 tex = texture(source, st);
    vec4 c = tex + baseColor * (1.0 - tex.a);

    // Derivatives stay outside any branch on the fragment's position.
    float e = asin(clamp(dot(v, sunDir), -1.0, 1.0)) * DEG;
    float fw = max(fwidth(e), 1e-4);
    float s0 = below(e, 0.0, fw);
    float s6 = below(e, -6.0, fw);
    float s12 = below(e, -12.0, fw);
    // The bands, each step over what is under it, then the night on top.
    float g6 = below(e, 6.0, fw);
    float g4 = below(e, 4.0, fw);
    float g2 = below(e, 2.0, fw);
    float b3 = below(e, -3.0, fw);
    float b8 = below(e, -8.0, fw);
    vec3 goldSteps = goldAlpha * vec3(g6 - g4, g4 - g2, g2 - s0);
    vec3 blueSteps = blueAlpha * vec3(s0 - b3, b3 - s6, s6 - b8);
    float ga = goldSteps.x;
    c = vec4(goldColor.rgb * ga, ga) + c * (1.0 - ga);
    ga = goldSteps.y;
    c = vec4(goldColor.rgb * ga, ga) + c * (1.0 - ga);
    ga = goldSteps.z;
    c = vec4(goldColor.rgb * ga, ga) + c * (1.0 - ga);
    float ba = blueSteps.x;
    c = vec4(blueColor.rgb * ba, ba) + c * (1.0 - ba);
    ba = blueSteps.y;
    c = vec4(blueColor.rgb * ba, ba) + c * (1.0 - ba);
    ba = blueSteps.z;
    c = vec4(blueColor.rgb * ba, ba) + c * (1.0 - ba);
    float a = nightOn * (nightAlpha.x * (s0 - s6) + nightAlpha.y * (s6 - s12) + nightAlpha.z * s12);
    c = vec4(nightColor.rgb * a, a) + c * (1.0 - a);
    fragColor = c * (coverage * qt_Opacity);
}
