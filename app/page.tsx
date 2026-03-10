import { ConceptSection } from "@/components/concept/ConceptSection"

export default function Page() {
  return (
    <main>
      <ConceptSection />

      {/* Gradient bridge: cream → dark */}
      <div className="h-48 bg-gradient-to-b from-cream to-[#0d0d0d]" />

      {/* Card section placeholder — Phase 2 */}
      <section id="card-demo" className="bg-[#0d0d0d] min-h-screen" />
    </main>
  )
}
