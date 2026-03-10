/**
 * uniformBridge.ts — DataTexture creation and per-frame update from AudioManager.
 *
 * Bridges the Web Audio AnalyserNode frequency data into the Three.js
 * DataTexture uniform (uFreqTex) that feeds the GLSL vertex shader.
 *
 * Layout: 1×64 RGBA DataTexture. Frequency amplitude (0–255) is written to the
 * R channel of each bin. The shader samples: texture2D(uFreqTex, vec2(uv.x, 0.5)).r
 */

import * as THREE from "three"
import type { AudioManager } from "./audioManager"

/**
 * Create a zeroed 1×64 RGBA DataTexture ready to receive frequency data.
 * Call once during scene init; pass freqTexture as uFreqTex uniform value.
 */
export function createFreqTexture(binCount: number): {
  freqData: Uint8Array
  freqTexture: THREE.DataTexture
} {
  const freqData = new Uint8Array(binCount * 4) // RGBA
  const freqTexture = new THREE.DataTexture(
    freqData,
    binCount,
    1,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  )
  freqTexture.minFilter = THREE.LinearFilter
  freqTexture.magFilter = THREE.LinearFilter
  freqTexture.needsUpdate = true

  return { freqData, freqTexture }
}

/**
 * Update the DataTexture with the latest frequency data from AudioManager.
 *
 * Call each animation frame when:
 *   - audioManager.isPlaying() — direct data feed
 *   - uBlend > 0.001 during blend-out — smooth fade with real (diminishing) data
 *
 * Writes frequency amplitude to the R channel of each RGBA bin.
 * G, B channels left as 0 (reserved for future use).
 * A channel set to 255 (fully opaque) for correct DataTexture sampling.
 */
export function updateFreqTexture(
  freqData: Uint8Array,
  freqTexture: THREE.DataTexture,
  audioManager: AudioManager
): void {
  const bins = audioManager.getFrequencyData()
  const binCount = bins.length

  for (let i = 0; i < binCount; i++) {
    const offset = i * 4
    freqData[offset] = bins[i]     // R — frequency amplitude
    freqData[offset + 1] = 0       // G — reserved
    freqData[offset + 2] = 0       // B — reserved
    freqData[offset + 3] = 255     // A — fully opaque
  }

  freqTexture.needsUpdate = true
}
