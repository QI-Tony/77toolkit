const textBox = document.querySelector("#text-box");
const cleanBtn = document.querySelector("#clean-btn");
const copyBtn = document.querySelector("#copy-btn");
const clearBtn = document.querySelector("#clear-btn");
const sampleBtn = document.querySelector("#sample-btn");
const charCount = document.querySelector("#char-count");
const lineMarkers = document.querySelector("#line-markers");
const statusEl = document.querySelector("#status");
const measureCanvas = document.createElement("canvas");
const measureContext = measureCanvas.getContext("2d");

const sampleText = `# Draft copied from an AI chat

> Here is a cleaner answer:

**First paragraph:** this text has bold markers, smart spacing, and a [reference link](https://example.com).

- The first list item should become a normal line.
- The second list item should stay on a separate line.

\`\`\`text
Code block fences should disappear,
but the text inside should remain readable.
\`\`\`

Final paragraph stays separate.`;

let statusTimer = null;

function setStatus(message) {
  statusEl.textContent = message;
  window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    statusEl.textContent = "";
  }, 2400);
}

function updateCount() {
  charCount.textContent = textBox.value.length.toLocaleString();
}

function getTextBoxMetrics() {
  const style = window.getComputedStyle(textBox);
  const fontSize = Number.parseFloat(style.fontSize) || 16;
  const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.7;
  const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(style.paddingRight) || 0;
  const availableWidth = Math.max(40, textBox.clientWidth - paddingLeft - paddingRight);

  measureContext.font = style.font;

  return {
    availableWidth,
    lineHeight,
    paddingTop: style.paddingTop,
    dotTop: Math.max(3, (lineHeight - 5) / 2),
  };
}

function countWrappedRows(line, availableWidth) {
  if (!line) {
    return 1;
  }

  const chunks = line.match(/\S+\s*/g) || [line];
  let rows = 1;
  let rowWidth = 0;

  for (const chunk of chunks) {
    const chunkWidth = measureContext.measureText(chunk).width;

    if (chunkWidth <= availableWidth) {
      if (rowWidth > 0 && rowWidth + chunkWidth > availableWidth) {
        rows += 1;
        rowWidth = chunkWidth;
      } else {
        rowWidth += chunkWidth;
      }
      continue;
    }

    for (const char of chunk) {
      const charWidth = measureContext.measureText(char).width;
      if (rowWidth > 0 && rowWidth + charWidth > availableWidth) {
        rows += 1;
        rowWidth = charWidth;
      } else {
        rowWidth += charWidth;
      }
    }
  }

  return rows;
}

function updateLineMarkers() {
  const metrics = getTextBoxMetrics();
  const markerOffset = -textBox.scrollTop;
  const dots = textBox.value.split("\n").map((line) => {
    const rows = countWrappedRows(line, metrics.availableWidth);
    const dot = document.createElement("span");
    dot.className = `line-dot ${line.trim() ? "" : "is-empty"}`;
    dot.style.setProperty("--line-block-height", `${rows * metrics.lineHeight}px`);
    dot.style.setProperty("--dot-top", `${metrics.dotTop}px`);
    return dot;
  });

  lineMarkers.replaceChildren(...dots);
  lineMarkers.style.minHeight = `${textBox.clientHeight}px`;
  lineMarkers.style.paddingTop = metrics.paddingTop;
  lineMarkers.style.transform = `translateY(${markerOffset}px)`;
}

function updateEditorState() {
  updateCount();
  updateLineMarkers();
}

function removeInlineMarkup(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1");
}

function cleanText(value) {
  const lines = value
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .split("\n");

  const cleanedLines = [];
  let inFence = false;

  for (const originalLine of lines) {
    let line = originalLine.trim();

    if (/^```/.test(line) || /^~~~/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (!inFence) {
      line = line
        .replace(/^#{1,6}\s+/, "")
        .replace(/^>\s?/, "")
        .replace(/^\s*(?:[-*+]|\u2022)\s+/, "")
        .replace(/^\s*\d+[.)]\s+/, "")
        .replace(/^\s*[a-zA-Z][.)]\s+/, "");
    }

    line = removeInlineMarkup(line)
      .replace(/[ \t]+/g, " ")
      .trim();

    cleanedLines.push(line);
  }

  return cleanedLines
    .join("\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function cleanCurrentText() {
  const cleaned = cleanText(textBox.value);
  textBox.value = cleaned;
  updateEditorState();
  setStatus(cleaned ? "Formatting removed. Paragraphs use single line breaks." : "Paste text to clean.");
}

async function copyCleanText() {
  const cleaned = cleanText(textBox.value);

  if (!cleaned) {
    setStatus("There is no text to copy.");
    return;
  }

  textBox.value = cleaned;
  updateEditorState();

  try {
    await navigator.clipboard.writeText(cleaned);
    setStatus("Clean text copied.");
  } catch {
    textBox.select();
    document.execCommand("copy");
    setStatus("Clean text selected and copied.");
  }
}

textBox.addEventListener("paste", () => {
  window.setTimeout(() => {
    textBox.value = cleanText(textBox.value);
    updateEditorState();
    setStatus("Pasted text cleaned.");
  }, 0);
});

textBox.addEventListener("input", updateEditorState);
textBox.addEventListener("scroll", updateLineMarkers);
window.addEventListener("resize", updateLineMarkers);
cleanBtn.addEventListener("click", cleanCurrentText);
copyBtn.addEventListener("click", copyCleanText);

clearBtn.addEventListener("click", () => {
  textBox.value = "";
  updateEditorState();
  setStatus("Cleared.");
});

sampleBtn.addEventListener("click", () => {
  textBox.value = sampleText;
  cleanCurrentText();
});

updateEditorState();

if ("ResizeObserver" in window) {
  new ResizeObserver(updateLineMarkers).observe(textBox);
}
