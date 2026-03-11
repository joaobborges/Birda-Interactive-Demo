/**
 * drawCardFront — Canvas 2D drawing function for the front face of the Birda Field Card.
 *
 * Draws three zones on a 500×700 logical pixel canvas (scaled by DPR for Retina):
 *   - Top 50% (0–350): Bird illustration
 *   - Middle 10% (350–420): Play strip with gold triangle icon (or pause bars when playing)
 *   - Bottom 40% (420–700): Species info with typography
 *
 * Visual style: forest green background (#1a3a2a), gold border + dividers (#c9a84c),
 * rounded corners via roundRect clip, linen grain overlay.
 *
 * IMPORTANT: Call only after `await document.fonts.ready` to ensure Playfair Display
 * and Inter are available in the canvas context.
 *
 * @param isPlaying - When true, draws pause bars + warm gold tint on strip;
 *                    when false (default), draws play triangle.
 */
export async function drawCardFront(
  canvas: HTMLCanvasElement,
  birdImage: HTMLImageElement | null,
  isPlaying: boolean = false,
  challengeName: string = "March Challenge 2026"
): Promise<void> {
  const DPR = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = 500 * DPR
  canvas.height = 700 * DPR

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.scale(DPR, DPR)

  // All coordinates below use logical 500×700 space
  const W = 500
  const H = 700

  // --- 1. Background with rounded corners clip ---
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, W, H, 12)
  ctx.clip()
  ctx.fillStyle = "#1a3a2a"
  ctx.fillRect(0, 0, W, H)
  ctx.restore()

  // --- 2. Gold border ---
  ctx.save()
  ctx.strokeStyle = "#c9a84c"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(8, 8, 484, 684, 8)
  ctx.stroke()
  ctx.restore()

  // --- 3. Bird illustration zone (top 50%, y: 0–350) ---
  ctx.save()
  // Clip to the illustration area (inside border padding)
  ctx.beginPath()
  ctx.rect(16, 16, 468, 318)
  ctx.clip()

  if (birdImage && birdImage.complete && birdImage.naturalWidth > 0) {
    // Cover-fit the image within the illustration zone
    const imgW = birdImage.naturalWidth
    const imgH = birdImage.naturalHeight
    const zoneW = 468
    const zoneH = 318
    const scale = Math.max(zoneW / imgW, zoneH / imgH)
    const drawW = imgW * scale
    const drawH = imgH * scale
    const offsetX = 16 + (zoneW - drawW) / 2
    // Align to top of zone so the bird's face/head is visible (not center-cropped)
    const offsetY = 16
    ctx.drawImage(birdImage, offsetX, offsetY, drawW, drawH)
  } else {
    // Placeholder when no bird image is available
    ctx.fillStyle = "#0f2318"
    ctx.fillRect(16, 16, 468, 318)
    ctx.fillStyle = "#4a6a5a"
    ctx.font = "italic 16px 'Inter', sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Kingfisher illustration", 250, 175)
  }
  ctx.restore()

  // --- 4. Gold divider below illustration (y=350) ---
  ctx.save()
  ctx.strokeStyle = "#c9a84c"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(16, 350)
  ctx.lineTo(484, 350)
  ctx.stroke()
  ctx.restore()

  // --- 5. Play strip zone (50%–60%, y: 350–420) ---
  ctx.save()
  ctx.fillStyle = "#0f2318"
  ctx.fillRect(0, 350, W, 70)

  if (isPlaying) {
    // Warm gold tint overlay during playback — subtle glow effect
    ctx.fillStyle = "rgba(245, 208, 128, 0.15)"
    ctx.fillRect(0, 350, W, 70)

    // Pause bars: two vertical gold rectangles centered at (250, 385)
    const barW = 4
    const barH = 18
    const barY = 385 - barH / 2
    const gapHalf = 5
    ctx.fillStyle = "#c9a84c"
    // Left bar
    ctx.fillRect(250 - gapHalf - barW, barY, barW, barH)
    // Right bar
    ctx.fillRect(250 + gapHalf, barY, barW, barH)
  } else {
    // Centered gold play triangle
    // Equilateral triangle with side ~16px, centered at (250, 385)
    const triX = 250
    const triY = 385
    const triSize = 9 // half the base
    ctx.fillStyle = "#c9a84c"
    ctx.beginPath()
    ctx.moveTo(triX - triSize, triY - triSize)
    ctx.lineTo(triX - triSize, triY + triSize)
    ctx.lineTo(triX + triSize * 1.5, triY)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  // --- 6. Gold divider below play strip (y=420) ---
  ctx.save()
  ctx.strokeStyle = "#c9a84c"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(16, 420)
  ctx.lineTo(484, 420)
  ctx.stroke()
  ctx.restore()

  // --- 7. Species info zone (60%–100%, y: 420–700) ---
  ctx.textAlign = "center"

  // Common name — Playfair Display, bold, warm cream
  ctx.save()
  ctx.font = "bold 26px 'Playfair Display', Georgia, serif"
  ctx.fillStyle = "#e8dcc8"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Common Kingfisher", 250, 470)
  ctx.restore()

  // Binomial name — Inter, italic, gold
  ctx.save()
  ctx.font = "italic 16px 'Inter', sans-serif"
  ctx.fillStyle = "#c9a84c"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Alcedo atthis", 250, 500)
  ctx.restore()

  // Small gold divider (short, centered)
  ctx.save()
  ctx.strokeStyle = "#c9a84c"
  ctx.lineWidth = 0.75
  ctx.beginPath()
  ctx.moveTo(220, 525)
  ctx.lineTo(280, 525)
  ctx.stroke()
  ctx.restore()

  // Challenge name — Inter, bold, gold
  ctx.save()
  ctx.font = "bold 13px 'Inter', sans-serif"
  ctx.fillStyle = "#c9a84c"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(challengeName, 250, 550)
  ctx.restore()

  // Family, Habitat, Conservation — Inter, muted sage
  ctx.save()
  ctx.font = "13px 'Inter', sans-serif"
  ctx.fillStyle = "#b8c4b0"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Alcedinidae", 250, 585)
  ctx.fillText("Rivers, Lakes & Streams", 250, 610)
  ctx.fillText("Least Concern", 250, 635)
  ctx.restore()

  // --- 8. Linen grain overlay ---
  drawGrain(ctx, W, H)
}


/**
 * Applies a subtle linen paper grain over the entire canvas.
 * Uses imageData pixel manipulation to add random noise to each RGB channel.
 */
function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  // Work in physical pixel space for grain (canvas.width/height are DPR-scaled)
  const canvasEl = ctx.canvas
  const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25
    data[i] = Math.min(255, Math.max(0, data[i] + noise))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    // Alpha (data[i+3]) unchanged
  }

  ctx.putImageData(imageData, 0, 0)

  // Suppress unused parameter warning — W and H are available if needed for partial grain
  void W
  void H
}
