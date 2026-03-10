"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/**
 * CardScene — Client-only Three.js scene for the Birda Field Card prototype.
 * Renders inside GalleryFrame via next/dynamic SSR isolation.
 *
 * Scene: dark background with museum-style warm/cool lighting and a
 * placeholder card mesh (2.5:3.5 ratio, forest green) at a 10-degree resting tilt.
 *
 * Phase 2 Plan 01: establishes the 3D rendering foundation.
 * Phase 2 Plan 02+: will add card artwork texture.
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
    // Ambient fill — low intensity to keep depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)
    scene.add(ambientLight)

    // Warm key light from above-front
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.4)
    keyLight.position.set(2, 4, 3)
    scene.add(keyLight)

    // Cool fill light from left-side
    const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.3)
    fillLight.position.set(-2, 1, 2)
    scene.add(fillLight)

    // --- Placeholder card mesh ---
    // Two planes in a Group for front/back faces
    const cardGeometry = new THREE.PlaneGeometry(2.5, 3.5)
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a2a,
      side: THREE.FrontSide,
    })

    const frontMesh = new THREE.Mesh(cardGeometry, cardMaterial)
    frontMesh.position.z = 0.001

    const backMesh = new THREE.Mesh(cardGeometry, cardMaterial.clone())
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

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animFrameId)
      resizeObserver.disconnect()
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
