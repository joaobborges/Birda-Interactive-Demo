/**
 * shaderSources.ts — GLSL shader source strings for the Birda card front face.
 *
 * Inspired by sabosugi "Pixels as Frequencies" — luminance-driven topographic
 * displacement with layer quantization. Audio frequency data modulates the
 * displacement strength per frame.
 *
 * VERTEX_SHADER: Quantized luminance displacement along normal + audio modulation.
 * FRAGMENT_SHADER: Pure pass-through — natural colors preserved.
 */

/**
 * Vertex shader — "Pixels as Frequencies" topographic displacement.
 *
 * Uniforms:
 *   uBirdTex  — CanvasTexture of the drawn card front
 *   uFreqTex  — 1×64 DataTexture of audio frequency bins
 *   uTime     — accumulated elapsed time in seconds
 *   uBlend    — 0.0 = static (no displacement), 1.0 = full audio-reactive
 *   uLayers   — number of quantization layers (topographic bands)
 *   uStrength — displacement magnitude
 */
export const VERTEX_SHADER = /* glsl */ `
  uniform sampler2D uBirdTex;
  uniform sampler2D uFreqTex;
  uniform float uTime;
  uniform float uBlend;
  uniform float uLayers;
  uniform float uStrength;

  varying vec2 vUv;

  float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vUv = uv;

    vec4 birdColor = texture2D(uBirdTex, uv);
    float brightness = getLuminance(birdColor.rgb);

    // Invert: dark pixels (the bird) extrude, light pixels (background) stay flat
    float darkness = 1.0 - brightness;

    // Kill displacement on near-white areas (background, light patches)
    // smoothstep fades out displacement above ~0.75 brightness
    float birdMask = smoothstep(0.0, 0.35, darkness);

    // Quantize into discrete layers (topographic terracing)
    float stepped = floor(darkness * uLayers) / uLayers;
    float elevation = mix(stepped, darkness, 0.6) * birdMask;

    // Audio frequency modulation — frequency bin mapped to X position
    float freqVal = texture2D(uFreqTex, vec2(uv.x, 0.5)).r;
    // Combine base elevation with audio energy
    float audioBoost = 1.0 + freqVal * 1.5;

    // Zone mask — only bird illustration zone (top ~50%) displaces
    // Soft fade prevents hard seam at play strip boundary
    float zoneMask = smoothstep(0.48, 0.58, uv.y);

    // Edge fade — reduce displacement near all card edges to prevent overflow
    // edgeX: left/right edges, edgeY: top seam + bottom edge + upper card fade
    float edgeX = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);
    float edgeY = smoothstep(0.48, 0.58, uv.y) * smoothstep(1.0, 0.92, uv.y) * smoothstep(0.0, 0.08, uv.y);
    float edgeMask = edgeX * edgeY;

    // Final displacement: elevation × strength × audio × masks × blend
    float disp = elevation * uStrength * audioBoost * edgeMask * uBlend;

    // Displace along normal (Z for a flat plane)
    vec3 newPos = position + normal * disp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
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
