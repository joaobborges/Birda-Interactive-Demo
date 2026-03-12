# Birda Field Cards — Interactive Demo

> **What if every bird you spotted left something beautiful behind?**

A single-page interactive 3D web experience showcasing a collectible **Field Card** concept for [Birda](https://birda.org). Users join challenges, log sightings, climb leaderboards, and earn physical or digital cards as rewards — no purchases, no shortcuts. Every card is earned, and every card means something.

**[View Live Demo](https://birda.vercel.app)** · **[Built by João Borges](https://www.joaobborges.com)**

---

## The Concept

Field Cards are collectible assets tied to real birding activity. They introduce a reward mechanic designed to increase engagement and retention:

1. **Join** — Pick a challenge tied to a species, a season, or a region.
2. **Log** — Spot a bird, record it. Every verified sighting moves you up the leaderboard.
3. **Climb** — Track your rank against other players as the leaderboard updates with every submission.
4. **Earn** — Finish in the top 100 and unlock a digital Field Card. Crack the top 10 and a physical card ships to your door.

The demo features a **Common Kingfisher** (*Alcedo atthis*) Field Card that comes alive through an audio-reactive GLSL shader — the card's surface deforms and breathes to the sound of the bird's own call.

---

## What's Inside

### 3D Interactive Card
- Drag-to-rotate interaction with spring physics snap-back
- Canvas-rendered front and back faces with species data, rarity tier, and edition number
- Visible edge-strip spine for physical card depth
- Flip button to explore both sides

### Audio-Reactive Shader
- GLSL vertex displacement driven by the Kingfisher's call via Web Audio API
- FFT frequency data piped to shader uniforms every frame
- The card is static at rest — play the bird call to see it come alive

### Editorial Layer
- Product concept framing with scroll-triggered animations
- Honest pros and cons analysis of the Field Card mechanic
- Desktop-only experience with a graceful mobile redirect

---

## Tech Stack

| Technology | Role |
|---|---|
| **TypeScript** | Language |
| **Next.js 16** | App framework (App Router, Turbopack) |
| **React 19** | UI layer |
| **Three.js** | 3D rendering and WebGL |
| **GLSL ES 3.0** | Vertex shaders for audio-reactive displacement |
| **Web Audio API** | Real-time FFT analysis of bird call audio |
| **Tailwind CSS 4** | Styling |
| **Framer Motion** | Scroll-triggered animations |
| **Vercel** | Hosting and deployment |
| **Midjourney** | Kingfisher illustration |
| **Claude Code + GSD** | AI-assisted development |

---

## Project Structure

```
app/
├── layout.tsx                  # Root layout (Inter + Playfair Display fonts)
├── page.tsx                    # Main page with desktop/mobile routing
└── globals.css                 # Tailwind v4 config + brand tokens

components/concept/
├── ConceptSection.tsx          # Hero + concept explainer
├── StepFlow.tsx                # Join → Log → Climb → Earn flow
├── GalleryFrame.tsx            # 3D card container + flip button
├── CardSceneLoader.tsx         # Three.js canvas wrapper
├── UpsAndDowns.tsx             # Honest pros/cons section
├── BuiltWith.tsx               # Tools & credits
├── MobileRedirect.tsx          # Desktop-only message
└── AnimatedWrapper.tsx         # Framer Motion scroll triggers

lib/card/
├── drawCardFront.ts            # Canvas 2D card front rendering
├── drawCardBack.ts             # Canvas 2D card back rendering
├── shaderSources.ts            # GLSL vertex/fragment shaders
├── audioManager.ts             # Web Audio API integration
├── springPhysics.ts            # Critically damped spring animation
└── uniformBridge.ts            # FFT → shader uniform pipeline
```

---

## Running Locally

```bash
cd "Birda Interactive Demo"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a desktop browser.

---

## Key Design Decisions

| Decision | Why |
|---|---|
| Raw Three.js over React Three Fiber | Full control over the shader pipeline and WebGL-level detail |
| Illustration over photograph | Cleaner luminance edges for shader displacement + field guide aesthetic |
| Desktop-only | 3D drag interaction is best experienced with a pointer device |
| Canvas 2D for card faces | Pure drawing functions with no Three.js dependency — testable and DPR-aware |
| Spring physics from scratch | Full control over stiffness and damping feel (~0.7s critically damped settle) |
| No idle animation | Card is static at rest for clean contrast when audio activates |
| Honest "downs" section | Genuine product analysis builds trust and shows product thinking |

---

## License

This project is a concept demo and portfolio piece. The Birda brand, logo, and name belong to [Birda](https://birda.org).

Built by [João Borges](https://www.joaobborges.com)
