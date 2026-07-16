/**
 * 导出工具：JSON 报告 + 颜色卡片 PNG
 */

// ─── JSON 导出 ────────────────────────────────────────────────

/**
 * 将颜色分析结果下载为 JSON
 */
export function downloadJSON(colors, families, filename = '颜色分析报告.json') {
  const report = {
    generatedAt: new Date().toLocaleString('zh-CN'),
    summary: {
      totalColors: colors.length,
      totalFamilies: families.length
    },
    colors: colors.map((c) => ({
      hex: c.hex.toUpperCase(),
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      hsl: `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`,
      percentage: `${c.percentage}%`,
      family: c.familyName,
      description: c.description
    })),
    families: families.map((f) => ({
      name: f.name,
      percentage: `${f.totalPercentage}%`,
      colorCount: f.colors.length,
      representativeColor: f.representativeColor.hex.toUpperCase(),
      description: f.familyDescription
    }))
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  triggerDownload(blob, filename)
}

// ─── PNG 导出 ─────────────────────────────────────────────────

/**
 * 绘制圆角矩形（兼容旧版浏览器）
 */
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/**
 * 将颜色卡片导出为 PNG
 * @param {ColorInfo[]} colors
 * @param {string} filename
 */
export function downloadPalettePNG(colors, filename = '颜色调色板.png') {
  const SCALE = 2           // retina 2x
  const COLS = Math.min(colors.length, 4)
  const ROWS = Math.ceil(colors.length / COLS)
  const CARD_W = 180
  const CARD_H = 230
  const GAP = 16
  const PAD_X = 32
  const PAD_TOP = 80
  const PAD_BOTTOM = 32
  const SWATCH_RATIO = 0.52

  const canvasW = COLS * CARD_W + (COLS - 1) * GAP + PAD_X * 2
  const canvasH = ROWS * CARD_H + (ROWS - 1) * GAP + PAD_TOP + PAD_BOTTOM

  const canvas = document.createElement('canvas')
  canvas.width = canvasW * SCALE
  canvas.height = canvasH * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)

  // 背景渐变
  const bg = ctx.createLinearGradient(0, 0, canvasW, canvasH)
  bg.addColorStop(0, '#f7f8fa')
  bg.addColorStop(1, '#f1f4f7')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvasW, canvasH)

  // 标题
  ctx.fillStyle = '#18202a'
  ctx.font = `bold ${22}px "PingFang SC","Microsoft YaHei",sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🎨 颜色调色板', canvasW / 2, 32)

  ctx.fillStyle = '#64748b'
  ctx.font = `${13}px "PingFang SC","Microsoft YaHei",sans-serif`
  ctx.fillText(`共 ${colors.length} 种主色`, canvasW / 2, 56)

  // 绘制每张色卡
  colors.forEach((color, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = PAD_X + col * (CARD_W + GAP)
    const y = PAD_TOP + row * (CARD_H + GAP)
    const swatchH = Math.round(CARD_H * SWATCH_RATIO)
    const infoH = CARD_H - swatchH

    // 卡片阴影
    ctx.save()
    ctx.shadowColor = 'rgba(21,31,44,0.12)'
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 4
    ctx.fillStyle = '#fff'
    roundRectPath(ctx, x, y, CARD_W, CARD_H, 8)
    ctx.fill()
    ctx.restore()

    // 颜色色块（裁剪为圆角顶部）
    ctx.save()
    roundRectPath(ctx, x, y, CARD_W, CARD_H, 8)
    ctx.clip()
    ctx.fillStyle = color.hex
    ctx.fillRect(x, y, CARD_W, swatchH)
    ctx.restore()

    // 分隔线
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(x, y + swatchH, CARD_W, 1)

    // 百分比徽章
    const badgeTxt = `${color.percentage}%`
    const badgeW = 48
    const badgeH = 20
    const badgeX = x + CARD_W - badgeW - 8
    const badgeY = y + swatchH - badgeH - 8
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    roundRectPath(ctx, badgeX, badgeY, badgeW, badgeH, 10)
    ctx.fill()
    ctx.fillStyle = '#18202a'
    ctx.font = `bold 11px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(badgeTxt, badgeX + badgeW / 2, badgeY + badgeH / 2)

    // 文字区域
    const textX = x + CARD_W / 2
    const textBaseY = y + swatchH

    ctx.fillStyle = '#18202a'
    ctx.font = `bold 15px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(color.hex.toUpperCase(), textX, textBaseY + infoH * 0.22)

    ctx.fillStyle = '#64748b'
    ctx.font = `11px "PingFang SC","Microsoft YaHei",monospace`
    ctx.fillText(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, textX, textBaseY + infoH * 0.46)
    ctx.fillText(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, textX, textBaseY + infoH * 0.66)

    ctx.fillStyle = '#126b63'
    ctx.font = `11px "PingFang SC","Microsoft YaHei",sans-serif`
    ctx.fillText(color.familyName, textX, textBaseY + infoH * 0.87)
  })

  canvas.toBlob(
    (blob) => {
      if (blob) triggerDownload(blob, filename)
    },
    'image/png'
  )
}

// ─── 通用下载触发 ─────────────────────────────────────────────

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
