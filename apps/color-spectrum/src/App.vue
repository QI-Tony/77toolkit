<script setup>
/**
 * App.vue — 色彩谱系分析仪主页面
 * 管理全局状态，协调各子组件
 */
import { ref, computed, nextTick } from 'vue'
import ImageUploader from './components/ImageUploader.vue'
import ColorCard from './components/ColorCard.vue'
import FamilyChart from './components/FamilyChart.vue'
import ColorPickerPanel from './components/ColorPickerPanel.vue'
import { extractColors } from './utils/colorExtractor.js'
import { downloadJSON, downloadPalettePNG } from './utils/exportUtils.js'
import { useLocale } from './composables/useLocale.js'

const { locale, t, familyName, toggleLocale } = useLocale()

// ─── 状态 ─────────────────────────────────────────────────────

const imageUrl = ref('')
const isAnalyzing = ref(false)
const errorMsg = ref('')
const colors = ref([])
const families = ref([])
const selectedFamilyKey = ref(null)
const sortDesc = ref(true)        // true = 占比从高到低
const loadedImg = ref(null)       // 已加载的 HTMLImageElement，供取色工具使用
const notification = ref('')
let notifyTimer = null

// ─── 计算属性 ──────────────────────────────────────────────────

const displayColors = computed(() => {
  let list = colors.value
  if (selectedFamilyKey.value) {
    list = list.filter((c) => c.familyKey === selectedFamilyKey.value)
  }
  return sortDesc.value
    ? [...list].sort((a, b) => b.percentage - a.percentage)
    : [...list]
})

const selectedFamilyObj = computed(() =>
  families.value.find((f) => f.key === selectedFamilyKey.value) ?? null
)

// ─── 图片上传与分析 ───────────────────────────────────────────

async function handleUpload(file, err) {
  if (err) {
    errorMsg.value = err
    return
  }
  if (!file) return

  // 重置旧状态
  colors.value = []
  families.value = []
  selectedFamilyKey.value = null
  errorMsg.value = ''

  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = URL.createObjectURL(file)

  isAnalyzing.value = true
  await nextTick()

  try {
    const img = new Image()
    img.src = imageUrl.value
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error(t('imgLoadFail')))
    })

    loadedImg.value = img  // 供取色工具使用
    const result = await extractColors(img, 9)
    colors.value = result.colors
    families.value = result.families
  } catch (e) {
    errorMsg.value = e.message || t('extractFail')
  } finally {
    isAnalyzing.value = false
  }
}

function resetApp() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = ''
  loadedImg.value = null
  colors.value = []
  families.value = []
  selectedFamilyKey.value = null
  errorMsg.value = ''
  isAnalyzing.value = false
}

// ─── 家族过滤 ─────────────────────────────────────────────────

function handleFamilySelect(key) {
  selectedFamilyKey.value = selectedFamilyKey.value === key ? null : key
}

// ─── 通知 Toast ───────────────────────────────────────────────

function showNotification(msg) {
  notification.value = msg
  clearTimeout(notifyTimer)
  notifyTimer = setTimeout(() => { notification.value = '' }, 2000)
}

// ─── 下载 ─────────────────────────────────────────────────────

function handleDownloadJSON() {
  downloadJSON(colors.value, families.value)
  showNotification(t('downloadedJSON'))
}

function handleDownloadPNG() {
  const sorted = [...colors.value].sort((a, b) => b.percentage - a.percentage)
  downloadPalettePNG(sorted)
  showNotification(t('downloadedPNG'))
}
</script>

<template>
  <div class="app-root">
    <!-- ═══ 顶部标题栏 ═══ -->
    <header class="app-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">77</span>
          <div>
            <h1 class="app-title">{{ t('title') }}</h1>
            <p class="app-sub">{{ t('subtitle') }}</p>
          </div>
        </div>

        <div class="header-actions">
          <a class="home-link" href="/" aria-label="Back to 77 Toolkit home">
            77 Toolkit
          </a>
          <button class="btn-lang" @click="toggleLocale" :title="locale === 'en' ? 'Switch to Chinese' : '切换为英文'">
            {{ locale === 'en' ? '中文' : 'EN' }}
          </button>
          <button
            v-if="imageUrl"
            class="btn-ghost reupload-btn"
            @click="resetApp"
          >
            {{ t('reupload') }}
          </button>
        </div>
      </div>
    </header>

    <!-- ═══ 主体 ═══ -->
    <main class="main-content">

      <!-- 错误提示 -->
      <transition name="fade">
        <div v-if="errorMsg" class="error-banner" role="alert">
          <span>⚠️ {{ errorMsg }}</span>
          <button class="dismiss-btn" @click="errorMsg = ''" aria-label="关闭">✕</button>
        </div>
      </transition>

      <!-- ── 上传区 / 预览区 ── -->
      <section v-if="!imageUrl" class="section">
        <ImageUploader @upload="handleUpload" />
      </section>

      <template v-else>
        <!-- ── 取色工具 + 图片预览 ── -->
        <section class="section">
          <h2 class="section-title">
            {{ t('colorPicker') }}
            <span class="section-subtitle">{{ t('colorPickerSub') }}</span>
          </h2>
          <ColorPickerPanel
            v-if="loadedImg"
            :image-element="loadedImg"
          />
          <!-- 图片已上传但尚未加载完成时的占位 -->
          <div v-else-if="imageUrl" class="img-loading-placeholder">
            <div class="spinner"></div>
            <p>{{ t('loadingImg') }}</p>
          </div>
        </section>

        <!-- 加载动画 -->
        <transition name="fade">
          <section v-if="isAnalyzing" class="section loading-section">
            <div class="loading-card">
              <div class="spinner"></div>
              <p class="loading-text">{{ t('analyzing') }}</p>
              <p class="loading-hint">{{ t('analyzeHint') }}</p>
            </div>
          </section>
        </transition>

        <!-- 分析结果 -->
        <template v-if="colors.length">

          <!-- ── 操作栏 ── -->
          <div class="action-bar">
            <div class="action-left">
              <button
                class="btn-chip"
                :class="{ active: sortDesc }"
                @click="sortDesc = true"
              >
                {{ t('sortByPct') }}
              </button>
              <button
                class="btn-chip"
                :class="{ active: !sortDesc }"
                @click="sortDesc = false"
              >
                {{ t('sortByOrder') }}
              </button>

              <button
                v-if="selectedFamilyKey"
                class="btn-chip filter-chip"
                @click="selectedFamilyKey = null"
              >
                {{ t('filterPrefix') }} {{ familyName(selectedFamilyKey) }} ✕
              </button>
            </div>

            <div class="action-right">
              <button class="btn-outline" @click="handleDownloadJSON">
                {{ t('downloadJSON') }}
              </button>
              <button class="btn-outline" @click="handleDownloadPNG">
                {{ t('downloadPNG') }}
              </button>
            </div>
          </div>

          <!-- ── 主色卡片区 ── -->
          <section class="section">
            <h2 class="section-title">
              {{ t('palette') }}
              <span class="section-count">{{ displayColors.length }}&nbsp;{{ locale === 'en' ? 'colors' : '色' }}</span>
            </h2>

            <div class="color-grid">
              <ColorCard
                v-for="c in displayColors"
                :key="c.id"
                :color="c"
                @copy="showNotification(t('copiedPrefix') + $event)"
              />
            </div>

            <p v-if="displayColors.length === 0" class="empty-hint">
              {{ t('noColors') }}
            </p>
          </section>

          <!-- ── 颜色谱系图 ── -->
          <section class="section">
            <h2 class="section-title">{{ t('familyChart') }}</h2>
            <div class="chart-card">
              <FamilyChart
                :families="families"
                :selected-family="selectedFamilyKey"
                @select="handleFamilySelect"
              />
            </div>
            <p class="chart-hint">{{ t('chartHint') }}</p>
          </section>

          <!-- ── 详细分析区 ── -->
          <section class="section">
            <h2 class="section-title">{{ t('familyAnalysis') }}</h2>
            <div class="analysis-grid">
              <div
                v-for="fam in families"
                :key="fam.key"
                class="analysis-card"
                :class="{ 'is-highlighted': selectedFamilyKey === fam.key }"
                @click="handleFamilySelect(fam.key)"
              >
                <!-- 代表色条 -->
                <div
                  class="analysis-bar"
                  :style="{ background: fam.representativeColor?.hex || '#ccc' }"
                ></div>

                <div class="analysis-body">
                  <div class="analysis-header">
                    <span class="analysis-name">{{ familyName(fam.key) }}</span>
                    <span class="analysis-pct">{{ fam.totalPercentage }}%</span>
                  </div>

                  <!-- 色块小预览 -->
                  <div class="swatch-row">
                    <span
                      v-for="c in fam.colors"
                      :key="c.id"
                      class="swatch-mini"
                      :style="{ background: c.hex, flex: c.percentage }"
                      :title="`${c.hex} (${c.percentage}%)`"
                    ></span>
                  </div>

                  <p class="analysis-desc">{{ locale === 'en' ? fam.familyDescriptionEn : fam.familyDescription }}</p>

                  <!-- 颜色明细（展开后） -->
                  <transition name="expand">
                    <div v-if="selectedFamilyKey === fam.key" class="colors-detail">
                      <div
                        v-for="c in fam.colors"
                        :key="c.id"
                        class="color-detail-row"
                      >
                        <span class="cd-swatch" :style="{ background: c.hex }"></span>
                        <span class="cd-hex mono">{{ c.hex.toUpperCase() }}</span>
                        <span class="cd-pct">{{ c.percentage }}%</span>
                        <span class="cd-desc">{{ locale === 'en' ? c.descriptionEn : c.description }}</span>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </section>

        </template>
      </template>
    </main>

    <!-- ═══ 页脚 ═══ -->
    <footer class="app-footer">
      <p>{{ t('footer') }}</p>
    </footer>

    <!-- ═══ Toast 通知 ═══ -->
    <transition name="toast">
      <div v-if="notification" class="toast" role="status">
        ✓ {{ notification }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ─── 整体布局 ─────────────────────────────────────────────── */
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ─── 顶部栏 ─────────────────────────────────────────────────── */
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(247, 248, 250, 0.92);
  border-bottom: 1px solid rgba(221, 227, 234, 0.9);
  padding: 0 16px;
  backdrop-filter: blur(14px);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 22px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
}

.app-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: 0;
}

.app-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.reupload-btn {
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 7px 18px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.18s, border-color 0.18s;
  white-space: nowrap;
}

.reupload-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-lang {
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: 5px 14px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  transition: background 0.18s, border-color 0.18s;
  background: var(--card-bg);
}
.btn-lang:hover {
  background: var(--surface-muted);
  border-color: #c6d1dc;
  color: var(--text);
}

.home-link {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--card-bg);
  color: var(--text-muted);
  font-size: 0.84rem;
  font-weight: 700;
  padding: 7px 12px;
  text-decoration: none;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
  white-space: nowrap;
}

.home-link:hover,
.home-link:focus-visible {
  background: var(--surface-muted);
  border-color: #c6d1dc;
  color: var(--text);
}

/* ─── 主内容 ─────────────────────────────────────────────────── */
.main-content {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 28px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ─── 错误提示 ──────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background: #fef2f2;
  border: 1.5px solid #fca5a5;
  border-radius: var(--radius-sm);
  color: #b91c1c;
  font-size: 0.88rem;
  font-weight: 500;
}

.dismiss-btn {
  background: none;
  color: #b91c1c;
  font-size: 0.9rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
}
.dismiss-btn:hover { background: #fee2e2; }

/* ─── section ────────────────────────────────────────────────── */
.section {
  padding: 8px 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-count {
  font-size: 0.78rem;
  font-weight: 600;
  background: #e4f3f1;
  color: var(--primary);
  padding: 2px 10px;
  border-radius: 6px;
}

.section-subtitle {
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--surface-muted);
  padding: 2px 10px;
  border-radius: 6px;
}

/* ─── 图片加载占位符 ──────────────────────────────────────────── */
.img-loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  color: var(--text-muted);
  font-size: 0.88rem;
}

/* ─── Loading ─────────────────────────────────────────────────── */
.loading-section {
  padding: 24px 0;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 44px 24px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #dce8e7;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  font-weight: 600;
  color: var(--text);
}

.loading-hint {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* ─── 操作栏 ──────────────────────────────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 0 6px;
}

.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-chip {
  padding: 6px 16px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  background: var(--card-bg);
  color: var(--text-muted);
  border: 1.5px solid var(--border);
  transition: all 0.15s;
}

.btn-chip:hover {
  border-color: var(--primary-light);
  color: var(--primary);
}

.btn-chip.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn-chip.filter-chip {
  background: #e4f3f1;
  color: var(--primary);
  border-color: #b9d8d4;
}

.btn-outline {
  padding: 7px 16px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  color: var(--primary);
  border: 1.5px solid var(--primary);
  transition: all 0.18s;
}

.btn-outline:hover {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 3px 10px rgba(99,102,241,0.3);
}

.btn-ghost {
  background: transparent;
}

/* ─── 颜色卡片网格 ────────────────────────────────────────────── */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 18px;
}

@media (max-width: 480px) {
  .color-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.empty-hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.88rem;
  padding: 32px;
}

/* ─── 谱系图卡片 ──────────────────────────────────────────────── */
.chart-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 28px 24px;
}

.chart-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 10px;
}

/* ─── 家族分析卡片 ────────────────────────────────────────────── */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.analysis-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  border: 2px solid transparent;
}

.analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.analysis-card.is-highlighted {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-md);
}

.analysis-bar {
  height: 6px;
  width: 100%;
}

.analysis-body {
  padding: 14px 16px 16px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.analysis-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text);
}

.analysis-pct {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary);
}

.swatch-row {
  display: flex;
  height: 18px;
  border-radius: 9px;
  overflow: hidden;
  gap: 2px;
  margin-bottom: 10px;
}

.swatch-mini {
  border-radius: 4px;
  min-width: 6px;
  transition: flex 0.5s;
}

.analysis-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.55;
}

/* 展开颜色明细 */
.colors-detail {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.color-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.72rem;
}

.cd-swatch {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-top: 1px;
}

.cd-hex {
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  min-width: 70px;
}

.cd-pct {
  color: var(--primary);
  font-weight: 600;
  white-space: nowrap;
  min-width: 38px;
}

.cd-desc {
  color: var(--text-muted);
  line-height: 1.45;
}

.mono {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}

/* ─── 页脚 ────────────────────────────────────────────────────── */
.app-footer {
  text-align: center;
  padding: 18px 16px;
  font-size: 0.75rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
}

/* ─── Toast ───────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #18202a;
  color: #fff;
  padding: 10px 22px;
  border-radius: 7px;
  font-size: 0.86rem;
  font-weight: 600;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
}

/* ─── 过渡动画 ────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-enter-active, .toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.expand-enter-active, .expand-leave-active {
  transition: opacity 0.25s, max-height 0.3s;
  overflow: hidden;
  max-height: 500px;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
