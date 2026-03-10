"use client"

import dynamic from "next/dynamic"
import type { CardSceneProps } from "./CardScene"

/**
 * CardSceneLoader — thin client boundary for the Three.js CardScene.
 *
 * Next.js App Router requires `next/dynamic` with `ssr: false` to live inside
 * a Client Component. GalleryFrame is now also a client component (Phase 2 Plan 03)
 * so it can wire the flip callback and affordance hint state, but this loader
 * keeps the dynamic import clean.
 *
 * Phase 2 Plan 03: forwards onReady prop so GalleryFrame can wire the flip button.
 */
const CardScene = dynamic(
  () => import("./CardScene").then((m) => m.CardScene),
  { ssr: false }
)

export function CardSceneLoader(props: CardSceneProps) {
  return <CardScene {...props} />
}
