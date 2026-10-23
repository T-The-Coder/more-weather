// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
// Input palettes are class decoders, not output colours. Unknowns stay missing.
float classDbz(vec3 rgb, int mode) {
    vec3 b = floor(rgb * 255.0 + 0.5);
    if (mode == 2) {
        if (distance(b, vec3(51.0, 255.0, 255.0)) < 3.0) return 7.0103000;
        if (distance(b, vec3(26.0, 204.0, 154.0)) < 3.0) return 11.8267799;
        if (distance(b, vec3(1.0, 153.0, 52.0)) < 3.0) return 16.6432598;
        if (distance(b, vec3(77.0, 179.0, 27.0)) < 3.0) return 23.0103000;
        if (distance(b, vec3(153.0, 204.0, 1.0)) < 3.0) return 27.8267799;
        if (distance(b, vec3(204.0, 230.0, 1.0)) < 3.0) return 30.6442400;
        if (distance(b, vec3(255.0, 255.0, 1.0)) < 3.0) return 34.1938200;
        if (distance(b, vec3(255.0, 196.0, 1.0)) < 3.0) return 37.0112802;
        if (distance(b, vec3(255.0, 137.0, 1.0)) < 3.0) return 39.0103000;
        if (distance(b, vec3(255.0, 69.0, 1.0)) < 3.0) return 41.8277601;
        if (distance(b, vec3(254.0, 0.0, 0.0)) < 3.0) return 46.6442400;
        if (distance(b, vec3(229.0, 0.0, 76.0)) < 3.0) return 49.4617002;
        if (distance(b, vec3(204.0, 0.0, 152.0)) < 3.0) return 53.0112802;
        if (distance(b, vec3(102.0, 0.0, 203.0)) < 3.0) return 55.0103000;
        if (distance(b, vec3(0.0, 0.0, 254.0)) < 3.0) return 57.8277601;
    }
    if (mode == 3) {
        if (distance(b, vec3(242.0, 242.0, 255.0)) < 3.0) return 7.0103000;
        if (distance(b, vec3(160.0, 210.0, 255.0)) < 3.0) return 23.0103000;
        if (distance(b, vec3(33.0, 140.0, 255.0)) < 3.0) return 34.1938200;
        if (distance(b, vec3(0.0, 65.0, 255.0)) < 3.0) return 39.0103000;
        if (distance(b, vec3(250.0, 245.0, 0.0)) < 3.0) return 43.8267799;
        if (distance(b, vec3(255.0, 153.0, 0.0)) < 3.0) return 46.6442400;
        if (distance(b, vec3(255.0, 40.0, 0.0)) < 3.0) return 50.1938200;
        if (distance(b, vec3(180.0, 0.0, 104.0)) < 3.0) return 53.4597397;
    }
    return -999.0;
}
int densityAt(int slot) {
    if (slot == 0) return 0;
    if (slot == 1) return 7;
    if (slot == 2) return 3;
    if (slot == 3) return 6;
    if (slot == 4) return 4;
    if (slot == 5) return 8;
    if (slot == 6) return 2;
    if (slot == 7) return 5;
    return 1;
}
float radarBand(float dbz) {
    if (dbz >= 70.0) return 12.0;
    if (dbz >= 65.0) return 11.0;
    if (dbz >= 60.0) return 10.0;
    if (dbz >= 55.0) return 9.0;
    if (dbz >= 50.0) return 8.0;
    if (dbz >= 45.0) return 7.0;
    if (dbz >= 40.0) return 6.0;
    if (dbz >= 35.0) return 5.0;
    if (dbz >= 30.0) return 4.0;
    if (dbz >= 20.0) return 3.0;
    if (dbz >= 10.0) return 2.0;
    if (dbz >= 0.0) return 1.0;
    return 0.0;
}
float bandFloor(float band) {
    if (band == 0.0) return -32.0;
    if (band == 1.0) return 0.0;
    if (band == 2.0) return 10.0;
    if (band == 3.0) return 20.0;
    return 30.0 + (band - 4.0) * 5.0;
}
vec4 paintRadar(vec4 code, vec2 pixel, int mode, int treatment, float weakBelow) {
    if (mode == 0) return code;
    if (code.a < 0.01) return vec4(0);
    vec3 rgb = code.rgb / code.a;
    float dbz;
    if (mode == 1) {
        float raw = floor(rgb.r * 255.0 + 0.5);
        if (raw >= 128.0) raw -= 128.0;
        if (raw < 1.0) return vec4(0);
        dbz = raw - 32.0;
    } else if (mode == 4) dbz = (floor(rgb.r * 255.0 + 0.5) + 256.0 * floor(rgb.g * 255.0 + 0.5)) / 100.0 - 32.0;
    else dbz = classDbz(rgb, mode);
    if (dbz < -32.0 || dbz < weakBelow) return vec4(0);
    float band = radarBand(dbz);
    int group = int(band * 4.0 / 13.0);
    vec2 phase = mod(pixel, 3.0);
    float alpha = 1.0;
    if (treatment == 1) {
        int count = group == 0 ? 2 : group == 1 ? 4 : group == 2 ? 7 : 9;
        int slot = int(floor(phase.y)) * 3 + int(floor(phase.x));
        alpha = densityAt(slot) < count ? 1.0 : 0.0;
    } else if (treatment == 2) {
        float side = group == 0 ? 1.75 : group == 1 ? 2.0 : group == 2 ? 2.25 : 2.5;
        vec2 coverage = clamp(vec2(side * 0.5 + 0.5) - abs(phase - 1.5), 0.0, 1.0);
        alpha = coverage.x * coverage.y;
    }
    vec3 color = texture(swatches, vec2((band + 0.5) / 13.0, 0.5)).rgb;
    if (band > 0.0 && band < 12.0) {
        vec3 nextColor = texture(swatches, vec2((band + 1.5) / 13.0, 0.5)).rgb;
        float t = clamp((dbz - bandFloor(band)) / (bandFloor(band + 1.0) - bandFloor(band)), 0.0, 1.0);
        color = mix(color, nextColor, t);
    }
    return vec4(color * alpha, alpha);
}
