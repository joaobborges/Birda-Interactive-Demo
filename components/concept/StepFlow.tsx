import { AnimatedWrapper } from "./AnimatedWrapper"

const steps = [
  {
    num: "01",
    label: "Join",
    description:
      "Pick a challenge and start logging sightings. Each one is tied to a species, a season, or a region.",
  },
  {
    num: "02",
    label: "Log",
    description:
      "Spot a bird, record it. Every verified sighting moves you up the leaderboard.",
  },
  {
    num: "03",
    label: "Climb",
    description:
      "Track your rank against other players. The leaderboard updates with every submission.",
  },
  {
    num: "04",
    label: "Earn",
    description:
      "Finish in the top hundred and unlock a digital Field Card in your profile. Crack the top ten and a physical card ships to your door.",
  },
]

export function StepFlow() {
  return (
    <div className="max-w-2xl mx-auto divide-y divide-near-black/10">
      {steps.map((step, i) => (
        <AnimatedWrapper key={step.num} delay={i * 0.1}>
          <div className="flex items-start gap-8 py-10">
            <span className="font-serif text-5xl font-light text-birda-light leading-none shrink-0">
              {step.num}
            </span>
            <div>
              <p className="font-sans font-semibold text-lg text-near-black">
                {step.label}
              </p>
              <p className="font-sans text-base text-near-black/70 mt-1">
                {step.description}
              </p>
            </div>
          </div>
        </AnimatedWrapper>
      ))}
    </div>
  )
}
