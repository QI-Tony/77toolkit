const textBox = document.querySelector("#text-box");
const cleanBtn = document.querySelector("#clean-btn");
const copyBtn = document.querySelector("#copy-btn");
const clearBtn = document.querySelector("#clear-btn");
const sampleBtn = document.querySelector("#sample-btn");
const charCount = document.querySelector("#char-count");
const statusEl = document.querySelector("#status");

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
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function cleanCurrentText() {
  const cleaned = cleanText(textBox.value);
  textBox.value = cleaned;
  updateCount();
  setStatus(cleaned ? "Formatting removed. Paragraph spacing is preserved." : "Paste text to clean.");
}

async function copyCleanText() {
  const cleaned = cleanText(textBox.value);

  if (!cleaned) {
    setStatus("There is no text to copy.");
    return;
  }

  textBox.value = cleaned;
  updateCount();

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
    updateCount();
    setStatus("Pasted text cleaned.");
  }, 0);
});

textBox.addEventListener("input", updateCount);
cleanBtn.addEventListener("click", cleanCurrentText);
copyBtn.addEventListener("click", copyCleanText);

clearBtn.addEventListener("click", () => {
  textBox.value = "";
  updateCount();
  setStatus("Cleared.");
});

sampleBtn.addEventListener("click", () => {
  textBox.value = sampleText;
  cleanCurrentText();
});

updateCount();
