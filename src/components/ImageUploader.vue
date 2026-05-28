<script setup>
/**
 * ImageUploader — 图片上传区域
 * 支持拖拽、点击上传，校验类型与大小
 */
import { ref } from 'vue'
import { useLocale } from '../composables/useLocale.js'

const emit = defineEmits(['upload'])
const { locale, t } = useLocale()

const isDragging = ref(false)
const fileInputRef = ref(null)

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 20

function openFilePicker() {
  fileInputRef.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
  // 重置 input，允许重复选同一文件
  e.target.value = ''
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) processFile(file)
}

function processFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    emit('upload', null, locale.value === 'en'
      ? `Unsupported format "${file.type || 'unknown'}", please upload JPG, PNG or WEBP.`
      : `不支持的格式「${file.type || '未知'}」，请上传 JPG、PNG 或 WEBP 图片。`)
    return
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    emit('upload', null, locale.value === 'en'
      ? `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB), please upload an image under ${MAX_SIZE_MB} MB.`
      : `图片过大（${(file.size / 1024 / 1024).toFixed(1)} MB），请上传小于 ${MAX_SIZE_MB} MB 的图片。`)
    return
  }
  emit('upload', file, null)
}
</script>

<template>
  <div class="uploader-wrap">
    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging }"
      role="button"
      tabindex="0"
      aria-label="点击或拖拽图片到此处"
      @click="openFilePicker"
      @keydown.enter.space.prevent="openFilePicker"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <div class="drop-icon">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="20" fill="url(#grad)" />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stop-color="#818cf8" />
              <stop offset="100%" stop-color="#a78bfa" />
            </linearGradient>
          </defs>
          <path d="M32 18v20M24 26l8-8 8 8" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 44h28" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <p class="drop-title">{{ isDragging ? t('dragRelease') : t('dragDrop') }}</p>
      <p class="drop-hint">{{ t('uploadHint') }}</p>

      <button class="pick-btn" type="button" tabindex="-1" @click.stop="openFilePicker">
        {{ t('chooseImage') }}
      </button>
    </div>

    <input
      ref="fileInputRef"
      class="sr-only"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="onFileChange"
    />
  </div>
</template>

<style scoped>
.uploader-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 520px;
  padding: 52px 32px 44px;
  border: 2.5px dashed #c7d2fe;
  border-radius: 24px;
  background: linear-gradient(145deg, #fafbff 0%, #f0f3ff 100%);
  cursor: pointer;
  transition: border-color 0.22s, background 0.22s, transform 0.15s;
  user-select: none;
  outline: none;
}

.drop-zone:hover,
.drop-zone:focus-visible {
  border-color: var(--primary);
  background: linear-gradient(145deg, #f0f3ff 0%, #e5e8ff 100%);
}

.drop-zone.is-dragging {
  border-color: var(--secondary);
  background: linear-gradient(145deg, #ede9ff 0%, #ddd6ff 100%);
  transform: scale(1.01);
}

.drop-icon svg {
  width: 72px;
  height: 72px;
  filter: drop-shadow(0 6px 16px rgba(99,102,241,0.25));
}

.drop-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.drop-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pick-btn {
  margin-top: 4px;
  padding: 10px 28px;
  background: var(--primary);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 50px;
  transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
  box-shadow: 0 3px 12px rgba(99,102,241,0.35);
}

.pick-btn:hover {
  background: var(--primary-dark);
  box-shadow: 0 5px 18px rgba(99,102,241,0.45);
  transform: translateY(-1px);
}

.pick-btn:active {
  transform: translateY(0);
}
</style>
