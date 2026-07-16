<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CheckCircle2, Clipboard, Download, FileUp, Home, Languages, RotateCcw, Sparkles, Trash2 } from 'lucide-vue-next'
import { jsonrepair } from 'jsonrepair'

const sampleJson = `{
  name: 'JSON Fix',
  features: ['repair', 'format', 'beautify',],
  localOnly: true,
  note: "Your JSON never leaves your browser",
}`

type Locale = 'en' | 'zh'

const locale = ref<Locale>('en')
const input = ref('')
const output = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const uploadedFileName = ref('')

const inputCount = computed(() => input.value.length)
const outputCount = computed(() => output.value.length)
const canCopyOrDownload = computed(() => output.value.trim().length > 0)
const t = computed(() => translations[locale.value])

const translations = {
  en: {
    tagline: 'Repair, format, and beautify JSON locally',
    privacy: 'Your JSON never leaves your browser',
    repair: 'Repair & Format',
    upload: 'Upload File',
    sample: 'Sample JSON',
    clear: 'Clear',
    loaded: 'Loaded',
    localOnly: 'Local browser processing only',
    rawJson: 'Raw JSON',
    prettyJson: 'Pretty JSON',
    characters: 'characters',
    inputPlaceholder: 'Paste broken or unformatted JSON here...',
    outputPlaceholder: 'Formatted JSON will appear here...',
    copyTitle: 'Copy output',
    downloadTitle: 'Download pretty.json',
    switchLanguage: '中文',
    emptyInput: 'Paste JSON or upload a .json/.txt file before repairing.',
    repairSuccess: 'JSON repaired and formatted successfully.',
    repairFailed: 'Could not repair this JSON.',
    fileTypeError: 'Please upload a .json or .txt file.',
    fileReadError: 'Unable to read this file. Please try another file.',
    fileLoaded: 'Loaded',
    noCopy: 'There is no formatted JSON to copy.',
    copied: 'Formatted JSON copied to clipboard.',
    copyFailed: 'Clipboard access failed. Please copy the output manually.',
    noDownload: 'There is no formatted JSON to download.',
    downloaded: 'pretty.json downloaded.',
    sampleLoaded: 'Sample JSON loaded.'
  },
  zh: {
    tagline: '在本地修复、格式化并美化 JSON',
    privacy: '你的 JSON 不会离开浏览器',
    repair: '修复并格式化',
    upload: '上传文件',
    sample: '示例 JSON',
    clear: '清空',
    loaded: '已加载',
    localOnly: '仅在浏览器本地处理',
    rawJson: '原始 JSON',
    prettyJson: '格式化 JSON',
    characters: '字符',
    inputPlaceholder: '在这里粘贴损坏或未格式化的 JSON...',
    outputPlaceholder: '格式化后的 JSON 会显示在这里...',
    copyTitle: '复制输出',
    downloadTitle: '下载 pretty.json',
    switchLanguage: 'English',
    emptyInput: '请先粘贴 JSON，或上传 .json/.txt 文件。',
    repairSuccess: 'JSON 已成功修复并格式化。',
    repairFailed: '无法修复这段 JSON。',
    fileTypeError: '请上传 .json 或 .txt 文件。',
    fileReadError: '无法读取该文件，请尝试其他文件。',
    fileLoaded: '已加载',
    noCopy: '没有可复制的格式化 JSON。',
    copied: '格式化 JSON 已复制到剪贴板。',
    copyFailed: '剪贴板访问失败，请手动复制输出内容。',
    noDownload: '没有可下载的格式化 JSON。',
    downloaded: 'pretty.json 已下载。',
    sampleLoaded: '示例 JSON 已加载。'
  }
} satisfies Record<Locale, Record<string, string>>

watch(locale, (nextLocale) => {
  document.documentElement.lang = nextLocale === 'zh' ? 'zh-CN' : 'en'
})

function resetMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'zh' : 'en'
  resetMessages()
}

function repairAndFormat() {
  resetMessages()

  if (!input.value.trim()) {
    output.value = ''
    errorMessage.value = t.value.emptyInput
    return
  }

  try {
    const repaired = jsonrepair(input.value)
    const parsed = JSON.parse(repaired)
    output.value = JSON.stringify(parsed, null, 2)
    successMessage.value = t.value.repairSuccess
  } catch (error) {
    output.value = ''
    const reason = error instanceof Error ? error.message : 'Unknown repair error.'
    errorMessage.value = `${t.value.repairFailed} ${reason}`
  }
}

function handleFileUpload(event: Event) {
  resetMessages()
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  const isAllowedType = /\.(json|txt)$/i.test(file.name)
  if (!isAllowedType) {
    errorMessage.value = t.value.fileTypeError
    target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    input.value = String(reader.result ?? '')
    uploadedFileName.value = file.name
    output.value = ''
    successMessage.value = `${t.value.fileLoaded} ${file.name}.`
  }
  reader.onerror = () => {
    errorMessage.value = t.value.fileReadError
  }
  reader.readAsText(file)
  target.value = ''
}

async function copyOutput() {
  resetMessages()

  if (!canCopyOrDownload.value) {
    errorMessage.value = t.value.noCopy
    return
  }

  try {
    await navigator.clipboard.writeText(output.value)
    successMessage.value = t.value.copied
  } catch {
    errorMessage.value = t.value.copyFailed
  }
}

function downloadOutput() {
  resetMessages()

  if (!canCopyOrDownload.value) {
    errorMessage.value = t.value.noDownload
    return
  }

  const blob = new Blob([output.value], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pretty.json'
  link.click()
  URL.revokeObjectURL(url)
  successMessage.value = t.value.downloaded
}

function clearAll() {
  input.value = ''
  output.value = ''
  uploadedFileName.value = ''
  resetMessages()
}

function loadSample() {
  input.value = sampleJson
  output.value = ''
  uploadedFileName.value = ''
  resetMessages()
  successMessage.value = t.value.sampleLoaded
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f8fa] text-[#18202a]">
    <header class="sticky top-0 z-20 border-b border-[#dde3ea]/90 bg-[#f7f8fa]/90 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-[#126b63] text-white">
            <Sparkles class="h-5 w-5" />
          </div>
          <div>
            <h1 class="text-xl font-semibold tracking-normal text-[#18202a]">JSON Fix</h1>
            <p class="text-sm text-[#66717f]">{{ t.tagline }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <a class="btn-secondary" href="https://77toolkit.com">
            <Home class="h-4 w-4" />
            <span>77 Toolkit</span>
          </a>
          <button class="btn-secondary" type="button" @click="toggleLanguage">
            <Languages class="h-4 w-4" />
            <span>{{ t.switchLanguage }}</span>
          </button>
          <div class="flex items-center gap-2 rounded-lg border border-[#b9d8d4] bg-[#e4f3f1] px-3 py-2 text-sm text-[#0f554f]">
            <CheckCircle2 class="h-4 w-4 shrink-0" />
            <span>{{ t.privacy }}</span>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section class="grid gap-3 rounded-lg border border-[#dde3ea] bg-white p-4 shadow-[0_12px_32px_rgba(21,31,44,0.08)] lg:grid-cols-[1fr_auto] lg:items-center">
        <div class="flex flex-wrap items-center gap-3">
          <button class="btn-primary" type="button" @click="repairAndFormat">
            <Sparkles class="h-4 w-4" />
            <span>{{ t.repair }}</span>
          </button>

          <label class="btn-secondary cursor-pointer">
            <FileUp class="h-4 w-4" />
            <span>{{ t.upload }}</span>
            <input class="sr-only" type="file" accept=".json,.txt,application/json,text/plain" @change="handleFileUpload" />
          </label>

          <button class="btn-secondary" type="button" @click="loadSample">
            <RotateCcw class="h-4 w-4" />
            <span>{{ t.sample }}</span>
          </button>

          <button class="btn-danger" type="button" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            <span>{{ t.clear }}</span>
          </button>
        </div>

        <div class="text-sm text-[#66717f]">
          <span v-if="uploadedFileName">{{ t.loaded }}: {{ uploadedFileName }}</span>
          <span v-else>{{ t.localOnly }}</span>
        </div>
      </section>

      <section v-if="successMessage || errorMessage" class="space-y-3">
        <div v-if="successMessage" class="rounded-lg border border-[#b9d8d4] bg-[#e4f3f1] px-4 py-3 text-sm text-[#0f554f]">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage }}
        </div>
      </section>

      <section class="grid min-h-[580px] gap-5 lg:grid-cols-2">
        <article class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">{{ t.rawJson }}</h2>
              <p class="panel-meta">{{ inputCount.toLocaleString() }} {{ t.characters }}</p>
            </div>
          </div>
          <textarea
            v-model="input"
            class="code-area"
            spellcheck="false"
            :placeholder="t.inputPlaceholder"
            aria-label="Raw JSON input"
            @input="resetMessages"
          />
        </article>

        <article class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">{{ t.prettyJson }}</h2>
              <p class="panel-meta">{{ outputCount.toLocaleString() }} {{ t.characters }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="icon-button" type="button" :disabled="!canCopyOrDownload" :title="t.copyTitle" @click="copyOutput">
                <Clipboard class="h-4 w-4" />
              </button>
              <button class="icon-button" type="button" :disabled="!canCopyOrDownload" :title="t.downloadTitle" @click="downloadOutput">
                <Download class="h-4 w-4" />
              </button>
            </div>
          </div>
          <textarea
            v-model="output"
            class="code-area"
            spellcheck="false"
            readonly
            :placeholder="t.outputPlaceholder"
            aria-label="Formatted JSON output"
          />
        </article>
      </section>
    </main>
  </div>
</template>
