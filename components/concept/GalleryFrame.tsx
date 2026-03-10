import { AnimatedWrapper } from "./AnimatedWrapper"

/**
 * GalleryFrame — decorative painting/gallery frame centered on cream background.
 * Serves as the visual container for the interactive Field Card prototype (Phase 2).
 * Styled after museum/gallery presentation: double-rule border, corner ornaments,
 * muted label beneath — editorial and refined.
 */
export function GalleryFrame() {
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

          {/* Inner frame — inset double-rule effect */}
          <div
            className="w-full"
            style={{
              border: "1px solid rgba(26,26,26,0.08)",
              padding: "40px 32px",
            }}
          >

            {/* Prototype placeholder content area */}
            <div
              className="w-full flex flex-col items-center justify-center gap-6"
              style={{ minHeight: "400px" }}
            >
              {/* Placeholder bird silhouette mark */}
              <div className="flex flex-col items-center gap-4">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-near-black/15"
                  aria-hidden="true"
                >
                  {/* Abstract bird form — minimal, editorial */}
                  <path
                    d="M8 32 C12 20, 20 16, 28 18 C32 14, 40 12, 42 16 C38 18, 34 20, 32 24 C36 24, 40 22, 42 24 C38 28, 30 28, 26 26 C22 30, 16 36, 12 38 Z"
                    fill="currentColor"
                  />
                  <circle cx="38" cy="14" r="2" fill="currentColor" />
                </svg>

                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="font-serif text-near-black/25 text-lg">
                    Interactive demo
                  </p>
                  <p className="font-sans text-near-black/20 text-sm tracking-wide">
                    The Field Card arrives in Phase 2
                  </p>
                </div>
              </div>

              {/* Decorative rule */}
              <div className="w-16 border-t border-near-black/10" />

              {/* Species name placeholder — like a museum label */}
              <p className="font-serif italic text-near-black/20 text-base">
                Alcedo atthis
              </p>
            </div>

          </div>
        </div>

        {/* Frame caption beneath */}
        <p className="font-sans text-xs text-near-black/25 mt-6 tracking-widest uppercase">
          Common Kingfisher · Birda Collection
        </p>

      </AnimatedWrapper>
    </section>
  )
}
