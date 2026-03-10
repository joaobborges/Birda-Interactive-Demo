import { AnimatedWrapper } from "./AnimatedWrapper"

const steps = [
  {
    num: "01",
    label: "Observe",
    description: "Spot a species in the wild — let the encounter begin.",
  },
  {
    num: "02",
    label: "Log",
    description: "Record your sighting. Every detail becomes permanent record.",
  },
  {
    num: "03",
    label: "Unlock",
    description: "Reach ten sightings and a Field Card is yours to claim.",
  },
  {
    num: "04",
    label: "Collect",
    description: "Hold a living archive of every bird you've ever found.",
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
