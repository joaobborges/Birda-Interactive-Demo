/**
 * AudioManager — gesture-gated Web Audio API manager for the Birda Field Card.
 *
 * Manages the full AudioContext lifecycle for Kingfisher call playback:
 *   - Gesture-gated AudioContext creation (iOS/browser policy compliance)
 *   - AnalyserNode for per-frame frequency data fed to the shader
 *   - Play/pause/resume toggle with AudioBufferSourceNode one-shot pattern
 *   - Natural end detection via onended callback
 *   - onStateChange callback for UI icon/glow updates in CardScene
 *
 * IMPORTANT: AudioBufferSourceNode is one-shot — a NEW node must be created for
 * every play/resume. Never call start() on an already-started source.
 *
 * Locked decisions (from Phase 3 CONTEXT.md):
 *   - Bird calls once like in nature — NO loop on AudioBufferSourceNode
 *   - fftSize=128 → frequencyBinCount=64 (matches DataTexture 1×64 layout)
 *   - Blend-back over ~2 seconds after call ends (handled by CardScene lerp)
 */

export type AudioState = "idle" | "playing" | "paused"

export class AudioManager {
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private source: AudioBufferSourceNode | null = null
  private audioBuffer: AudioBuffer | null = null
  private startOffset: number = 0
  private startTime: number = 0
  private _state: AudioState = "idle"
  private readonly fftSize = 128 // frequencyBinCount = 64

  /** Called whenever state transitions: play, pause, end */
  onStateChange: ((state: AudioState) => void) | null = null

  get state(): AudioState {
    return this._state
  }

  /**
   * Initialise AudioContext and load audio buffer.
   * Must be called from a user gesture (click) on first invocation.
   */
  async init(): Promise<void> {
    if (this.ctx) return // already initialised

    this.ctx = new AudioContext()

    this.analyser = this.ctx.createAnalyser()
    this.analyser.fftSize = this.fftSize
    this.analyser.smoothingTimeConstant = 0.8
    this.analyser.connect(this.ctx.destination)

    const response = await fetch("/audio/kingfisher.mp3")
    const arrayBuffer = await response.arrayBuffer()
    this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer)
  }

  /**
   * Start or resume playback.
   * Creates a fresh AudioBufferSourceNode every time (one-shot pattern).
   */
  play(): void {
    if (!this.ctx || !this.analyser || !this.audioBuffer) return

    // Resume suspended context (browser policy may auto-suspend)
    if (this.ctx.state === "suspended") {
      this.ctx.resume()
    }

    // Create a new one-shot source — cannot reuse a started source
    this.source = this.ctx.createBufferSource()
    this.source.buffer = this.audioBuffer
    this.source.loop = false // locked decision: no looping, plays once like in nature
    this.source.connect(this.analyser)

    // Natural end: reset to idle
    this.source.onended = () => {
      // Only handle if this is a natural end, not a manual stop
      if (this._state === "playing") {
        this.source = null
        this.startOffset = 0
        this._state = "idle"
        this.onStateChange?.("idle")
      }
    }

    this.startTime = this.ctx.currentTime
    this.source.start(0, this.startOffset)
    this._state = "playing"
    this.onStateChange?.("playing")
  }

  /**
   * Pause playback, recording current offset for resume.
   */
  pause(): void {
    if (!this.ctx || !this.source || this._state !== "playing") return

    // Record elapsed time so resume continues from the right position
    this.startOffset += this.ctx.currentTime - this.startTime

    // Clamp offset to buffer duration (safety)
    if (this.audioBuffer) {
      this.startOffset = Math.min(this.startOffset, this.audioBuffer.duration)
    }

    // Disconnect onended before stopping to prevent natural-end handler firing
    this.source.onended = null
    this.source.stop()
    this.source = null
    this._state = "paused"
    this.onStateChange?.("paused")
  }

  /**
   * Toggle between play/pause/resume.
   *   idle/paused → play()
   *   playing     → pause()
   */
  toggle(): void {
    if (this._state === "idle" || this._state === "paused") {
      // Reset offset if we reached the end and are restarting
      if (this._state === "idle") {
        this.startOffset = 0
      }
      this.play()
    } else {
      this.pause()
    }
  }

  /**
   * Returns frequency bin data for this frame.
   * Returns a zeroed Uint8Array if no analyser is available.
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(64)
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    return data
  }

  isPlaying(): boolean {
    return this._state === "playing"
  }

  isIdle(): boolean {
    return this._state === "idle"
  }

  isPaused(): boolean {
    return this._state === "paused"
  }

  /**
   * Clean up all Web Audio resources.
   */
  dispose(): void {
    if (this.source) {
      this.source.onended = null
      try {
        this.source.stop()
      } catch {
        // Source may already be stopped
      }
      this.source = null
    }
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
    this.analyser = null
    this.audioBuffer = null
    this._state = "idle"
  }
}
