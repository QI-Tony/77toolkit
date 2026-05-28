/**
 * 颜色提取核心算法
 * 使用 Canvas 采样 + K-Means++ 聚类提取主色
 */
import {
  rgbToHex,
  rgbToHsl,
  colorDistanceSq,
  formatRgbString,
  formatHslString
} from './colorConverter.js'
import {
  getColorFamilyKey,
  getColorFamilyName,
  generateColorDescription,
  groupColorsByFamily
} from './colorFamily.js'

// ─── 像素采样 ────────────────────────────────────────────────

/**
 * 将图片缩小采样，返回非透明 RGB 像素数组
 * @param {HTMLImageElement} img
 * @param {number} maxDim - 采样后最大边长（像素）
 * @returns {Array<[number,number,number]>}
 */
function samplePixels(img, maxDim = 160) {
  const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1)
  const w = Math.max(1, Math.floor(img.naturalWidth * scale))
  const h = Math.max(1, Math.floor(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)

  const { data } = ctx.getImageData(0, 0, w, h)
  const pixels = []

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a > 128) {
      pixels.push([data[i], data[i + 1], data[i + 2]])
    }
  }

  return pixels
}

// ─── K-Means++ ────────────────────────────────────────────────

/**
 * K-Means++ 初始化质心
 */
function initCentroids(pixels, k) {
  const n = pixels.length
  const centroids = []

  // 第一个质心：随机选
  centroids.push([...pixels[Math.floor(Math.random() * n)]])

  for (let ci = 1; ci < k; ci++) {
    // 计算每个像素到最近质心的距离²
    const dists = new Float32Array(n)
    let total = 0
    for (let i = 0; i < n; i++) {
      let minD = Infinity
      for (const c of centroids) {
        const d = colorDistanceSq(pixels[i], c)
        if (d < minD) minD = d
      }
      dists[i] = minD
      total += minD
    }

    // 按概率选取下一个质心
    let threshold = Math.random() * total
    let cumSum = 0
    let chosen = n - 1
    for (let i = 0; i < n; i++) {
      cumSum += dists[i]
      if (cumSum >= threshold) {
        chosen = i
        break
      }
    }
    centroids.push([...pixels[chosen]])
  }

  return centroids
}

/**
 * K-Means 聚类
 * @returns {{color:[number,number,number], count:number}[]}
 */
function kMeans(pixels, k, maxIter = 15) {
  const n = pixels.length
  k = Math.min(k, n)

  let centroids = initCentroids(pixels, k)
  const assignments = new Uint8Array(n)

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false

    // 分配步骤
    for (let i = 0; i < n; i++) {
      let minDist = Infinity
      let best = 0
      for (let j = 0; j < k; j++) {
        const d = colorDistanceSq(pixels[i], centroids[j])
        if (d < minDist) {
          minDist = d
          best = j
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best
        changed = true
      }
    }

    if (!changed) break

    // 更新步骤
    const sums = Array.from({ length: k }, () => [0, 0, 0])
    const counts = new Array(k).fill(0)

    for (let i = 0; i < n; i++) {
      const c = assignments[i]
      sums[c][0] += pixels[i][0]
      sums[c][1] += pixels[i][1]
      sums[c][2] += pixels[i][2]
      counts[c]++
    }

    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        centroids[j] = [
          Math.round(sums[j][0] / counts[j]),
          Math.round(sums[j][1] / counts[j]),
          Math.round(sums[j][2] / counts[j])
        ]
      } else {
        // 空聚类：随机重置
        centroids[j] = [...pixels[Math.floor(Math.random() * n)]]
      }
    }
  }

  // 统计各聚类像素数
  const finalCounts = new Array(k).fill(0)
  for (const a of assignments) finalCounts[a]++

  return centroids
    .map((color, i) => ({ color, count: finalCounts[i] }))
    .filter((c) => c.count > 0)
}

/**
 * 合并 RGB 空间中过于相近的聚类（避免输出重复色）
 * @param {Array} clusters
 * @param {number} threshold - RGB 欧氏距离阈值
 */
function mergeSimilar(clusters, threshold = 28) {
  const merged = clusters.map((c) => ({ ...c, color: [...c.color] }))
  let i = 0
  while (i < merged.length) {
    let j = i + 1
    while (j < merged.length) {
      const dist = Math.sqrt(colorDistanceSq(merged[i].color, merged[j].color))
      if (dist < threshold) {
        // 加权平均合并
        const total = merged[i].count + merged[j].count
        merged[i].color = [
          Math.round((merged[i].color[0] * merged[i].count + merged[j].color[0] * merged[j].count) / total),
          Math.round((merged[i].color[1] * merged[i].count + merged[j].color[1] * merged[j].count) / total),
          Math.round((merged[i].color[2] * merged[i].count + merged[j].color[2] * merged[j].count) / total)
        ]
        merged[i].count = total
        merged.splice(j, 1)
      } else {
        j++
      }
    }
    i++
  }
  return merged
}

// ─── 主入口 ──────────────────────────────────────────────────

/**
 * 从图片中提取主色列表
 * @param {HTMLImageElement} img
 * @param {number} numColors - 提取颜色数量（建议 6-10）
 * @returns {Promise<{colors: ColorInfo[], families: FamilyInfo[]}>}
 */
export async function extractColors(img, numColors = 8) {
  // 让 loading UI 先渲染
  await new Promise((resolve) => setTimeout(resolve, 30))

  const pixels = samplePixels(img, 160)
  if (pixels.length === 0) {
    throw new Error('无法从图片中提取像素，请确认图片格式正确且不全透明。')
  }

  let clusters = kMeans(pixels, numColors)
  clusters = mergeSimilar(clusters)
  clusters.sort((a, b) => b.count - a.count)

  const totalPixels = pixels.length

  const colors = clusters.map((cluster, index) => {
    const [r, g, b] = cluster.color
    const [h, s, l] = rgbToHsl(r, g, b)
    const hex = rgbToHex(r, g, b)
    const percentage = parseFloat(((cluster.count / totalPixels) * 100).toFixed(1))
    const familyKey = getColorFamilyKey(r, g, b)

    return {
      id: `color-${index}-${hex}`,
      rgb: { r, g, b },
      hex,
      hsl: { h, s, l },
      rgbString: formatRgbString(r, g, b),
      hslString: formatHslString(h, s, l),
      percentage,
      familyKey,
      familyName: getColorFamilyName(familyKey),
      description: generateColorDescription(r, g, b)
    }
  })

  const families = groupColorsByFamily(colors)

  return { colors, families }
}
