/**
 * drawCardBack — Canvas 2D drawing function for the back face of the Birda Field Card.
 *
 * Draws a field-guide page layout on a 500×700 logical pixel canvas (scaled by DPR):
 *   - Header: "Field Guide" heading + "Specimen Record" subheading
 *   - Data rows: labeled key-value pairs with subtle gold dividers
 *   - Bottom: decorative rule
 *
 * Visual style: forest green background (#1a3a2a), gold border + dividers (#c9a84c),
 * rounded corners via roundRect clip, linen grain overlay.
 *
 * IMPORTANT: Call only after `await document.fonts.ready` to ensure Playfair Display
 * and Inter are available in the canvas context.
 */
export async function drawCardBack(canvas: HTMLCanvasElement): Promise<void> {
  const DPR = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = 500 * DPR
  canvas.height = 700 * DPR

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.scale(DPR, DPR)

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

  // --- 3. Header area (top ~20%) ---
  // Main heading — Playfair Display, bold, warm cream
  ctx.save()
  ctx.font = "bold 24px 'Playfair Display', Georgia, serif"
  ctx.fillStyle = "#e8dcc8"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Field Guide", 250, 60)
  ctx.restore()

  // Subheading — Inter, italic, gold
  ctx.save()
  ctx.font = "italic 14px 'Inter', sans-serif"
  ctx.fillStyle = "#c9a84c"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Specimen Record", 250, 85)
  ctx.restore()

  // Gold divider at y=105
  drawDivider(ctx, 16, 484, 105, "#c9a84c", 1)

  // --- 4. Data rows (y: 120–560) ---
  const rows: Array<{ label: string; value: string; valueItalic?: boolean }> = [
    { label: "SPECIES", value: "Common Kingfisher", valueItalic: false },
    { label: "BINOMIAL", value: "Alcedo atthis", valueItalic: true },
    { label: "FAMILY", value: "Alcedinidae" },
    { label: "HABITAT", value: "Rivers, Lakes & Coastal Streams" },
    { label: "RARITY", value: "Uncommon" },
    { label: "SIGHTINGS", value: "2,847 verified" },
    { label: "FIRST SIGHTED", value: "14 March 2024 · River Lea, Hertfordshire" },
    { label: "EDITION", value: "#001 / 500" },
  ]

  const rowStartY = 128
  const rowHeight = 52
  const labelX = 40

  rows.forEach((row, i) => {
    const baseY = rowStartY + i * rowHeight

    // Label — Inter, bold, small, muted sage, uppercase
    ctx.save()
    ctx.font = "bold 10px 'Inter', sans-serif"
    ctx.fillStyle = "#8a9880"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText(row.label, labelX, baseY)
    ctx.restore()

    // Value — Inter, regular, warm cream
    ctx.save()
    if (row.valueItalic) {
      ctx.font = "italic 15px 'Inter', sans-serif"
    } else {
      ctx.font = "15px 'Inter', sans-serif"
    }
    ctx.fillStyle = "#e8dcc8"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText(row.value, labelX, baseY + 14)
    ctx.restore()

    // Subtle divider after each row (except last)
    if (i < rows.length - 1) {
      drawDivider(ctx, labelX, W - labelX, baseY + rowHeight - 2, "rgba(201,168,76,0.2)", 0.5)
    }
  })

  // --- 5. Bottom decorative rule ---
  const bottomY = 600
  ctx.save()
  // Decorative centered rule with small diamond ornament
  ctx.strokeStyle = "#c9a84c"
  ctx.lineWidth = 0.75
  ctx.globalAlpha = 0.6
  // Left line
  ctx.beginPath()
  ctx.moveTo(40, bottomY)
  ctx.lineTo(210, bottomY)
  ctx.stroke()
  // Right line
  ctx.beginPath()
  ctx.moveTo(290, bottomY)
  ctx.lineTo(460, bottomY)
  ctx.stroke()
  // Center diamond
  ctx.globalAlpha = 1.0
  ctx.fillStyle = "#c9a84c"
  ctx.save()
  ctx.translate(250, bottomY)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-4, -4, 8, 8)
  ctx.restore()
  ctx.restore()

  // --- 5.5. Birda logo mark (replaces BIRDA · FIELD COLLECTION text) ---
  await drawBirdaMark(ctx, 250, 625, 40)

  // --- 6. Linen grain overlay ---
  drawGrain(ctx)
}

/**
 * Draws the Birda bird mark (Logo2.svg) at gold color, centered at (cx, cy).
 * logoSize = rendered width in logical px (height = same, mark is square).
 */
async function drawBirdaMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  logoSize: number
): Promise<void> {
  // Logo2.svg paths use fill="white" — replace with gold for canvas rendering
  const svgSource = `<svg width="171" height="171" viewBox="0 0 171 171" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60.9 108.1C61.8 107.6 62.5 107.1 63.3 106.6C68.3 103.3 73 99.6 77.2 95.4C77.8 94.8 78.4 94.2 79 93.7C79.4 93.5 79.5 93 79.3 92.6C79.2 92.2 79.1 91.8 78.9 91.4C78.8 91.2 78.7 90.9 78.5 90.8C78.2 90.5 77.8 90.1 77.4 89.8C77.3 89.7 77.3 89.7 77.2 89.7C76.1 89.4 75.2 88.8 74.4 88C74 87.6 73.5 87.3 73 87C72.8 86.8 72.6 86.7 72.4 86.5C72.3 86.4 72.2 86.2 72.1 86.1C71.6 85.6 71 85.1 70.5 84.5C70.4 84.3 70.2 84 70.2 83.8C69.2 83.8 68.3 83.1 68.1 82.1C68 81.9 67.8 81.8 67.6 81.8C66.8 81.6 66 81.3 65.8 80.4C65.8 80.3 65.6 80.2 65.4 80.1C65.2 80 64.8 79.7 64.8 79.5C64.7 78.8 64.2 78.7 63.7 78.6C62.9 78.4 62.4 77.8 62.3 77C62.3 76.6 62 76.3 61.7 76.2C61 75.9 60.5 75.5 60.1 74.9C59.7 74.1 59.1 73.8 58.6 73.2C58.6 73.2 58.5 73.1 58.5 73C58.5 72.1 57.7 72 57.1 71.6C56.4 71.2 55.9 70.5 55.7 69.8C55.6 69.6 55.5 69.4 55.3 69.3C54.3 69 53.5 68.2 53.2 67.2C53 66.2 52.3 66 51.7 65.5C51.3 65.2 50.9 64.9 50.6 64.5C50.4 64.3 50.3 64.1 50.3 63.9C50.3 63.4 50 63 49.6 62.7C49.1 62.4 48.6 62 48.2 61.7C47.5 61.2 47.1 60.5 47.1 59.6C47.1 59.5 46.9 59.3 46.8 59.2C46.2 58.8 45.6 58.4 45 58C44.4 57.4 43.8 56.7 43.2 55.9C43.2 55.9 43.1 55.8 43.2 55.8C43.3 55 42.6 54.8 42.1 54.5C40.8 53.8 39.6 52.8 38.6 51.6C38.3 51.2 38.1 50.8 38 50.4C41.6 52.2 45.4 53.7 49.3 54.9C45 52.8 41 50.6 38.9 46.1L39.1 45.9C40 46.7 40.9 47.6 41.9 48.4C42.9 49.2 44 49.9 45.2 50.5C46.3 51.1 47.5 51.7 48.6 52.3C49.7 52.9 50.9 53.4 52 53.9C52 53.8 52.1 53.8 52.1 53.7L51.2 53.1C48.5 51.4 46.1 49.2 44.2 46.7C43.5 45.7 43.1 44.6 42.8 43.4C42.8 43.3 42.8 43.2 42.8 43.2C42.8 43.2 42.8 43.1 42.9 43C44.3 45.2 45.7 47.3 47.9 48.9C49.9 50.5 52 51.9 54.2 53.2C53.1 52.1 52 51 51 49.8C49.7 48.5 48.8 46.8 48.5 45C48.4 44.4 48.4 43.8 48.5 43.3C49 45.9 50.7 47.8 52.5 49.6C54.4 51.6 56.7 53.3 59.1 54.6C59.3 54.7 59.5 54.8 59.8 54.8C57.3 52.4 54.8 50.1 54.4 46.4L54.6 46.3C54.7 46.4 54.8 46.5 54.8 46.6C56.9 50.9 59.7 54.6 64.1 56.9C64.9 57.3 65.7 57.9 66.5 58.3C66.7 58.4 66.9 58.4 67 58.5C67.2 58.5 67.5 58.6 67.7 58.7C69.8 60.1 72 61.5 74.1 62.8C75.7 63.9 77.2 65.2 78.6 66.7C81.7 70 85 73.1 88.3 76.2C89.4 77.3 91 77.6 92.4 77C94 76.3 95.7 76.1 97.3 76.5C98 76.6 98.5 77.1 98.5 77.8C98.7 78.8 98.9 79.8 99.2 80.8C99.3 81.2 99.6 81.4 100 81.5C101 81.8 101.9 81.9 102.9 82C105.9 82 108.9 81.9 111.9 81.8C112.8 81.8 113.7 81.7 114.6 81.5C116.6 81.1 118.5 81.6 120.5 81.8C121.9 81.9 123.4 82 124.8 82C125.4 82.1 126 82.2 126.6 82.4C127.8 82.8 129 83 130.3 83.1C131.2 83.1 132.1 83.1 133 83C134.6 82.8 135.6 81.8 136.6 80.6C136.8 80.3 137 80 137.2 79.7C137.4 79.5 137.7 79.4 137.9 79.3C137.9 79.6 137.9 79.8 137.9 80.1C137.1 82 135.3 83.4 133.3 83.7C133 83.7 132.6 83.8 132.3 84C132.9 84.1 133.6 84.2 134.2 84.1C135.3 84 136.4 83.6 137.4 83.1C138.1 82.7 138.4 81.7 138.9 80.9C139.1 80.5 139.2 80 139.5 79.6C139.6 79.4 140 79.3 140.2 79.1C140.3 79.4 140.5 79.6 140.5 79.9C140.3 81.8 139 83.5 137.1 84.1C136.1 84.4 135.2 84.7 134.2 84.9C135.1 85 135.9 85.1 136.8 85.2C137.7 85.3 138.5 85.2 139.3 85.2C137.8 85.9 136.2 86.3 134.6 86.4C136.6 87.3 138.8 87.7 141 87.4C138.8 88.4 136.5 89 134.1 88.2C135.9 89.3 137.9 90.1 140 90.6C139.8 90.8 139.7 90.8 139.6 90.9L135.4 91.3C135.1 91.3 134.9 91.4 134.6 91.5C133.4 92.2 131.9 92.5 130.5 92.3C130.1 92.3 129.8 92.4 129.5 92.6C128.7 93.3 127.6 93.5 126.6 93.3C126.3 93.3 125.9 93.3 125.6 93.4C124.8 93.6 124 93.7 123.1 93.9C122.8 93.9 122.5 94 122.2 94.1C121.3 94.6 120.2 94.8 119.1 94.5C119 94.5 118.8 94.5 118.7 94.6C118.1 95.3 117.1 95.5 116.2 95.2C116.1 95.2 115.8 95.2 115.8 95.3C115.5 95.8 115 96 114.4 96C113.7 96 113 96.3 112.5 96.8C112 97.2 111.2 97.2 110.7 96.8C110.5 96.7 110.2 96.7 110 96.8C109.3 97.3 108.4 97.3 107.7 96.8C107.6 96.7 107.2 96.8 107 96.9C106.1 97.5 105 97.6 104 97.3C103.2 97.1 102.3 97 101.5 97.2C101.3 97.2 101 97.2 100.9 97C100.6 96.5 100.3 96.7 99.9 96.7C99.5 96.7 99.2 96.7 98.8 96.6C98.7 96.6 98.6 96.5 98.6 96.5C97.3 96.5 96 96.6 94.7 96.6C94.1 96.6 93.4 96.5 92.8 96.4C92 96.3 91.3 96 90.6 96C89.8 96 89 96.5 88.8 97.3C87.7 101.1 86.6 104.8 85.5 108.6C84.9 110.7 84.3 112.7 83.8 114.8C83.6 116.2 83.4 117.5 83.4 118.9C83.4 119.6 83.1 119.8 82.4 119.6C81.2 119.2 80.3 118.2 80.3 116.9C80.3 116.6 80.1 116.3 79.9 116.1C79.5 115.6 79.3 114.9 79.3 114.3C79.2 114 79.1 113.8 78.9 113.5C78.6 113 78.4 112.5 78.2 111.9C78.1 111.3 77.8 110.8 77.4 110.4C77.1 110.1 76.8 109.8 76.7 109.4C76.5 109 76.2 108.7 75.7 108.6C74.9 108.5 74.2 108.2 73.4 108.1C72.2 107.9 71.1 108 69.9 108.3C69.3 108.5 68.6 108.3 68.1 107.8C67.9 107.7 67.7 107.7 67.6 107.7C66.7 108 65.8 108.1 64.9 108.1C64.3 108 63.7 108.5 63.1 108.6C62.3 108.9 61.5 108.7 60.9 108.1Z" fill="#c9a84c"/></svg>`
  const blob = new Blob([svgSource], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)
  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        ctx.save()
        ctx.drawImage(img, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize)
        ctx.restore()
        resolve()
      }
      img.onerror = () => resolve() // graceful fallback
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Draws a horizontal divider line.
 */
function drawDivider(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  color: string,
  lineWidth: number
): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  ctx.restore()
}

/**
 * Applies a subtle linen paper grain over the entire canvas.
 */
function drawGrain(ctx: CanvasRenderingContext2D): void {
  const canvasEl = ctx.canvas
  const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25
    data[i] = Math.min(255, Math.max(0, data[i] + noise))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
  }

  ctx.putImageData(imageData, 0, 0)
}
