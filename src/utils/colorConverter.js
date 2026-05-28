/**
 * 颜色格式转换工具库
 */

/**
 * RGB 转 HEX（如 #ff5733）
 */
export function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  )
}

/**
 * RGB 转 HSL
 * @returns {[number, number, number]} [h(0-360), s(0-100), l(0-100)]
 */
export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

/**
 * 平方色彩距离（用于 k-means，避免开方提升性能）
 */
export function colorDistanceSq(c1, c2) {
  const dr = c1[0] - c2[0]
  const dg = c1[1] - c2[1]
  const db = c1[2] - c2[2]
  return dr * dr + dg * dg + db * db
}

/**
 * 判断颜色在深色背景下应显示浅色文字，还是在浅色背景下显示深色文字
 * @returns {boolean} true = 颜色为浅色（用深色文字）
 */
export function isLightColor(r, g, b) {
  // 相对亮度（ITU-R BT.709 标准）
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.45
}

/**
 * 格式化 RGB 字符串
 */
export function formatRgbString(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 格式化 HSL 字符串
 */
export function formatHslString(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * 将 HEX 转为大写带 # 格式
 */
export function normalizeHex(hex) {
  return hex.toUpperCase()
}
