#version 440
#extension GL_GOOGLE_include_directive : require
// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;
layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    vec2 itemSize;
    float cellSize;
    int treatment;
    float weakBelow;
    vec4 mapBox;
    vec2 gridOrigin;
    vec4 gridAxes;
    vec2 gridSize;
};
layout(binding = 1) uniform sampler2D source;
layout(binding = 2) uniform sampler2D swatches;
#include "radar-paint.glsl"
void main() {
    vec2 pixel = qt_TexCoord0 * itemSize;
    vec2 cell = (floor(pixel / cellSize) + 0.5) * cellSize;
    vec2 uv = cell / itemSize;
    float lat = radians(mix(mapBox.w, mapBox.z, uv.y));
    float lon = radians(mix(mapBox.x, mapBox.y, uv.x) - 10.0);
    float r = 6370.04 * (1.0 + sin(radians(60.0))) * cos(lat) / (1.0 + sin(lat));
    vec2 d = vec2(r * sin(lon), -r * cos(lon)) - gridOrigin;
    float det = gridAxes.x * gridAxes.w - gridAxes.y * gridAxes.z;
    vec2 cr = vec2(d.x * gridAxes.w - d.y * gridAxes.z, d.y * gridAxes.x - d.x * gridAxes.y) / det;
    if (cr.x < 0.0 || cr.y < 0.0 || cr.x >= gridSize.x || cr.y >= gridSize.y) { fragColor = vec4(0); return; }
    vec4 code = texture(source, (floor(cr) + 0.5) / gridSize);
    fragColor = paintRadar(code, pixel * (3.0 / cellSize), 4, treatment, weakBelow) * qt_Opacity;
}
