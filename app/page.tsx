import { ConceptSection } from "@/components/concept/ConceptSection"
import { GalleryFrame } from "@/components/concept/GalleryFrame"
import { MobileRedirect } from "@/components/concept/MobileRedirect"

export default function Page() {
  return (
    <main className="bg-cream">
      {/* Mobile: show branded redirect only — zero-flash CSS-only detection */}
      <div className="md:hidden">
        <MobileRedirect />
      </div>

      {/* Desktop: show full editorial + card experience */}
      <div className="hidden md:block">
        <ConceptSection />
        <GalleryFrame />
      </div>
    </main>
  )
}
