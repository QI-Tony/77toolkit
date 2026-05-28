<script setup>
/**
 * FamilyChart — 颜色谱系可视化
 * 左侧：SVG 环形图（Donut Chart）
 * 右侧：家族列表，可点击高亮/过滤
 */
import { computed, ref } from 'vue'

const props = defineProps({
  families: { type: Array, required: true },
  selectedFamily: { type: String, default: null }
})

const emit = defineEmits(['select'])

// ─── SVG 环形图计算 ───────────────────────────────────────────

const SVG = 260
const CX = SVG / 2
const CY = SVG / 2
const OUTER_R = 108
const INNER_R = 62

function polarToXY(angleDeg, r) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad)
  }
}

function arcPath(startAngle, endAngle) {
  const span = endAngle - startAngle
  // 整圆特殊处理（避免退化为一个点）
  if (span >= 359.9) {
    const m = polarToXY(startAngle, OUTER_R)
    const p = polarToXY(startAngle + 180, OUTER_R)
    const mi = polarToXY(startAngle, INNER_R)
    const pi = polarToXY(startAngle + 180, INNER_R)
    return [
      `M ${m.x} ${m.y}`,
      `A ${OUTER_R} ${OUTER_R} 0 1 1 ${p.x} ${p.y}`,
      `A ${OUTER_R} ${OUTER_R} 0 1 1 ${m.x} ${m.y}`,
      `M ${mi.x} ${mi.y}`,
      `A ${INNER_R} ${INNER_R} 0 1 0 ${pi.x} ${pi.y}`,
      `A ${INNER_R} ${INNER_R} 0 1 0 ${mi.x} ${mi.y}`,
      'Z'
    ].join(' ')
  }
  const o1 = polarToXY(startAngle, OUTER_R)
  const o2 = polarToXY(endAngle, OUTER_R)
  const i1 = polarToXY(endAngle, INNER_R)
  const i2 = polarToXY(startAngle, INNER_R)
  const large = span > 180 ? 1 : 0
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z'
  ].join(' ')
}

/** 中心标注点坐标（扇形中间，外圈外侧） */
function labelPos(startAngle, endAngle) {
  const mid = (startAngle + endAngle) / 2
  const r = OUTER_R + 18
  return polarToXY(mid, r)
}

const segments = computed(() => {
  // 归一化百分比，确保总和 = 100
  const total = props.families.reduce((s, f) => s + f.totalPercentage, 0) || 1
  let angle = 0
  return props.families.map((fam) => {
    const span = (fam.totalPercentage / total) * 360
    const start = angle
    const end = angle + span
    angle = end
    return {
      ...fam,
      path: arcPath(start, end),
      labelXY: labelPos(start, end),
      midAngle: (start + end) / 2,
      span
    }
  })
})

// ─── 交互 ─────────────────────────────────────────────────────

const hoveredKey = ref(null)

function toggleFamily(key) {
  emit('select', key)
}

// 当前高亮的家族（hover 优先，否则用 selectedFamily）
const activeKey = computed(() => hoveredKey.value ?? props.selectedFamily)

// 中心文字：显示当前高亮家族的名字和占比
const centerInfo = computed(() => {
  if (activeKey.value) {
    const fam = props.families.find((f) => f.key === activeKey.value)
    if (fam) return { name: fam.name, pct: fam.totalPercentage + '%' }
  }
  return { name: '颜色谱系', pct: props.families.length + ' 个色系' }
})
</script>

<template>
  <div class="chart-layout">
    <!-- SVG 环形图 -->
    <div class="donut-wrap">
      <svg
        :viewBox="`0 0 ${SVG} ${SVG}`"
        xmlns="http://www.w3.org/2000/svg"
        class="donut-svg"
        aria-label="颜色家族环形图"
      >
        <!-- 扇形段 -->
        <g>
          <path
            v-for="seg in segments"
            :key="seg.key"
            :d="seg.path"
            :fill="seg.representativeColor?.hex || '#ccc'"
            :opacity="activeKey && activeKey !== seg.key ? 0.45 : 1"
            :class="['seg', { 'seg--active': activeKey === seg.key }]"
            @mouseenter="hoveredKey = seg.key"
            @mouseleave="hoveredKey = null"
            @click="toggleFamily(seg.key)"
          />
        </g>

        <!-- 中心文字 -->
        <text
          :x="CX"
          :y="CY - 10"
          text-anchor="middle"
          dominant-baseline="middle"
          class="center-name"
        >{{ centerInfo.name }}</text>
        <text
          :x="CX"
          :y="CY + 14"
          text-anchor="middle"
          dominant-baseline="middle"
          class="center-pct"
        >{{ centerInfo.pct }}</text>
      </svg>
    </div>

    <!-- 家族列表 -->
    <div class="family-list">
      <button
        v-for="fam in families"
        :key="fam.key"
        class="family-item"
        :class="{ 'is-selected': selectedFamily === fam.key, 'is-dimmed': selectedFamily && selectedFamily !== fam.key }"
        @click="toggleFamily(fam.key)"
        @mouseenter="hoveredKey = fam.key"
        @mouseleave="hoveredKey = null"
      >
        <!-- 代表色圆点 -->
        <span
          class="dot"
          :style="{ background: fam.representativeColor?.hex || '#ccc' }"
        ></span>

        <!-- 名称 + 描述 -->
        <div class="family-text">
          <div class="family-header">
            <span class="family-name">{{ fam.name }}</span>
            <span class="family-pct">{{ fam.totalPercentage }}%</span>
          </div>
          <!-- 进度条 -->
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: fam.totalPercentage + '%',
                background: fam.representativeColor?.hex || '#ccc'
              }"
            ></div>
          </div>
          <p v-if="selectedFamily === fam.key || hoveredKey === fam.key" class="family-desc">
            {{ fam.familyDescription }}
          </p>
        </div>

        <!-- 色块预览列 -->
        <div class="color-dots">
          <span
            v-for="c in fam.colors.slice(0, 4)"
            :key="c.id"
            class="mini-dot"
            :style="{ background: c.hex }"
            :title="c.hex"
          ></span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chart-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 32px;
  align-items: start;
}

@media (max-width: 680px) {
  .chart-layout {
    grid-template-columns: 1fr;
  }
}

/* 环形图 */
.donut-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.donut-svg {
  width: 240px;
  height: 240px;
}

.seg {
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  transform-origin: 130px 130px;
  stroke: #fff;
  stroke-width: 2;
}

.seg--active {
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
}

.center-name {
  font-size: 14px;
  font-weight: 700;
  fill: #1e1b4b;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.center-pct {
  font-size: 12px;
  fill: #64748b;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 家族列表 */
.family-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.family-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 2px solid transparent;
  text-align: left;
  transition: background 0.18s, border-color 0.18s;
  cursor: pointer;
}

.family-item:hover {
  background: #f5f7ff;
}

.family-item.is-selected {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.family-item.is-dimmed {
  opacity: 0.5;
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.family-text {
  flex: 1;
  min-width: 0;
}

.family-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 5px;
}

.family-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
}

.family-pct {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
}

.bar-track {
  height: 5px;
  background: #e8ecf0;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  min-width: 3px;
  opacity: 0.85;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.family-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 6px;
  line-height: 1.5;
}

/* 迷你色点 */
.color-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}

.mini-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: block;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
</style>
