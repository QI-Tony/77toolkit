/**
 * 颜色家族分类与描述生成
 * 基于 HSL 色相（Hue）、饱和度（Saturation）、明度（Lightness）计算
 */
import { rgbToHsl } from './colorConverter.js'

// ─── 颜色家族定义 ─────────────────────────────────────────────

export const FAMILY_LIST = [
  { key: 'red',    name: '红色系',  color: '#f44336', order: 0 },
  { key: 'orange', name: '橙色系',  color: '#ff9800', order: 1 },
  { key: 'yellow', name: '黄色系',  color: '#fdd835', order: 2 },
  { key: 'green',  name: '绿色系',  color: '#4caf50', order: 3 },
  { key: 'cyan',   name: '青色系',  color: '#00bcd4', order: 4 },
  { key: 'blue',   name: '蓝色系',  color: '#2196f3', order: 5 },
  { key: 'purple', name: '紫色系',  color: '#9c27b0', order: 6 },
  { key: 'pink',   name: '粉色系',  color: '#e91e63', order: 7 },
  { key: 'brown',  name: '棕色系',  color: '#795548', order: 8 },
  { key: 'gray',   name: '灰色系',  color: '#9e9e9e', order: 9 },
  { key: 'black',  name: '黑色系',  color: '#212121', order: 10 },
  { key: 'white',  name: '白色系',  color: '#f5f5f5', order: 11 }
]

const FAMILY_MAP = Object.fromEntries(FAMILY_LIST.map((f) => [f.key, f]))

// ─── 分类算法 ─────────────────────────────────────────────────

/**
 * 根据 RGB 判断颜色家族 key
 * 算法：先检查明度/饱和度判断黑白灰棕，再用色相区间判断彩色系
 */
export function getColorFamilyKey(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b)

  // 低饱和度 → 中性色
  if (s < 12) {
    if (l < 18) return 'black'
    if (l > 84) return 'white'
    return 'gray'
  }

  // 棕色：暖色调、低饱和度、中低明度
  if (h >= 14 && h <= 52 && s >= 12 && s < 55 && l >= 8 && l < 52) {
    return 'brown'
  }

  // 彩色系（按色相区间）
  if (h >= 350 || h < 12) return 'red'
  if (h < 45)             return 'orange'
  if (h < 65)             return 'yellow'
  if (h < 165)            return 'green'
  if (h < 200)            return 'cyan'
  if (h < 265)            return 'blue'
  if (h < 315)            return 'purple'
  return 'pink'
}

/**
 * 获取家族显示名称
 */
export function getColorFamilyName(key) {
  return FAMILY_MAP[key]?.name ?? key
}

// ─── 描述生成 ─────────────────────────────────────────────────

/**
 * 生成颜色组成描述（中文）
 */
export function generateColorDescription(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b)
  const key = getColorFamilyKey(r, g, b)
  const familyName = getColorFamilyName(key)

  const total = r + g + b || 1
  const rPct = Math.round((r / total) * 100)
  const gPct = Math.round((g / total) * 100)
  const bPct = Math.round((b / total) * 100)

  const parts = [`该颜色属于${familyName}`]

  // 特殊中性色
  if (key === 'black') {
    parts.push('明度极低，深沉近黑')
    return parts.join('，') + '。'
  }
  if (key === 'white') {
    parts.push('明度极高，纯净近白')
    return parts.join('，') + '。'
  }
  if (key === 'gray') {
    const satText = s < 5 ? '完全中性灰' : '略带彩色的灰调'
    const ligText = l < 35 ? '偏深' : l > 65 ? '偏浅' : '中间调'
    parts.push(`${satText}（${ligText}灰）`)
    return parts.join('，') + '。'
  }

  // RGB 占比分解
  const sorted = [
    { name: '红', v: r, pct: rPct },
    { name: '绿', v: g, pct: gPct },
    { name: '蓝', v: b, pct: bPct }
  ].sort((a, c) => c.v - a.v)

  parts.push(
    `由约 ${sorted[0].pct}% ${sorted[0].name}色、${sorted[1].pct}% ${sorted[1].name}色、${sorted[2].pct}% ${sorted[2].name}色构成`
  )

  // 饱和度描述
  if (s < 25) parts.push('饱和度低，色彩柔和')
  else if (s > 80) parts.push('饱和度高，色彩鲜艳')

  // 冷暖描述
  const warmth = r - b
  if (warmth > 60) parts.push('整体色调偏暖')
  else if (warmth < -60) parts.push('整体色调偏冷')

  // 明度描述
  if (l > 75) parts.push('明度较高，色彩明亮')
  else if (l < 28) parts.push('明度较低，色彩深沉')

  return parts.join('，') + '。'
}

// ─── 家族聚合 ─────────────────────────────────────────────────

/**
 * 按家族分组颜色，生成家族摘要
 * @param {ColorInfo[]} colors
 * @returns {FamilyInfo[]} 按占比从高到低排序
 */
export function groupColorsByFamily(colors) {
  const map = {}

  for (const color of colors) {
    const key = color.familyKey
    if (!map[key]) {
      map[key] = { key, name: getColorFamilyName(key), colors: [], totalPercentage: 0 }
    }
    map[key].colors.push(color)
    map[key].totalPercentage += color.percentage
  }

  return Object.values(map)
    .map((fam) => {
      fam.colors.sort((a, b) => b.percentage - a.percentage)
      fam.totalPercentage = parseFloat(fam.totalPercentage.toFixed(1))
      fam.representativeColor = fam.colors[0]
      fam.familyDescription = buildFamilyDescription(fam)
      fam.familyDescriptionEn = buildFamilyDescriptionEn(fam)
      return fam
    })
    .sort((a, b) => b.totalPercentage - a.totalPercentage)
}

const FAMILY_ADJECTIVE = {
  red:    '热烈而醒目',
  orange: '活力而温暖',
  yellow: '明亮而活泼',
  green:  '清新而自然',
  cyan:   '清透而宁静',
  blue:   '沉稳而深邃',
  purple: '神秘而优雅',
  pink:   '柔和而浪漫',
  brown:  '朴实而稳重',
  gray:   '低调而细腻',
  black:  '深沉而有力',
  white:  '纯净而明亮'
}

const FAMILY_ADJECTIVE_EN = {
  red:    'vibrant and eye-catching',
  orange: 'energetic and warm',
  yellow: 'bright and lively',
  green:  'fresh and natural',
  cyan:   'clear and serene',
  blue:   'calm and deep',
  purple: 'mysterious and elegant',
  pink:   'soft and romantic',
  brown:  'earthy and grounded',
  gray:   'subtle and refined',
  black:  'deep and powerful',
  white:  'pure and bright'
}

const FAMILY_NAMES_EN = {
  red: 'Reds', orange: 'Oranges', yellow: 'Yellows', green: 'Greens',
  cyan: 'Cyans', blue: 'Blues', purple: 'Purples', pink: 'Pinks',
  brown: 'Browns', gray: 'Grays', black: 'Blacks', white: 'Whites'
}

export function getColorFamilyNameEn(key) {
  return FAMILY_NAMES_EN[key] ?? key
}

function buildFamilyDescription({ key, name, colors, totalPercentage }) {
  const count = colors.length
  const adjective = FAMILY_ADJECTIVE[key] ?? '独特'
  return `${name}占图片约 ${totalPercentage.toFixed(1)}%，含 ${count} 个色块，整体${adjective}。`
}

function buildFamilyDescriptionEn({ key, colors, totalPercentage }) {
  const count = colors.length
  const adjective = FAMILY_ADJECTIVE_EN[key] ?? 'distinctive'
  const eName = getColorFamilyNameEn(key)
  return `${eName} covers ~${totalPercentage.toFixed(1)}% of the image with ${count} color swatch${count !== 1 ? 'es' : ''}, ${adjective}.`
}

export function generateColorDescriptionEn(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b)
  const key = getColorFamilyKey(r, g, b)
  const fName = getColorFamilyNameEn(key)

  if (key === 'black') return `Belongs to ${fName} — very dark, close to black.`
  if (key === 'white') return `Belongs to ${fName} — very light, close to white.`
  if (key === 'gray') {
    const satText = s < 5 ? 'purely neutral gray' : 'slightly tinted gray'
    const ligText = l < 35 ? 'dark' : l > 65 ? 'light' : 'mid'
    return `Belongs to ${fName}: ${satText} (${ligText} gray).`
  }

  const total = r + g + b || 1
  const rPct = Math.round((r / total) * 100)
  const gPct = Math.round((g / total) * 100)
  const bPct = Math.round((b / total) * 100)

  const sorted = [
    { name: 'red', v: r, pct: rPct },
    { name: 'green', v: g, pct: gPct },
    { name: 'blue', v: b, pct: bPct }
  ].sort((a, c) => c.v - a.v)

  const parts = [
    `Belongs to ${fName}`,
    `~${sorted[0].pct}% ${sorted[0].name}, ${sorted[1].pct}% ${sorted[1].name}, ${sorted[2].pct}% ${sorted[2].name}`
  ]

  if (s < 25) parts.push('low saturation, soft tone')
  else if (s > 80) parts.push('high saturation, vivid')

  const warmth = r - b
  if (warmth > 60) parts.push('overall warm tone')
  else if (warmth < -60) parts.push('overall cool tone')

  if (l > 75) parts.push('high lightness, bright')
  else if (l < 28) parts.push('low lightness, deep')

  return parts.join('; ') + '.'
}
