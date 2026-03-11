import { AnimatedWrapper } from "./AnimatedWrapper"

const tools = [
  { name: "Three.js", role: "3D rendering" },
  { name: "Vercel", role: "Hosting and deployment" },
  { name: "GitHub", role: "Version control" },
  { name: "Midjourney", role: "Bird illustration" },
  { name: "Claude Code + GSD", role: "AI-assisted development" },
  { name: "Antigravity", role: "Code editor" },
  { name: "OpenCode", role: "Code editor (Claude lockout fallback) · GPT-5.3 Codex" },
]

export function BuiltWith() {
  return (
    <section className="bg-cream px-6 py-32">
      <div className="max-w-2xl mx-auto">

        <AnimatedWrapper className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-near-black">
            Built With
          </h2>
        </AnimatedWrapper>

        <AnimatedWrapper delay={0.1}>
          <ul className="flex flex-col gap-4">
            {tools.map((tool, i) => (
              <li key={i} className="font-sans text-base text-near-black/80 leading-relaxed">
                <span className="font-semibold text-near-black">{tool.name}</span>
                {" — "}
                {tool.role}
              </li>
            ))}
          </ul>
        </AnimatedWrapper>

      </div>
    </section>
  )
}
