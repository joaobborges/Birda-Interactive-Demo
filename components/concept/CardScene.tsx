"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { drawCardFront } from "@/lib/card/drawCardFront"
import { drawCardBack } from "@/lib/card/drawCardBack"
import { stepSpring, type SpringState } from "@/lib/card/springPhysics"
import { VERTEX_SHADER, FRAGMENT_SHADER } from "@/lib/card/shaderSources"
import { AudioManager } from "@/lib/card/audioManager"
import { updateFreqTexture } from "@/lib/card/uniformBridge"

/**
 * CardScene — Client-only Three.js scene for the Birda Field Card prototype.
 * Renders inside GalleryFrame via next/dynamic SSR isolation.
 *
 * Scene: dark background with museum-style warm/cool lighting and a
 * field card mesh (2.5:3.5 ratio) with canvas-painted front and back faces.
 *
 * Phase 2 Plan 01: established the 3D rendering foundation.
 * Phase 2 Plan 02: adds CanvasTexture front/back faces from drawing functions.
 * Phase 2 Plan 03: adds full interaction system — drag, spring snap-back,
 *   hover parallax, flip, idle float, play strip click, cursor states, hint.
 */

export interface CardSceneControls {
  flip: () => void
}

export interface CardSceneProps {
  onReady?: (controls: CardSceneControls) => void
}

export function CardScene({ onReady }: CardSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  // Stable ref so GalleryFrame can call flip() at any time after mount
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(0xfaf7f2, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // Grab cursor on hover
    renderer.domElement.style.cursor = "grab"

    // --- Scene ---
    const scene = new THREE.Scene()

    // --- Camera ---
    const width = mount.clientWidth || 400
    const height = mount.clientHeight || 520
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 5
    renderer.setSize(width, height)

    // --- Lights (museum spotlight pattern from CONTEXT.md) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.4)
    keyLight.position.set(2, 4, 3)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.3)
    fillLight.position.set(-2, 1, 2)
    scene.add(fillLight)

    // --- Card geometry ---
    // Front face uses 64x64 subdivision for vertex displacement
    const frontGeometry = new THREE.PlaneGeometry(2.5, 3.5, 64, 64)
    // Back face has no displacement — keep minimal geometry
    const cardGeometry = new THREE.PlaneGeometry(2.5, 3.5)

    // Frequency data texture (1×64 RGBA) — zeroed initially, Plan 02 fills from AnalyserNode
    const BIN_COUNT = 64
    const freqData = new Uint8Array(BIN_COUNT * 4) // RGBA
    const freqTexture = new THREE.DataTexture(freqData, BIN_COUNT, 1, THREE.RGBAFormat, THREE.UnsignedByteType)
    freqTexture.minFilter = THREE.LinearFilter
    freqTexture.magFilter = THREE.LinearFilter
    freqTexture.needsUpdate = true

    // Shader material ref — populated in async init, used in animate()
    let shaderMaterial: THREE.ShaderMaterial | null = null

    // Placeholder materials — replaced by canvas textures after async init
    // Typed as Material (base class) so ShaderMaterial can be assigned in async init
    const frontMesh = new THREE.Mesh<THREE.PlaneGeometry, THREE.Material>(
      frontGeometry,
      new THREE.MeshStandardMaterial({ color: 0x1a3a2a, side: THREE.FrontSide })
    )
    frontMesh.position.z = 0.001

    const backMesh = new THREE.Mesh(
      cardGeometry,
      new THREE.MeshStandardMaterial({ color: 0x1a3a2a, side: THREE.FrontSide })
    )
    backMesh.rotation.y = Math.PI

    const cardGroup = new THREE.Group()
    cardGroup.add(frontMesh)
    cardGroup.add(backMesh)
    scene.add(cardGroup)

    // -----------------------------------------------------------------------
    // Interaction state
    // -----------------------------------------------------------------------

    // Spring physics — stiffness 120, damping 12, mass 1
    // Y resting target = Math.PI / 18 (10-degree tilt per CONTEXT.md)
    let springX: SpringState = {
      position: 0,
      velocity: 0,
      target: 0,
      stiffness: 120,
      damping: 12,
      mass: 1,
    }
    let springY: SpringState = {
      position: Math.PI / 18,
      velocity: 0,
      target: Math.PI / 18,
      stiffness: 120,
      damping: 12,
      mass: 1,
    }

    let isDragging = false
    let hasInteracted = false
    let isFlipped = false

    let lastPointerX = 0
    let lastPointerY = 0
    let dragVelocityX = 0
    let dragVelocityY = 0
    let totalDragDistance = 0 // for click-vs-drag detection

    // Hover parallax offset (additive to spring, zeroed during drag)
    let hoverX = 0
    let hoverY = 0
    let targetHoverX = 0
    let targetHoverY = 0

    // Hover z-elevation — card lifts toward camera on hover
    let isHovering = false
    let hoverZ = 0

    // Track textures for cleanup and play-strip pulse
    let frontTexture: THREE.CanvasTexture | null = null
    let backTexture: THREE.CanvasTexture | null = null
    let frontCanvas: HTMLCanvasElement | null = null
    let backCanvas: HTMLCanvasElement | null = null

    // Play strip hover glow state
    let isHoveringStrip = false
    let stripGlowAlpha = 0
    let cachedBirdImg: HTMLImageElement | null = null

    // -----------------------------------------------------------------------
    // Audio state — AudioManager wired in Task 1 of Plan 02
    // -----------------------------------------------------------------------
    let audioManager: AudioManager | null = null
    let uBlendValue = 0
    let isAudioPlaying = false // tracks icon/glow state for canvas redraw

    // Blend rates: in 0.3s, out 2.0s (locked decision)
    const BLEND_IN_RATE = 1.0 / 0.3
    const BLEND_OUT_RATE = 1.0 / 2.0

    /**
     * Redraw front canvas with updated play/pause icon state.
     * Only called on state transitions (not every frame) to minimise canvas cost.
     */
    function redrawFrontCanvas(playing: boolean) {
      if (!frontCanvas || !frontTexture) return
      drawCardFront(frontCanvas, cachedBirdImg, playing).then(() => {
        if (frontTexture) frontTexture.needsUpdate = true
      })
    }

    // -----------------------------------------------------------------------
    // Pointer event handlers
    // -----------------------------------------------------------------------

    function onPointerDown(e: PointerEvent) {
      isDragging = true
      lastPointerX = e.clientX
      lastPointerY = e.clientY
      dragVelocityX = 0
      dragVelocityY = 0
      totalDragDistance = 0

      renderer.domElement.style.cursor = "grabbing"
      // Critical: retain pointer even when moved outside canvas (RESEARCH.md Pitfall 4)
      renderer.domElement.setPointerCapture(e.pointerId)

      if (!hasInteracted) {
        hasInteracted = true
        window.dispatchEvent(new CustomEvent("card-first-interaction"))
      }
    }

    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()

      if (!isDragging) {
        isHovering = true
        // Hover parallax — max ~3 degrees additive tilt
        targetHoverX = ((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 0.1
        targetHoverY = ((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 0.1

        // Play strip hover glow — raycast to check if hovering over the strip
        if (frontCanvas && !isFlipped) {
          const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
          const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
          const rc = new THREE.Raycaster()
          rc.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
          const hits = rc.intersectObject(frontMesh)
          const uv = hits.length > 0 ? hits[0].uv : null
          const overStrip = uv ? uv.y >= 0.48 && uv.y <= 0.62 : false
          if (overStrip !== isHoveringStrip) {
            isHoveringStrip = overStrip
            renderer.domElement.style.cursor = overStrip ? "pointer" : "grab"
          }
        }
        return
      }

      const dx = e.clientX - lastPointerX
      const dy = e.clientY - lastPointerY
      totalDragDistance += Math.sqrt(dx * dx + dy * dy)

      // Apply rotation delta directly to cardGroup
      cardGroup.rotation.x += dy * 0.008
      cardGroup.rotation.y += dx * 0.008

      // Track velocity for momentum on release
      dragVelocityX = dy * 0.008
      dragVelocityY = dx * 0.008

      lastPointerX = e.clientX
      lastPointerY = e.clientY

      // Disable hover parallax during drag
      targetHoverX = 0
      targetHoverY = 0
      hoverX = 0
      hoverY = 0
    }

    function onPointerUp() {
      if (!isDragging) return
      isDragging = false
      renderer.domElement.style.cursor = "grab"

      // Seed spring from current rotation and drag momentum
      springX = {
        ...springX,
        position: cardGroup.rotation.x,
        velocity: dragVelocityX * 5,
      }
      springY = {
        ...springY,
        position: cardGroup.rotation.y,
        velocity: dragVelocityY * 5,
      }

      // Detect drag-to-flip: normalise Y rotation and check if past 90 deg
      // Wrap the current Y rotation into [0, 2PI) for threshold check
      const normalised = ((cardGroup.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const pastHalf = normalised > Math.PI / 2 && normalised < (3 * Math.PI) / 2

      if (pastHalf !== isFlipped) {
        isFlipped = pastHalf
        springY.target = isFlipped ? Math.PI + Math.PI / 18 : Math.PI / 18
      }
    }

    function onMouseLeave() {
      targetHoverX = 0
      targetHoverY = 0
      isHovering = false
    }

    // -----------------------------------------------------------------------
    // Click handler — play strip UV detection
    // -----------------------------------------------------------------------
    function onClick(e: MouseEvent) {
      // Only treat as click if pointer barely moved (not a drag)
      if (totalDragDistance > 5) return
      if (!frontCanvas) return

      const rect = renderer.domElement.getBoundingClientRect()
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)

      const hits = raycaster.intersectObject(frontMesh)
      if (hits.length === 0) return

      const uv = hits[0].uv
      if (!uv) return

      // Play strip is approximately 40-50% from top in UV space
      // (UV Y=0 is bottom, so strip at ~0.50-0.60 in UV)
      if (uv.y >= 0.48 && uv.y <= 0.62) {
        if (!audioManager) {
          // First click: create AudioManager (gesture-gated AudioContext creation)
          audioManager = new AudioManager()
          audioManager.onStateChange = (state) => {
            const playing = state === "playing"
            if (playing !== isAudioPlaying) {
              isAudioPlaying = playing
              redrawFrontCanvas(playing)
            }
          }
          audioManager.init().then(() => audioManager?.toggle()).catch(console.error)
        } else {
          audioManager.toggle()
        }
      }
    }

    function pulsePlayStrip() {
      if (!frontCanvas || !frontTexture) return
      const ctx = frontCanvas.getContext("2d")
      if (!ctx) return

      const cw = frontCanvas.width
      const ch = frontCanvas.height
      const stripY = ch * 0.38
      const stripH = ch * 0.12

      // Strong gold glow pulse — two layers for intensity
      ctx.save()
      ctx.globalAlpha = 0.55
      ctx.fillStyle = "#f5d080"
      ctx.fillRect(0, stripY, cw, stripH)
      ctx.restore()

      // Extra bright center bloom
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = "#ffe8b0"
      ctx.fillRect(cw * 0.2, stripY + stripH * 0.15, cw * 0.6, stripH * 0.7)
      ctx.restore()

      frontTexture.needsUpdate = true

      setTimeout(() => {
        if (!frontCanvas || !frontTexture) return
        drawCardFront(frontCanvas, cachedBirdImg, isAudioPlaying).then(() => {
          if (frontTexture) frontTexture.needsUpdate = true
        })
      }, 250)
    }

    // -----------------------------------------------------------------------
    // Flip function exposed to parent via onReady
    // -----------------------------------------------------------------------
    function flipCard() {
      isFlipped = !isFlipped
      // Set spring target to flipped or front resting angle
      springY = {
        ...springY,
        target: isFlipped ? Math.PI + Math.PI / 18 : Math.PI / 18,
      }
    }

    // Expose controls to parent
    onReadyRef.current?.({ flip: flipCard })

    // -----------------------------------------------------------------------
    // Register event listeners
    // -----------------------------------------------------------------------
    renderer.domElement.addEventListener("pointerdown", onPointerDown)
    renderer.domElement.addEventListener("pointermove", onPointerMove)
    renderer.domElement.addEventListener("pointerup", onPointerUp)
    renderer.domElement.addEventListener("mouseleave", onMouseLeave)
    renderer.domElement.addEventListener("click", onClick)

    // -----------------------------------------------------------------------
    // Animation loop
    // -----------------------------------------------------------------------
    let animFrameId: number
    let lastTime = performance.now()
    const clock = new THREE.Clock()

    function animate() {
      animFrameId = requestAnimationFrame(animate)
      const now = performance.now()
      // Clamp dt to max 50ms — prevents spring explosion on tab switch (RESEARCH.md Pitfall 5)
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      // Accumulate shader time via dt (not clock.getElapsedTime()) to avoid
      // jump on tab switch (RESEARCH.md Pitfall 8)
      if (shaderMaterial) {
        shaderMaterial.uniforms.uTime.value += dt
      }

      // ---- Audio-reactive shader updates ----
      if (audioManager && shaderMaterial) {
        const audioIsPlaying = audioManager.isPlaying()

        // Determine blend target and rate
        const blendTarget = audioIsPlaying ? 1.0 : 0.0
        const blendRate = audioIsPlaying ? BLEND_IN_RATE : BLEND_OUT_RATE

        // Smooth lerp: clamp to avoid overshoot on large dt
        uBlendValue += (blendTarget - uBlendValue) * Math.min(blendRate * dt, 1.0)

        // Clamp near zero to prevent micro-fluctuations
        if (uBlendValue < 0.001 && blendTarget === 0.0) {
          uBlendValue = 0.0
        }

        shaderMaterial.uniforms.uBlend.value = uBlendValue

        // Update freqTexture when playing or during blend-out tail
        // (blend-out uses actual diminishing data rather than frozen values)
        if (audioIsPlaying || uBlendValue > 0.001) {
          updateFreqTexture(freqData, freqTexture, audioManager)
        }
      }

      if (!isDragging) {
        // Step springs toward their targets
        springX = stepSpring(springX, dt)
        springY = stepSpring(springY, dt)

        // Lerp hover parallax offset for smoothness
        hoverX += (targetHoverX - hoverX) * 0.08
        hoverY += (targetHoverY - hoverY) * 0.08

        // Apply spring + hover
        cardGroup.rotation.x = springX.position + hoverX
        cardGroup.rotation.y = springY.position + hoverY

        // Hover z-elevation — lerp toward camera
        const targetZ = isHovering ? 0.15 : 0
        hoverZ += (targetZ - hoverZ) * 0.08
        cardGroup.position.z = hoverZ

        // Idle float — subtle sine wave, ~1-2px perceived movement
        const elapsed = clock.getElapsedTime()
        cardGroup.position.y = Math.sin(elapsed * 0.8) * 0.015
      }

      // Animated play strip hover glow — throttled to reduce canvas redraws
      const prevGlow = stripGlowAlpha
      const targetGlow = isHoveringStrip ? 0.4 : 0
      stripGlowAlpha += (targetGlow - stripGlowAlpha) * 0.12

      // Only redraw when glow changes by a visible amount (> 0.02)
      const glowChanged = Math.abs(stripGlowAlpha - prevGlow) > 0.02
      if (frontCanvas && frontTexture && glowChanged) {
        if (stripGlowAlpha < 0.01) {
          // Clean exit — redraw without glow, preserving audio icon state
          stripGlowAlpha = 0
          drawCardFront(frontCanvas, cachedBirdImg, isAudioPlaying).then(() => {
            if (frontTexture) frontTexture.needsUpdate = true
          })
        } else {
          drawCardFront(frontCanvas, cachedBirdImg, isAudioPlaying).then(() => {
            if (!frontCanvas || !frontTexture) return
            const fCtx2 = frontCanvas.getContext("2d")
            if (!fCtx2) return
            const DPR = Math.min(window.devicePixelRatio || 1, 2)
            const cw = 500 * DPR
            const ch = 700 * DPR
            const stripY = ch * 0.38
            const stripH = ch * 0.12
            fCtx2.save()
            fCtx2.globalAlpha = stripGlowAlpha
            fCtx2.fillStyle = "#f5d080"
            fCtx2.fillRect(0, stripY, cw, stripH)
            fCtx2.globalAlpha = stripGlowAlpha * 0.6
            fCtx2.fillStyle = "#ffe8b0"
            fCtx2.fillRect(cw * 0.25, stripY + stripH * 0.2, cw * 0.5, stripH * 0.6)
            fCtx2.restore()
            frontTexture!.needsUpdate = true
          })
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // --- ResizeObserver: update camera and renderer on container resize ---
    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(mount)

    // -----------------------------------------------------------------------
    // Async init: fonts ready → draw canvases → apply CanvasTextures
    // -----------------------------------------------------------------------
    let cancelled = false

    const init = async () => {
      // Pitfall 1 (RESEARCH.md): await document.fonts.ready to ensure
      // Playfair Display + Inter are loaded before canvas drawing
      await document.fonts.ready

      if (cancelled) return

      // Create off-screen canvases
      frontCanvas = document.createElement("canvas")
      backCanvas = document.createElement("canvas")

      // Load bird illustration — graceful fallback if missing
      const birdImg = new Image()
      birdImg.src = "/images/kingfisher.png"
      await new Promise<void>((resolve) => {
        birdImg.onload = () => resolve()
        birdImg.onerror = () => resolve()
      })
      cachedBirdImg = birdImg.complete && birdImg.naturalWidth > 0 ? birdImg : null

      if (cancelled) return

      // Draw front and back faces to canvases
      await drawCardFront(frontCanvas, birdImg)
      drawCardBack(backCanvas)

      if (cancelled) return

      // Create CanvasTextures — do NOT set needsUpdate every frame (RESEARCH.md anti-patterns)
      frontTexture = new THREE.CanvasTexture(frontCanvas)
      frontTexture.minFilter = THREE.LinearFilter
      frontTexture.colorSpace = THREE.SRGBColorSpace

      backTexture = new THREE.CanvasTexture(backCanvas)
      backTexture.minFilter = THREE.LinearFilter
      backTexture.colorSpace = THREE.SRGBColorSpace

      // Dispose placeholder material and apply ShaderMaterial to front face
      const prevFrontMat = frontMesh.material as THREE.MeshStandardMaterial
      prevFrontMat.dispose()
      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uBirdTex: { value: frontTexture },
          uFreqTex: { value: freqTexture },
          uTime: { value: 0.0 },
          uBlend: { value: 0.0 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        side: THREE.FrontSide,
      })
      frontMesh.material = shaderMaterial

      const prevBackMat = backMesh.material as THREE.MeshStandardMaterial
      prevBackMat.dispose()
      backMesh.material = new THREE.MeshStandardMaterial({
        map: backTexture,
        side: THREE.FrontSide,
      })
    }

    init().catch(console.error)

    // -----------------------------------------------------------------------
    // Cleanup
    // -----------------------------------------------------------------------
    return () => {
      cancelled = true
      cancelAnimationFrame(animFrameId)
      resizeObserver.disconnect()

      // Dispose audio resources
      audioManager?.dispose()
      audioManager = null

      renderer.domElement.removeEventListener("pointerdown", onPointerDown)
      renderer.domElement.removeEventListener("pointermove", onPointerMove)
      renderer.domElement.removeEventListener("pointerup", onPointerUp)
      renderer.domElement.removeEventListener("mouseleave", onMouseLeave)
      renderer.domElement.removeEventListener("click", onClick)

      // Dispose textures
      if (frontTexture) frontTexture.dispose()
      if (backTexture) backTexture.dispose()
      freqTexture.dispose()

      // Dispose materials
      if (shaderMaterial) {
        shaderMaterial.dispose()
      } else {
        // Dispose placeholder if init never completed
        const fMat = frontMesh.material as THREE.MeshStandardMaterial
        fMat.dispose()
      }
      const bMat = backMesh.material as THREE.MeshStandardMaterial
      bMat.dispose()

      // Dispose geometries
      frontGeometry.dispose()
      cardGeometry.dispose()

      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#FAF7F2",
      }}
    />
  )
}
