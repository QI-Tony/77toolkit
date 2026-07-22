import { ref } from 'vue'

// Global singleton — shared across all components
const locale = ref('en')

const messages = {
  en: {
    // Header
    title: 'Color Spectrum',
    subtitle: 'Upload an image to extract dominant colors and analyze color families',
    reupload: '↩ Re-upload',
    // Upload
    dragDrop: 'Drag image here, or click to upload',
    dragRelease: 'Release to upload',
    uploadHint: 'JPG · PNG · WEBP  |  Max 20 MB',
    chooseImage: 'Choose Image',
    // Sections
    colorPicker: 'Color Picker',
    colorPickerSub: 'Point Pick · Area Select',
    loadingImg: 'Loading image…',
    analyzing: 'Analyzing colors, please wait…',
    analyzeHint: 'K-Means++ dominant color extraction',
    palette: 'Color Palette',
    familyChart: 'Color Family Chart',
    chartHint: 'Click a family to filter the palette above · click again to deselect',
    familyAnalysis: 'Family Detail Analysis',
    // Action bar
    sortByPct: 'Sort by % ↓',
    sortByOrder: 'Extraction Order',
    filterPrefix: 'Filter:',
    downloadJSON: '⬇ Download JSON',
    downloadPNG: '⬇ Download Palette PNG',
    noColors: 'No colors in this family. Click the filter chip above to clear.',
    // Color picker panel
    pointPick: 'Point Pick',
    areaPick: 'Area Select',
    clearResult: '✕ Clear',
    modeHintPoint: '💡 Click anywhere on the image to read the pixel color and composition',
    modeHintArea: '💡 Click and drag on the image, release to analyze the selected area',
    analyzingArea: 'Analyzing selection…',
    // Notifications
    copiedPrefix: 'Copied: ',
    downloadedJSON: 'JSON report downloaded',
    downloadedPNG: 'Palette PNG downloaded',
    // Errors
    imgLoadFail: 'Image failed to load, please check that the file is valid.',
    extractFail: 'Color extraction failed, please try again.',
    // Footer
    footer: 'Color Spectrum · All processing runs locally in your browser, no data is uploaded',
    // Family names
    familyNames: {
      red: 'Reds', orange: 'Oranges', yellow: 'Yellows', green: 'Greens',
      cyan: 'Cyans', blue: 'Blues', purple: 'Purples', pink: 'Pinks',
      brown: 'Browns', gray: 'Grays', black: 'Blacks', white: 'Whites'
    }
  },
  zh: {
    // Header
    title: '色彩谱系',
    subtitle: '上传图片，即时提取主色、分析颜色家族',
    reupload: '↩ 重新上传',
    // Upload
    dragDrop: '拖拽图片到此处，或点击上传',
    dragRelease: '松开鼠标以上传',
    uploadHint: '支持 JPG · PNG · WEBP  |  最大 20 MB',
    chooseImage: '选择图片',
    // Sections
    colorPicker: '取色工具',
    colorPickerSub: '单点取色 · 框选分析',
    loadingImg: '正在加载图片…',
    analyzing: '正在分析图片颜色，请稍候…',
    analyzeHint: '使用 K-Means++ 算法提取主色',
    palette: '主色板',
    familyChart: '颜色谱系图',
    chartHint: '点击色系可过滤上方主色板 · 再次点击取消过滤',
    familyAnalysis: '家族详细分析',
    // Action bar
    sortByPct: '占比排序 ↓',
    sortByOrder: '提取顺序',
    filterPrefix: '筛选：',
    downloadJSON: '⬇ 下载 JSON',
    downloadPNG: '⬇ 下载调色板 PNG',
    noColors: '当前色系下无颜色，点击上方"筛选"按钮取消过滤',
    // Color picker panel
    pointPick: '单点取色',
    areaPick: '框选取色',
    clearResult: '✕ 清除结果',
    modeHintPoint: '💡 点击图片任意位置，即可提取该像素颜色及组成',
    modeHintArea: '💡 在图片上按住并拖拽，松开后分析所选区域的颜色谱系',
    analyzingArea: '正在分析选区颜色…',
    // Notifications
    copiedPrefix: '已复制：',
    downloadedJSON: 'JSON 报告已下载',
    downloadedPNG: '颜色卡片 PNG 已下载',
    // Errors
    imgLoadFail: '图片加载失败，请检查文件是否损坏。',
    extractFail: '颜色提取失败，请重试。',
    // Footer
    footer: '色彩谱系 · 所有处理在本地浏览器完成，不上传任何数据',
    // Family names
    familyNames: {
      red: '红色系', orange: '橙色系', yellow: '黄色系', green: '绿色系',
      cyan: '青色系', blue: '蓝色系', purple: '紫色系', pink: '粉色系',
      brown: '棕色系', gray: '灰色系', black: '黑色系', white: '白色系'
    }
  }
}

export function useLocale() {
  function t(key) {
    return messages[locale.value][key] ?? key
  }

  function familyName(key) {
    return messages[locale.value].familyNames[key] ?? key
  }

  function toggleLocale() {
    locale.value = locale.value === 'en' ? 'zh' : 'en'
  }

  return { locale, t, familyName, toggleLocale }
}
