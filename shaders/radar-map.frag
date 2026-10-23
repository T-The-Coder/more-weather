#version 440
#extension GL_GOOGLE_include_directive : require
// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;
layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    vec2 itemSize;
    int sourceMode;
    int treatment;
    float weakBelow;
    float cellSize;
    vec2 cellOrigin;
    vec4 sampleRect;
    float mercator;
    vec2 latitudes;
    vec2 mercatorEdges;
};
layout(binding = 1) uniform sampler2D source;
layout(binding = 2) uniform sampler2D swatches;
#include "radar-paint.glsl"
void main() {
    vec2 pixel = qt_TexCoord0 * itemSize + cellOrigin;
    vec2 uv = ((floor(pixel / cellSize) + 0.5) * cellSize - cellOrigin) / itemSize;
    if (mercator > 0.5) {
        uv.x = sampleRect.x + uv.x * sampleRect.z;
        float lat = radians(mix(latitudes.x, latitudes.y, uv.y));
        float my = (1.0 - log(tan(lat) + 1.0 / cos(lat)) / 3.14159265358979) * 0.5;
        uv.y = (my - mercatorEdges.x) / (mercatorEdges.y - mercatorEdges.x);
    } else uv = sampleRect.xy + uv * sampleRect.zw;
    vec4 code = texture(source, uv);
    fragColor = paintRadar(code, pixel * (3.0 / cellSize), sourceMode, treatment, weakBelow) * qt_Opacity;
}
