/**
 * shaderSources.ts — GLSL shader source strings for the Birda card front face.
 *
 * VERTEX_SHADER: Luminance-driven vertex displacement with idle breathing and
 * audio-reactive ripple. Uses GLSL ES 1.0 (no glslVersion: THREE.GLSL3 set).
 * Three.js r183 handles WebGL2 translation automatically.
 *
 * FRAGMENT_SHADER: Pure pass-through — samples uBirdTex at vUv. No color
 * manipulation per locked project decision (Phase 3 CONTEXT.md).
 */

/**
 * Vertex shader — applies luminance-based z-displacement to the bird illustration.
 *
 * Uniforms:
 *   uBirdTex  — CanvasTexture of the drawn card front (bird illustration)
 *   uFreqTex  — 1×64 DataTexture (RGBA, UnsignedByte) of audio frequency bins
 *   uTime     — accumulated elapsed time in seconds (incremented by dt)
 *   uBlend    — 0.0 = idle breathing only, 1.0 = full audio-reactive
 *
 * Zone mask: only the top 50% of the card (UV Y > 0.5, i.e. the bird zone)
 * receives displacement. Play strip and species info remain flat and readable.
 */
export const VERTEX_SHADER = /* glsl */ `
  uniform sampler2D uBirdTex;
  uniform sampler2D uFreqTex;
  uniform float uTime;
  uniform float uBlend;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Sample bird illustration at this vertex's UV position
    vec4 birdColor = texture2D(uBirdTex, uv);

    // Extract luminance using BT.601 coefficients
    // Bright chest/beak pixels produce higher lum → displace more
    float lum = dot(birdColor.rgb, vec3(0.299, 0.587, 0.114));

    // Zone mask — only bird zone (top 50% of card) displaces
    // UV Y=0 is bottom, Y=1 is top; step(0.5, uv.y) = 1.0 when uv.y >= 0.5
    float zoneMask = step(0.5, uv.y);

    // ---- Idle breathing: 3 overlapping sine waves ----
    // Primary cycle ~3-4 seconds, layered for organic, non-mechanical feel
    float idle =
      sin(uTime * 1.7 + uv.x * 3.14) * 0.5 +
      sin(uTime * 1.1 + uv.y * 2.5)  * 0.3 +
      sin(uTime * 2.3 + (uv.x + uv.y) * 4.0) * 0.2;

    // Scale idle displacement: ~2-3px at card scale (0.008 world units)
    float idleDisp = idle * lum * 0.008;

    // ---- Audio-reactive displacement ----
    // Sample frequency bin matching this vertex's X position
    float freqVal = texture2D(uFreqTex, vec2(uv.x, 0.5)).r;

    // Sample neighboring bin for lateral drift (organic wobble on x-axis)
    float freqNeighbor = texture2D(uFreqTex, vec2(uv.x + 0.02, 0.5)).r;

    // Peak audio displacement: ~5-8px at card scale (0.02 world units)
    float audioDisp = freqVal * lum * 0.02;

    // Blend idle and audio displacement based on uBlend
    float zDisp = mix(idleDisp, audioDisp, uBlend) * zoneMask;

    // Lateral x-axis drift based on neighboring frequency difference
    float xDrift = (freqNeighbor - freqVal) * lum * 0.004 * uBlend * zoneMask;

    // Apply displacement to vertex position
    vec3 displaced = position;
    displaced.z += zDisp;
    displaced.x += xDrift;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

/**
 * Fragment shader — pure pass-through, preserves the bird illustration's
 * natural colors exactly. No color manipulation per locked project decision.
 */
export const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uBirdTex;

  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(uBirdTex, vUv);
  }
`
