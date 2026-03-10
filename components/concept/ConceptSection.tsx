import { AnimatedWrapper } from "./AnimatedWrapper"
import { StepFlow } from "./StepFlow"

export function ConceptSection() {
  return (
    <section className="bg-cream min-h-screen flex flex-col items-center justify-start px-6 pt-16 pb-24">

      {/* Hero block — visible on first paint, no animation */}
      <div className="flex flex-col items-center text-center w-full max-w-3xl">
        <span className="font-serif text-sm tracking-[0.3em] uppercase text-birda-dark mb-8">
          Birda
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-near-black leading-tight">
          Every sighting becomes a story worth keeping.
        </h1>
      </div>

      {/* Concept copy — animated on scroll */}
      <AnimatedWrapper className="mt-20 max-w-2xl text-center">
        <p className="font-sans text-lg md:text-xl text-near-black/80 leading-relaxed">
          Field Cards are earned, not bought — a record of every bird you&apos;ve
          truly met. Observe ten times in the wild and a Card is yours: a
          living artifact that carries the sound, the image, and the place of
          that encounter. The rarer the bird, the more precious the prize.
        </p>
      </AnimatedWrapper>

      {/* Step flow — individually animated */}
      <div className="mt-20 w-full">
        <StepFlow />
      </div>

      {/* Scroll indicator — animated on scroll */}
      <AnimatedWrapper className="mt-20">
        <a
          href="#card-demo"
          className="font-sans text-sm text-near-black/40 flex flex-col items-center gap-2 no-underline"
        >
          <span>Scroll to explore</span>
          <span className="text-lg leading-none">↓</span>
        </a>
      </AnimatedWrapper>

    </section>
  )
}
