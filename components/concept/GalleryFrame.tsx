"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AnimatedWrapper } from "./AnimatedWrapper"
import { CardSceneLoader } from "./CardSceneLoader"

/**
 * GalleryFrame — decorative painting/gallery frame centered on cream background.
 * Serves as the visual container for the interactive Field Card prototype (Phase 2).
 * Styled after museum/gallery presentation: double-rule border, corner ornaments,
 * muted label beneath — editorial and refined.
 *
 * Phase 2 Plan 03: converted to "use client" to hold flip callback state and
 * affordance hint visibility. CardSceneLoader forwards onReady so the flip button
 * can trigger the spring-driven flip animation.
 */
export function GalleryFrame() {
  const [flipFn, setFlipFn] = useState<(() => void) | null>(null)
  const [showHint, setShowHint] = useState(true)

  // Fade out hint permanently after first drag interaction
  useEffect(() => {
    const handler = () => setShowHint(false)
    window.addEventListener("card-first-interaction", handler)
    return () => window.removeEventListener("card-first-interaction", handler)
  }, [])

  return (
    <section
      id="card-demo"
      className="bg-cream w-full flex flex-col items-center justify-center py-32 px-6"
    >
      <AnimatedWrapper className="w-full flex flex-col items-center">

        {/* Frame label above */}
        <p className="font-serif text-xs tracking-[0.25em] uppercase text-near-black/30 mb-8">
          Field Card No. 001
        </p>

        {/* Outer frame — the "painting" container */}
        <div
          className="relative w-full max-w-xl"
          style={{
            /* Outer border: thin rule in near-black/20 */
            border: "1px solid rgba(26,26,26,0.15)",
            padding: "20px",
          }}
        >

          {/* Corner ornaments using SVG L-shapes for clean corner marks */}
          {/* Top-left */}
          <svg aria-hidden="true" className="absolute top-0 left-0 text-near-black/20" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: "translate(-10px, -10px)" }}>
            <path d="M20 2 L2 2 L2 20" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          {/* Top-right */}
          <svg aria-hidden="true" className="absolute top-0 right-0 text-near-black/20" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: "translate(10px, -10px)" }}>
            <path d="M0 2 L18 2 L18 20" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          {/* Bottom-left */}
          <svg aria-hidden="true" className="absolute bottom-0 left-0 text-near-black/20" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: "translate(-10px, 10px)" }}>
            <path d="M20 18 L2 18 L2 0" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          {/* Bottom-right */}
          <svg aria-hidden="true" className="absolute bottom-0 right-0 text-near-black/20" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: "translate(10px, 10px)" }}>
            <path d="M0 18 L18 18 L18 0" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>

          {/* Inner frame — inset double-rule effect, relative for flip button positioning */}
          <div
            className="relative w-full"
            style={{
              border: "1px solid rgba(26,26,26,0.08)",
              padding: "40px 32px",
            }}
          >

            {/* Three.js card scene — explicit height required for canvas to receive dimensions */}
            <div className="w-full" style={{ height: "520px" }}>
              <CardSceneLoader
                onReady={(controls) => setFlipFn(() => controls.flip)}
              />
            </div>

            {/* Flip button — subtle affordance at bottom-right of inner frame */}
            <button
              onClick={() => flipFn?.()}
              className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-near-black/10 hover:bg-near-black/20 flex items-center justify-center transition-colors"
              aria-label="Flip card"
              title="Flip card"
            >
              {/* Two-arrow rotate icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-near-black/50">
                <path d="M2 8h12M11 5l3 3-3 3M5 11L2 8l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </div>
        </div>

        {/* Drag-to-explore affordance hint — fades out after first interaction */}
        <AnimatePresence>
          {showHint && (
            <motion.p
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.7 } }}
              className="text-center text-xs text-near-black/30 mt-4 font-sans tracking-wide"
            >
              Drag to explore
            </motion.p>
          )}
        </AnimatePresence>

        {/* Frame caption beneath */}
        <p className="font-sans text-xs text-near-black/25 mt-6 tracking-widest uppercase">
          Common Kingfisher · Birda Collection
        </p>

      </AnimatedWrapper>
    </section>
  )
}
