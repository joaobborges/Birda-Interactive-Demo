import { AnimatedWrapper } from "./AnimatedWrapper"

const ups = [
  "Challenges give users a reason to come back every day, not just when they feel like birding.",
  "Leaderboards tap into natural competitiveness without requiring head-to-head play.",
  "Two reward tiers let casual players feel included while giving hardcore birders something exclusive.",
  "Physical cards create a tangible connection to a digital hobby. They get kept, displayed, and talked about.",
  "Every card is tied to real effort. No purchases, no shortcuts, no faking it.",
]

const downs = [
  "Physical card production and shipping at scale could squeeze margins unless retention stays high.",
  "Players who finish just outside the top tiers may feel punished rather than motivated.",
  "The model only works in regions with enough active birders to fill a competitive leaderboard.",
  "No direct monetisation path from cards. Revenue has to come from engagement, not transactions.",
]

export function UpsAndDowns() {
  return (
    <section className="bg-cream px-6 py-32">
      <div className="max-w-3xl mx-auto">

        <AnimatedWrapper className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-near-black">
            Ups &amp; Downs
          </h2>
        </AnimatedWrapper>

        <div className="grid grid-cols-2 gap-12">

          {/* Ups */}
          <div>
            <AnimatedWrapper delay={0.1}>
              <p className="font-sans text-xs tracking-widest uppercase text-near-black/40 mb-8">
                The ups
              </p>
            </AnimatedWrapper>
            <div className="flex flex-col gap-6">
              {ups.map((item, i) => (
                <AnimatedWrapper key={i} delay={0.15 + i * 0.08}>
                  <p className="font-sans text-base text-near-black/80 leading-relaxed">
                    {item}
                  </p>
                </AnimatedWrapper>
              ))}
            </div>
          </div>

          {/* Downs */}
          <div>
            <AnimatedWrapper delay={0.1}>
              <p className="font-sans text-xs tracking-widest uppercase text-near-black/40 mb-8">
                The downs
              </p>
            </AnimatedWrapper>
            <div className="flex flex-col gap-6">
              {downs.map((item, i) => (
                <AnimatedWrapper key={i} delay={0.15 + i * 0.08}>
                  <p className="font-sans text-base text-near-black/80 leading-relaxed">
                    {item}
                  </p>
                </AnimatedWrapper>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
