"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { drawCardFront } from "@/lib/card/drawCardFront"
import { drawCardBack } from "@/lib/card/drawCardBack"

/**
 * CardScene — Client-only Three.js scene for the Birda Field Card prototype.
 * Renders inside GalleryFrame via next/dynamic SSR isolation.
 *
 * Scene: dark background with museum-style warm/cool lighting and a
 * field card mesh (2.5:3.5 ratio) with canvas-painted front and back faces.
 *
 * Phase 2 Plan 01: established the 3D rendering foundation.
 * Phase 2 Plan 02: adds CanvasTexture front/back faces from drawing functions.
 * Phase 2 Plan 03+: will add hover/rotation interaction.
 */
export function CardScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(0x0d0d0d, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

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
    const cardGeometry = new THREE.PlaneGeometry(2.5, 3.5)

    // Placeholder materials — will be replaced by canvas textures after async init
    const frontMesh = new THREE.Mesh(
      cardGeometry,
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

    // 10-degree resting tilt per CONTEXT.md
    cardGroup.rotation.y = Math.PI / 18

    scene.add(cardGroup)

    // --- Animation loop ---
    let animFrameId: number
    let lastTime = performance.now()

    function animate() {
      animFrameId = requestAnimationFrame(animate)
      const now = performance.now()
      // Clamp dt to max 50ms to prevent spring explosion on tab switch (RESEARCH.md Pitfall 5)
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      // dt available for future spring/animation use (Phase 2 Plans 03+)
      void dt

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

    // Track textures for cleanup
    let frontTexture: THREE.CanvasTexture | null = null
    let backTexture: THREE.CanvasTexture | null = null

    // --- Async init: fonts ready → draw canvases → apply CanvasTextures ---
    let cancelled = false

    const init = async () => {
      // Pitfall 1 (RESEARCH.md): await document.fonts.ready to ensure
      // Playfair Display + Inter are loaded before canvas drawing
      await document.fonts.ready

      if (cancelled) return

      // Create off-screen canvases
      const frontCanvas = document.createElement("canvas")
      const backCanvas = document.createElement("canvas")

      // Load bird illustration — graceful fallback if missing
      const birdImg = new Image()
      birdImg.src = "/images/kingfisher.jpg"
      await new Promise<void>((resolve) => {
        birdImg.onload = () => resolve()
        birdImg.onerror = () => resolve() // drawCardFront handles missing image gracefully
      })

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

      // Dispose placeholder materials and apply canvas texture materials
      const prevFrontMat = frontMesh.material as THREE.MeshStandardMaterial
      prevFrontMat.dispose()
      frontMesh.material = new THREE.MeshStandardMaterial({
        map: frontTexture,
        side: THREE.FrontSide,
      })

      const prevBackMat = backMesh.material as THREE.MeshStandardMaterial
      prevBackMat.dispose()
      backMesh.material = new THREE.MeshStandardMaterial({
        map: backTexture,
        side: THREE.FrontSide,
      })
    }

    init().catch(console.error)

    // --- Cleanup ---
    return () => {
      cancelled = true
      cancelAnimationFrame(animFrameId)
      resizeObserver.disconnect()

      // Dispose textures
      if (frontTexture) frontTexture.dispose()
      if (backTexture) backTexture.dispose()

      // Dispose materials
      const fMat = frontMesh.material as THREE.MeshStandardMaterial
      fMat.dispose()
      const bMat = backMesh.material as THREE.MeshStandardMaterial
      bMat.dispose()

      // Dispose shared geometry
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
        background: "radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)",
      }}
    />
  )
}
