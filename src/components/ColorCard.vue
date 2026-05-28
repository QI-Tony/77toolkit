<script setup>
/**
 * ColorCard — 单个颜色色卡组件
 * 显示颜色预览、HEX/RGB/HSL、家族标签、占比
 * 支持复制各格式颜色值
 */
import { ref } from 'vue'
import { isLightColor } from '../utils/colorConverter.js'
import { useLocale } from '../composables/useLocale.js'

const props = defineProps({
  color: { type: Object, required: true }
})

const emit = defineEmits(['copy'])
const { locale } = useLocale()

const copiedKey = ref('')  // 哪个字段刚复制过

function isLight(c) {
  return isLightColor(c.rgb.r, c.rgb.g, c.rgb.b)
}

async function copyValue(text, key) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级方案
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    copiedKey.value = key
    emit('copy', text)
    setTimeout(() => { copiedKey.value = '' }, 1600)
  } catch {
    // 静默失败
  }
}
</script>

<template>
  <article class="card" :style="{ '--swatch': color.hex }">
    <!-- 颜色色块 -->
    <div
      class="swatch"
      :style="{ background: color.hex }"
    >
      <!-- 占比徽章 -->
      <span class="pct-badge">{{ color.percentage }}%</span>
      <!-- 家族标签 -->
      <span class="family-badge" :class="'family-' + color.familyKey">
        {{ locale === 'en' ? color.familyNameEn : color.familyName }}
      </span>
    </div>

    <!-- 颜色信息 -->
    <div class="info">
      <div class="info-row" @click="copyValue(color.hex.toUpperCase(), 'hex')">
        <span class="label">HEX</span>
        <span class="value mono">{{ color.hex.toUpperCase() }}</span>
        <span class="copy-icon" :class="{ copied: copiedKey === 'hex' }">
          {{ copiedKey === 'hex' ? '✓' : '⎘' }}
        </span>
      </div>

      <div class="info-row" @click="copyValue(color.rgbString, 'rgb')">
        <span class="label">RGB</span>
        <span class="value mono">{{ color.rgb.r }}, {{ color.rgb.g }}, {{ color.rgb.b }}</span>
        <span class="copy-icon" :class="{ copied: copiedKey === 'rgb' }">
          {{ copiedKey === 'rgb' ? '✓' : '⎘' }}
        </span>
      </div>

      <div class="info-row" @click="copyValue(color.hslString, 'hsl')">
        <span class="label">HSL</span>
        <span class="value mono">{{ color.hsl.h }}°, {{ color.hsl.s }}%, {{ color.hsl.l }}%</span>
        <span class="copy-icon" :class="{ copied: copiedKey === 'hsl' }">
          {{ copiedKey === 'hsl' ? '✓' : '⎘' }}
        </span>
      </div>
    </div>

    <!-- 占比进度条 -->
    <div class="progress-bar-wrap" :title="`占图片 ${color.percentage}%`">
      <div class="progress-bar" :style="{ width: color.percentage + '%', background: color.hex }"></div>
    </div>

    <!-- 描述 -->
    <p class="desc">{{ locale === 'en' ? color.descriptionEn : color.description }}</p>
  </article>
</template>

<style scoped>
.card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* 色块 */
.swatch {
  height: 128px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 8px 10px;
}

.pct-badge {
  background: rgba(255,255,255,0.88);
  color: #1e1b4b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.family-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(255,255,255,0.78);
  color: #1e1b4b;
  backdrop-filter: blur(4px);
}

/* 信息区 */
.info {
  padding: 10px 14px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.info-row:hover {
  background: #f0f3ff;
}

.label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--primary);
  min-width: 28px;
  letter-spacing: 0.04em;
}

.value {
  flex: 1;
  font-size: 0.78rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mono {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}

.copy-icon {
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: color 0.15s, transform 0.15s;
  min-width: 16px;
  text-align: center;
}

.copy-icon.copied {
  color: var(--success);
  transform: scale(1.3);
}

/* 进度条 */
.progress-bar-wrap {
  margin: 8px 14px 0;
  height: 4px;
  background: #e8ecf0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 2px;
  min-width: 2px;
  opacity: 0.85;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 描述文本 */
.desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.55;
  padding: 6px 14px 14px;
}
</style>
