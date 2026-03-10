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
export function drawCardBack(canvas: HTMLCanvasElement): void {
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

  // Small text below decorative rule
  ctx.save()
  ctx.font = "10px 'Inter', sans-serif"
  ctx.fillStyle = "#4a6a5a"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("BIRDA · FIELD COLLECTION", 250, 625)
  ctx.restore()

  // --- 6. Linen grain overlay ---
  drawGrain(ctx)
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
