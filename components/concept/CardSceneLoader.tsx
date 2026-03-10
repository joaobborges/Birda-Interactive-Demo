"use client"

import dynamic from "next/dynamic"

/**
 * CardSceneLoader — thin client boundary for the Three.js CardScene.
 *
 * Next.js App Router requires `next/dynamic` with `ssr: false` to live inside
 * a Client Component. GalleryFrame remains a Server Component and imports this
 * client wrapper instead of using dynamic() directly.
 */
const CardScene = dynamic(
  () => import("./CardScene").then((m) => m.CardScene),
  { ssr: false }
)

export function CardSceneLoader() {
  return <CardScene />
}
