/**
 * MobileRedirect — Full-page branded message for mobile visitors.
 *
 * Shown via CSS (Tailwind md:hidden wrapper in app/page.tsx) on viewports < 768px.
 * Server component — no client-side JS needed, pure static markup.
 *
 * Design: cream background, centered content, Birda wordmark at top,
 * warm message inviting visitors to return on desktop. No external links
 * per locked project decision.
 */
export function MobileRedirect() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-8 text-center">

      {/* Birda wordmark */}
      <p className="font-serif text-2xl tracking-widest uppercase text-near-black mb-10">
        Birda
      </p>

      {/* Decorative short rule */}
      <div
        className="mb-10"
        style={{
          width: "40px",
          height: "1px",
          backgroundColor: "rgba(201, 168, 76, 0.6)",
        }}
      />

      {/* Primary message */}
      <h1 className="font-serif text-xl text-near-black mb-4 leading-snug max-w-xs">
        A desktop experience
      </h1>

      {/* Body text */}
      <p className="font-sans text-sm text-near-black/60 leading-relaxed max-w-xs mb-6">
        This experience is designed for desktop browsers.
      </p>

      {/* Teaser */}
      <p className="font-sans text-sm text-near-black/45 leading-relaxed max-w-xs italic">
        Visit on a larger screen to see a Kingfisher come alive with the sound of its own call.
      </p>

    </div>
  )
}
