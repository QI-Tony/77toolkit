<script setup>
/**
 * ColorPickerPanel — 交互式取色工具
 * 模式一：单点取色 — 点击图片像素，读取颜色组成
 * 模式二：框选取色 — 拖拽选区，对该区域运行 K-Means 分析
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ColorCard from './ColorCard.vue'
import FamilyChart from './FamilyChart.vue'
import {
  rgbToHex,
  rgbToHsl,
  formatRgbString,
  formatHslString,
  isLightColor
} from '../utils/colorConverter.js'
import {
  getColorFamilyKey,
  getColorFamilyName,
  getColorFamilyNameEn,
  generateColorDescription,
  generateColorDescriptionEn
} from '../utils/colorFamily.js'
import { extractColors } from '../utils/colorExtractor.js'
import { useLocale } from '../composables/useLocale.js'

const props = defineProps({
  imageElement: { type: Object, required: true }  // 已加载完成的 HTMLImageElement
})

const { locale, t } = useLocale()

// ── 模式 ────────────────────────────────────────────────────────
const mode = ref('point')   // 'point' | 'area'

// ── DOM Refs ──────────────────────────────────────────────────
const imgRef = ref(null)
const overlayRef = ref(null)

// ── 悬停状态 ───────────────────────────────────────────────────
const hoverPos = ref(null)    // { dispX, dispY }
const hoverColor = ref(null)  // [r, g, b] | null

// ── 单点结果 ───────────────────────────────────────────────────
const pointResult = ref(null)
const copiedKey = ref('')

// ── 框选状态 ───────────────────────────────────────────────────
const isDragging = ref(false)
const dragStart = ref(null)   // { x, y } 显示坐标
const dragEnd = ref(null)     // { x, y } 显示坐标
const areaColors = ref([])
const areaFamilies = ref([])
const isAnalyzingArea = ref(false)
const areaError = ref('')
const areaSelFamily = ref(null)

// ── 选区矩形 ───────────────────────────────────────────────────
const selRect = computed(() => {
  if (!dragStart.value || !dragEnd.value) return null
  return {
    x: Math.min(dragStart.value.x, dragEnd.value.x),
    y: Math.min(dragStart.value.y, dragEnd.value.y),
    w: Math.abs(dragEnd.value.x - dragStart.value.x),
    h: Math.abs(dragEnd.value.y - dragStart.value.y)
  }
})

// ── 惰性像素 Canvas ────────────────────────────────────────────
let _pixCanvas = null
function getPixCanvas() {
  if (!_pixCanvas) {
    const c = document.createElement('canvas')
    c.width = props.imageElement.naturalWidth
    c.height = props.imageElement.naturalHeight
    c.getContext('2d').drawImage(props.imageElement, 0, 0)
    _pixCanvas = c
  }
  return _pixCanvas
}

// ── 坐标映射：屏幕坐标 → 图像像素坐标 ─────────────────────────
function toCoords(e) {
  const img = imgRef.value
  if (!img) return { dispX: 0, dispY: 0, imgX: 0, imgY: 0 }
  const rect = img.getBoundingClientRect()
  const dispX = Math.max(0, Math.min(rect.width,  e.clientX - rect.left))
  const dispY = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
  return {
    dispX,
    dispY,
    imgX: Math.floor((dispX / rect.width)  * img.naturalWidth),
    imgY: Math.floor((dispY / rect.height) * img.naturalHeight)
  }
}

// ── 读取单像素 ─────────────────────────────────────────────────
function readPixel(ix, iy) {
  const pc = getPixCanvas()
  const x = Math.max(0, Math.min(pc.width  - 1, ix))
  const y = Math.max(0, Math.min(pc.height - 1, iy))
  const d = pc.getContext('2d').getImageData(x, y, 1, 1).data
  return d[3] > 64 ? [d[0], d[1], d[2]] : null
}

// ── 覆盖 Canvas 绘制 ────────────────────────────────────────────
function drawOverlay() {
  const canvas = overlayRef.value
  if (!canvas || canvas.width === 0) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // ── 框选模式：绘制选区 ──────────────────────────────────────
  if (mode.value === 'area') {
    const sel = selRect.value
    if (sel && sel.w > 3 && sel.h > 3) {
      const { x, y, w, h } = sel

      // 选区外暗化
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.clearRect(x, y, w, h)

      // 虚线边框
      ctx.save()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 3])
      ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5)
      ctx.restore()

      // 紫色外框
      ctx.strokeStyle = 'rgba(99,102,241,0.9)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([])
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2)

      // 角点圆点
      ctx.fillStyle = '#fff'
      for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // 尺寸标签
      const img = imgRef.value
      const ir = img.getBoundingClientRect()
      const imgW = Math.round(w * img.naturalWidth  / ir.width)
      const imgH = Math.round(h * img.naturalHeight / ir.height)
      const label = `${imgW}×${imgH}px`
      const lw = label.length * 6.5 + 10
      const lx = Math.min(x, canvas.width - lw - 2)
      const ly = y > 24 ? y - 22 : y + h + 6
      ctx.fillStyle = 'rgba(30,27,74,0.88)'
      ctx.fillRect(lx, ly, lw, 17)
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, lx + 5, ly + 8.5)
    }
  }

  // ── 点选模式：绘制十字准星 ──────────────────────────────────
  if (mode.value === 'point' && hoverPos.value) {
    const { dispX: cx, dispY: cy } = hoverPos.value
    const W = canvas.width
    const H = canvas.height

    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.65)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
    ctx.restore()

    // 中心圆圈
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke()
  }
}

// ── Canvas 尺寸同步 ────────────────────────────────────────────
function syncSize() {
  const img = imgRef.value
  const canvas = overlayRef.value
  if (!img || !canvas) return
  const r = img.getBoundingClientRect()
  if (r.width > 0 && r.height > 0) {
    canvas.width  = r.width
    canvas.height = r.height
    drawOverlay()
  }
}

const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null

// ── 鼠标事件 ──────────────────────────────────────────────────
function onMove(e) {
  const c = toCoords(e)
  hoverPos.value = { dispX: c.dispX, dispY: c.dispY }
  if (mode.value === 'point') hoverColor.value = readPixel(c.imgX, c.imgY)
  if (isDragging.value) dragEnd.value = { x: c.dispX, y: c.dispY }
  drawOverlay()
}

function onLeave() {
  hoverPos.value = null
  hoverColor.value = null
  if (!isDragging.value) drawOverlay()
}

function onDown(e) {
  e.preventDefault()
  if (mode.value !== 'area') return
  const c = toCoords(e)
  isDragging.value = true
  dragStart.value = { x: c.dispX, y: c.dispY }
  dragEnd.value   = { x: c.dispX, y: c.dispY }
  areaColors.value = []
  areaFamilies.value = []
  areaError.value = ''
  areaSelFamily.value = null
}

function onUp() {
  if (!isDragging.value) return
  isDragging.value = false
  const sel = selRect.value
  if (sel && sel.w > 8 && sel.h > 8) {
    doAreaAnalysis(sel)
  } else {
    dragStart.value = null
    dragEnd.value   = null
    drawOverlay()
  }
}

function onClick(e) {
  if (mode.value !== 'point') return
  const c = toCoords(e)
  const px = readPixel(c.imgX, c.imgY)
  if (!px) return

  const [r, g, b] = px
  const [h, s, l] = rgbToHsl(r, g, b)
  const hex       = rgbToHex(r, g, b)
  const familyKey = getColorFamilyKey(r, g, b)

  pointResult.value = {
    rgb: { r, g, b },
    hex,
    hsl: { h, s, l },
    rgbString:  formatRgbString(r, g, b),
    hslString:  formatHslString(h, s, l),
    familyKey,
    familyName: getColorFamilyName(familyKey),
    familyNameEn: getColorFamilyNameEn(familyKey),
    description: generateColorDescription(r, g, b),
    descriptionEn: generateColorDescriptionEn(r, g, b),
    isLight:    isLightColor(r, g, b)
  }
}

// ── 框选分析 ───────────────────────────────────────────────────
async function doAreaAnalysis(sel) {
  const img = imgRef.value
  const ir  = img.getBoundingClientRect()
  const scx = img.naturalWidth  / ir.width
  const scy = img.naturalHeight / ir.height

  const ax = Math.max(0, Math.floor(sel.x * scx))
  const ay = Math.max(0, Math.floor(sel.y * scy))
  const aw = Math.max(4, Math.ceil(sel.w  * scx))
  const ah = Math.max(4, Math.ceil(sel.h  * scy))

  const pc  = getPixCanvas()
  const tmp = document.createElement('canvas')
  tmp.width  = aw
  tmp.height = ah
  tmp.getContext('2d').drawImage(pc, ax, ay, aw, ah, 0, 0, aw, ah)

  isAnalyzingArea.value = true
  try {
    const url  = tmp.toDataURL()
    const aImg = new Image()
    aImg.src   = url
    await new Promise((res, rej) => { aImg.onload = res; aImg.onerror = rej })
    const result = await extractColors(aImg, 8)
    areaColors.value   = result.colors
    areaFamilies.value = result.families
  } catch (err) {
    areaError.value = (locale.value === 'en' ? 'Analysis failed: ' : '分析失败：') + (err.message ?? (locale.value === 'en' ? 'Unknown error' : '未知错误'))
  } finally {
    isAnalyzingArea.value = false
  }
}

// ── 模式切换 / 清除 ────────────────────────────────────────────
function setMode(m) {
  mode.value = m
  clearAll()
}

function clearAll() {
  pointResult.value   = null
  areaColors.value    = []
  areaFamilies.value  = []
  dragStart.value     = null
  dragEnd.value       = null
  isDragging.value    = false
  areaError.value     = ''
  areaSelFamily.value = null
  drawOverlay()
}

// ── 复制 ───────────────────────────────────────────────────────
async function copyVal(text, key) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const el = document.createElement('textarea')
      el.value = text
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    copiedKey.value = key
    setTimeout(() => { copiedKey.value = '' }, 1600)
  } catch { /* ignore */ }
}

// ── 悬停颜色 Pip 位置计算 ──────────────────────────────────────
const pipStyle = computed(() => {
  if (!hoverPos.value || !hoverColor.value) return {}
  const { dispX, dispY } = hoverPos.value
  const canvasW = overlayRef.value?.width ?? 300
  const safeX = Math.min(dispX + 16, canvasW - 120)
  // 靠近顶部时 Pip 显示在下方
  const isNearTop = dispY < 52
  return {
    left:      safeX + 'px',
    top:       (isNearTop ? dispY + 16 : dispY) + 'px',
    transform: isNearTop ? 'none' : 'translateY(-100%)'
  }
})

// ── 生命周期 ───────────────────────────────────────────────────
onMounted(() => {
  nextTick(() => {
    syncSize()
    if (imgRef.value && ro) ro.observe(imgRef.value)
  })
})

onBeforeUnmount(() => {
  ro?.disconnect()
  _pixCanvas = null
})
</script>

<template>
  <div class="picker-wrap">

    <!-- ══ 工具栏 ══ -->
    <div class="picker-toolbar">
      <div class="tool-group" role="group">
        <button class="tool-btn" :class="{ active: mode === 'point' }" @click="setMode('point')">
          <!-- 取色笔图标 -->
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7l4 4-7.5 7.5-1 1-2-2 1-1L12 9V5.73A2 2 0 0 1 12 2z"/>
            <path d="M5 19l2-2M3 22l2-1-1-1z"/>
          </svg>
          {{ t('pointPick') }}
        </button>

        <button class="tool-btn" :class="{ active: mode === 'area' }" @click="setMode('area')">
          <!-- 框选图标 -->
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 2"/>
          </svg>
          {{ t('areaPick') }}
        </button>
      </div>

      <button
        v-if="pointResult || areaColors.length"
        class="tool-clear"
        @click="clearAll"
      >{{ t('clearResult') }}</button>
    </div>

    <!-- ══ 图片 + 覆盖 Canvas ══ -->
    <div class="img-container">
      <img
        ref="imgRef"
        :src="imageElement.src"
        class="picker-img"
        alt="取色图片"
        draggable="false"
        @load="syncSize"
      />

      <canvas
        ref="overlayRef"
        class="overlay-canvas"
        :style="{ cursor: 'crosshair' }"
        @mousemove="onMove"
        @mouseleave="onLeave"
        @mousedown.prevent="onDown"
        @mouseup="onUp"
        @click="onClick"
      />

      <!-- 悬停颜色预览 Pip（仅点选模式） -->
      <div
        v-if="mode === 'point' && hoverPos && hoverColor"
        class="hover-pip"
        :style="pipStyle"
      >
        <span
          class="pip-swatch"
          :style="{ background: rgbToHex(hoverColor[0], hoverColor[1], hoverColor[2]) }"
        ></span>
        <span
          class="pip-hex"
          :style="{ color: isLightColor(hoverColor[0], hoverColor[1], hoverColor[2]) ? '#1e1b4b' : '#fff' }"
        >
          {{ rgbToHex(hoverColor[0], hoverColor[1], hoverColor[2]).toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- 提示文字 -->
    <p v-if="!pointResult && !areaColors.length && !isAnalyzingArea" class="mode-hint">
      <template v-if="mode === 'point'">{{ t('modeHintPoint') }}</template>
      <template v-else>{{ t('modeHintArea') }}</template>
    </p>

    <!-- 加载中 -->
    <div v-if="isAnalyzingArea" class="mini-loading">
      <div class="mini-spinner"></div>
      <span>{{ t('analyzingArea') }}</span>
    </div>

    <!-- 错误 -->
    <p v-if="areaError" class="mini-error">{{ areaError }}</p>

    <!-- ══ 单点结果卡片 ══ -->
    <transition name="slide-up">
      <div v-if="pointResult" class="point-card">
        <div class="pc-top">

          <!-- 大色块 -->
          <div class="pc-swatch" :style="{ background: pointResult.hex }">
            <span
              class="pc-hex-label"
              :style="{ color: pointResult.isLight ? '#1e1b4b' : '#fff' }"
            >{{ pointResult.hex.toUpperCase() }}</span>
          </div>

          <!-- 颜色信息 -->
          <div class="pc-info">
            <!-- 家族标签 -->
            <span class="pc-family-badge">{{ locale === 'en' ? pointResult.familyNameEn : pointResult.familyName }}</span>

            <!-- 值列 + 复制 -->
            <div
              v-for="row in [
                { key: 'hex', label: 'HEX', val: pointResult.hex.toUpperCase() },
                { key: 'rgb', label: 'RGB', val: pointResult.rgbString },
                { key: 'hsl', label: 'HSL', val: pointResult.hslString }
              ]"
              :key="row.key"
              class="pc-row"
              role="button"
              tabindex="0"
              @click="copyVal(row.val, row.key)"
              @keydown.enter.space.prevent="copyVal(row.val, row.key)"
            >
              <span class="pc-row-label">{{ row.label }}</span>
              <span class="pc-row-val mono">{{ row.val }}</span>
              <span class="pc-row-copy" :class="{ copied: copiedKey === row.key }">
                {{ copiedKey === row.key ? '✓' : '⎘' }}
              </span>
            </div>

            <!-- RGB 分量条形图 -->
            <div class="pc-rgb-bars">
              <div
                v-for="ch in [
                  { n: 'R', v: pointResult.rgb.r, c: '#ef4444' },
                  { n: 'G', v: pointResult.rgb.g, c: '#22c55e' },
                  { n: 'B', v: pointResult.rgb.b, c: '#3b82f6' }
                ]"
                :key="ch.n"
                class="rgb-row"
              >
                <span class="rgb-label">{{ ch.n }}</span>
                <div class="rgb-track">
                  <div
                    class="rgb-fill"
                    :style="{ width: (ch.v / 255 * 100) + '%', background: ch.c }"
                  ></div>
                </div>
                <span class="rgb-num">{{ ch.v }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 描述文字 -->
        <p class="pc-desc">{{ locale === 'en' ? pointResult.descriptionEn : pointResult.description }}</p>
      </div>
    </transition>

    <!-- ══ 框选结果 ══ -->
    <template v-if="areaColors.length">
      <div class="area-title-row">
        <h3 class="area-title">选区颜色分析</h3>
        <span class="area-count-badge">{{ areaColors.length }} 种主色</span>
        <span class="area-count-badge fam-badge">{{ areaFamilies.length }} 个色系</span>
      </div>

      <div class="area-color-grid">
        <ColorCard
          v-for="c in areaColors"
          :key="c.id"
          :color="c"
        />
      </div>

      <div class="area-chart-card">
        <h4 class="area-chart-title">选区颜色谱系图</h4>
        <FamilyChart
          :families="areaFamilies"
          :selected-family="areaSelFamily"
          @select="k => { areaSelFamily = areaSelFamily === k ? null : k }"
        />
      </div>
    </template>

  </div>
</template>

<style scoped>
.picker-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 工具栏 ─────────────────────────────────────────────────── */
.picker-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  gap: 8px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.88rem;
  font-weight: 600;
  background: var(--card-bg);
  color: var(--text-muted);
  border: 2px solid var(--border);
  transition: all 0.18s;
}
.tool-btn:hover {
  border-color: var(--primary-light);
  color: var(--primary);
  background: #f0f3ff;
}
.tool-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 3px 12px rgba(99,102,241,0.35);
}

.tool-clear {
  padding: 7px 16px;
  border-radius: 50px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-muted);
  border: 1.5px solid var(--border);
  transition: all 0.15s;
}
.tool-clear:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* ── 图片容器 ────────────────────────────────────────────────── */
.img-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
  line-height: 0;
}

.picker-img {
  display: block;
  max-height: 400px;
  max-width: 100%;
  width: auto;
  height: auto;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: var(--radius);
}

/* ── 悬停颜色 Pip ─────────────────────────────────────────────── */
.hover-pip {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 15, 35, 0.82);
  backdrop-filter: blur(8px);
  border-radius: 9px;
  padding: 4px 10px 4px 5px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}
.pip-swatch {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,0.2);
}
.pip-hex {
  font-size: 0.76rem;
  font-weight: 700;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}

/* ── 提示 ───────────────────────────────────────────────────── */
.mode-hint {
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 4px 0;
}

/* ── 加载 / 错误 ─────────────────────────────────────────────── */
.mini-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  font-size: 0.88rem;
  color: var(--text-muted);
}
.mini-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #e0e7ff;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.mini-error {
  color: var(--error);
  font-size: 0.85rem;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: var(--radius-sm);
  border: 1.5px solid #fca5a5;
}

/* ── 单点结果卡片 ─────────────────────────────────────────────── */
.point-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 2px solid #e0e7ff;
}

.pc-top {
  display: flex;
}

/* 大色块 */
.pc-swatch {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 8px 12px;
  min-height: 140px;
}
.pc-hex-label {
  font-size: 0.72rem;
  font-weight: 700;
  font-family: monospace;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
  text-align: center;
}

/* 信息列 */
.pc-info {
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pc-family-badge {
  display: inline-block;
  background: #ede9fe;
  color: #7c3aed;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 20px;
  margin-bottom: 6px;
}

/* 值行 */
.pc-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 6px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.15s;
  outline: none;
}
.pc-row:hover,
.pc-row:focus-visible { background: #f0f3ff; }

.pc-row-label {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--primary);
  min-width: 27px;
  letter-spacing: 0.05em;
}
.pc-row-val {
  flex: 1;
  font-size: 0.76rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pc-row-copy {
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: color 0.15s, transform 0.15s;
  min-width: 14px;
}
.pc-row-copy.copied {
  color: var(--success);
  transform: scale(1.3);
}

/* RGB 分量条 */
.pc-rgb-bars {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.rgb-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rgb-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  min-width: 13px;
  font-family: monospace;
}
.rgb-track {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.rgb-fill {
  height: 100%;
  border-radius: 3px;
  min-width: 2px;
  opacity: 0.85;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.rgb-num {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 26px;
  text-align: right;
  font-family: monospace;
}

/* 描述 */
.pc-desc {
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.65;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border);
}

/* ── 框选结果 ─────────────────────────────────────────────────── */
.area-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.area-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}
.area-count-badge {
  background: #e0e7ff;
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
}
.fam-badge {
  background: #ede9fe;
  color: #7c3aed;
}

.area-color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(172px, 1fr));
  gap: 14px;
}

.area-chart-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 22px 22px 22px;
}
.area-chart-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 18px;
}

/* ── 过渡动画 ─────────────────────────────────────────────────── */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── 字体 ───────────────────────────────────────────────────── */
.mono {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}

/* ── 移动端适配 ───────────────────────────────────────────────── */
@media (max-width: 520px) {
  .pc-top {
    flex-direction: column;
  }
  .pc-swatch {
    width: 100%;
    min-height: 80px;
    padding-bottom: 10px;
  }
  .area-color-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .tool-btn {
    padding: 7px 14px;
    font-size: 0.82rem;
  }
}
</style>
