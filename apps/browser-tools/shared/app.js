const root = document.querySelector("#tool-root");
const configNode = document.querySelector("#tool-config");
const config = configNode ? JSON.parse(configNode.textContent) : null;

const byId = (id) => document.getElementById(id);

function setStatus(message, type = "info") {
  const status = byId("tool-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.type = type;
}

async function copyText(value, success = "Copied to clipboard.") {
  try {
    await navigator.clipboard.writeText(value);
    setStatus(success, "success");
  } catch {
    setStatus("Clipboard access was blocked. Select the result and copy it manually.", "error");
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function stringifyValue(value) {
  if (typeof value === "string") return value;
  if (value === undefined) return "—";
  return JSON.stringify(value, null, 2);
}

function renderEmpty(message) {
  const cell = document.createElement("p");
  cell.className = "status-message";
  cell.textContent = message;
  return cell;
}

function renderJsonDiff() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading">
        <div><h2>JSON documents</h2><p>Paste two valid JSON values to compare their structure.</p></div>
      </div>
      <div class="input-grid">
        <label class="field"><span>Original JSON</span><textarea id="json-left" spellcheck="false" placeholder='{"status":"draft","count":2}'></textarea></label>
        <label class="field"><span>Updated JSON</span><textarea id="json-right" spellcheck="false" placeholder='{"status":"ready","count":3}'></textarea></label>
      </div>
      <div class="toolbar">
        <button class="button button-primary" id="compare-json" type="button">Compare JSON</button>
        <button class="button" id="json-sample" type="button">Load example</button>
        <button class="button" id="json-clear" type="button">Clear</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="panel-heading"><div><h2>Changes</h2><p id="diff-summary">Run a comparison to see changed paths.</p></div></div>
      <div id="json-diff-results"></div>
    </section>`;

  const missing = Symbol("missing");

  function kind(value) {
    if (value === missing) return "missing";
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value === "object" ? "object" : typeof value;
  }

  function compare(left, right, path = "$") {
    if (left === missing) return [{ type: "added", path, before: undefined, after: right }];
    if (right === missing) return [{ type: "removed", path, before: left, after: undefined }];
    const leftKind = kind(left);
    const rightKind = kind(right);
    if (leftKind !== rightKind) return [{ type: "changed", path, before: left, after: right }];
    if (leftKind === "array") {
      const changes = [];
      const length = Math.max(left.length, right.length);
      for (let index = 0; index < length; index += 1) {
        changes.push(...compare(index in left ? left[index] : missing, index in right ? right[index] : missing, `${path}[${index}]`));
      }
      return changes;
    }
    if (leftKind === "object") {
      const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
      return keys.flatMap((key) =>
        compare(
          Object.hasOwn(left, key) ? left[key] : missing,
          Object.hasOwn(right, key) ? right[key] : missing,
          `${path}.${key}`,
        ),
      );
    }
    return Object.is(left, right) ? [] : [{ type: "changed", path, before: left, after: right }];
  }

  function run() {
    try {
      const left = JSON.parse(byId("json-left").value);
      const right = JSON.parse(byId("json-right").value);
      const changes = compare(left, right);
      const results = byId("json-diff-results");
      results.replaceChildren();
      if (!changes.length) {
        results.append(renderEmpty("The documents are structurally identical."));
        byId("diff-summary").textContent = "No differences found.";
        setStatus("Comparison complete. No differences found.", "success");
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "result-table-wrap";
      const table = document.createElement("table");
      table.className = "result-table";
      table.innerHTML = "<thead><tr><th>Change</th><th>Path</th><th>Before</th><th>After</th></tr></thead>";
      const body = document.createElement("tbody");
      for (const change of changes) {
        const row = document.createElement("tr");
        row.className = `change-${change.type}`;
        const values = [change.type, change.path, stringifyValue(change.before), stringifyValue(change.after)];
        values.forEach((value, index) => {
          const cell = document.createElement("td");
          if (index > 0) {
            const code = document.createElement("code");
            code.textContent = value;
            cell.append(code);
          } else {
            cell.textContent = value;
          }
          row.append(cell);
        });
        body.append(row);
      }
      table.append(body);
      wrapper.append(table);
      results.append(wrapper);
      const counts = changes.reduce((total, item) => ({ ...total, [item.type]: (total[item.type] || 0) + 1 }), {});
      byId("diff-summary").textContent = `${changes.length} changes · ${counts.added || 0} added · ${counts.removed || 0} removed · ${counts.changed || 0} changed`;
      setStatus(`Comparison complete with ${changes.length} changes.`, "success");
    } catch (error) {
      setStatus(`JSON error: ${error.message}`, "error");
    }
  }

  byId("compare-json").addEventListener("click", run);
  byId("json-sample").addEventListener("click", () => {
    byId("json-left").value = JSON.stringify({ id: 77, status: "draft", tags: ["tools", "web"], owner: { name: "Qi" } }, null, 2);
    byId("json-right").value = JSON.stringify({ id: 77, status: "ready", tags: ["tools", "browser", "local"], owner: { name: "Qi", active: true } }, null, 2);
    run();
  });
  byId("json-clear").addEventListener("click", () => {
    byId("json-left").value = "";
    byId("json-right").value = "";
    byId("json-diff-results").replaceChildren();
    byId("diff-summary").textContent = "Run a comparison to see changed paths.";
    setStatus("");
  });
}

function renderTimestamp() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Current time</h2><p>Updated every second using your device clock.</p></div></div>
      <div class="stat-grid">
        <div class="metric"><strong id="now-seconds">—</strong><span>Unix seconds</span></div>
        <div class="metric"><strong id="now-milliseconds">—</strong><span>Unix milliseconds</span></div>
        <div class="metric" style="grid-column: span 2"><strong id="now-iso">—</strong><span>UTC / ISO 8601</span></div>
        <div class="metric" style="grid-column: span 2"><strong id="now-local">—</strong><span>Local time</span></div>
      </div>
    </section>
    <section class="tool-panel panel-divider">
      <div class="panel-heading"><div><h2>Convert a value</h2><p>Numbers are detected as seconds or milliseconds automatically.</p></div></div>
      <div class="control-grid">
        <label class="field" style="grid-column: span 2"><span>Timestamp, ISO date, or date text</span><input id="timestamp-input" type="text" placeholder="1721044800"></label>
        <label class="field" style="grid-column: span 2"><span>Local date and time</span><input id="datetime-input" type="datetime-local" step="1"></label>
      </div>
      <div class="toolbar">
        <button class="button button-primary" id="convert-timestamp" type="button">Convert value</button>
        <button class="button" id="convert-date" type="button">Convert local date</button>
        <button class="button" id="use-now" type="button">Use current time</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="output-grid">
        <label class="field"><span>Unix seconds</span><input id="result-seconds" type="text" readonly></label>
        <label class="field"><span>Unix milliseconds</span><input id="result-milliseconds" type="text" readonly></label>
        <label class="field"><span>UTC / ISO 8601</span><input id="result-iso" type="text" readonly></label>
        <label class="field"><span>Your local time</span><input id="result-local" type="text" readonly></label>
      </div>
      <div class="toolbar"><button class="button" id="copy-iso" type="button">Copy ISO time</button></div>
    </section>`;

  function updateNow() {
    const date = new Date();
    byId("now-seconds").textContent = Math.floor(date.getTime() / 1000);
    byId("now-milliseconds").textContent = date.getTime();
    byId("now-iso").textContent = date.toISOString();
    byId("now-local").textContent = date.toLocaleString();
  }

  function showDate(date) {
    if (Number.isNaN(date.getTime())) {
      setStatus("Enter a valid timestamp or date.", "error");
      return;
    }
    byId("result-seconds").value = String(Math.floor(date.getTime() / 1000));
    byId("result-milliseconds").value = String(date.getTime());
    byId("result-iso").value = date.toISOString();
    byId("result-local").value = date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" });
    setStatus("Time converted using your device timezone.", "success");
  }

  function parseInput() {
    const value = byId("timestamp-input").value.trim();
    if (!value) return new Date(Number.NaN);
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      const number = Number(value);
      return new Date(Math.abs(number) < 100_000_000_000 ? number * 1000 : number);
    }
    return new Date(value);
  }

  updateNow();
  const clock = setInterval(updateNow, 1000);
  window.addEventListener("pagehide", () => clearInterval(clock), { once: true });
  byId("convert-timestamp").addEventListener("click", () => showDate(parseInput()));
  byId("convert-date").addEventListener("click", () => showDate(new Date(byId("datetime-input").value)));
  byId("use-now").addEventListener("click", () => {
    const now = new Date();
    byId("timestamp-input").value = String(Math.floor(now.getTime() / 1000));
    showDate(now);
  });
  byId("copy-iso").addEventListener("click", () => copyText(byId("result-iso").value));
}

function renderJwt() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Encoded token</h2><p>JWT contents are decoded locally. A decoded token is not necessarily trustworthy.</p></div></div>
      <label class="field"><span>JWT</span><textarea id="jwt-input" spellcheck="false" placeholder="eyJhbGciOi..." autocomplete="off"></textarea></label>
      <div class="toolbar">
        <button class="button button-primary" id="decode-jwt" type="button">Decode token</button>
        <button class="button" id="jwt-sample" type="button">Load example</button>
        <button class="button" id="jwt-clear" type="button">Clear</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="output-grid">
        <div class="field"><span>Header</span><pre class="code-output" id="jwt-header">—</pre></div>
        <div class="field"><span>Payload</span><pre class="code-output" id="jwt-payload">—</pre></div>
      </div>
      <div class="toolbar">
        <button class="button" id="copy-jwt-payload" type="button">Copy payload</button>
      </div>
    </section>`;

  function decodePart(part) {
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function decode() {
    try {
      const parts = byId("jwt-input").value.trim().split(".");
      if (parts.length !== 3) throw new Error("A JWT must contain three dot-separated sections.");
      const header = decodePart(parts[0]);
      const payload = decodePart(parts[1]);
      byId("jwt-header").textContent = JSON.stringify(header, null, 2);
      byId("jwt-payload").textContent = JSON.stringify(payload, null, 2);
      let message = "Decoded only — the signature has not been verified.";
      if (typeof payload.exp === "number") {
        const expired = payload.exp * 1000 < Date.now();
        message += ` Token ${expired ? "expired" : "expires"} at ${new Date(payload.exp * 1000).toLocaleString()}.`;
      }
      setStatus(message, "success");
    } catch (error) {
      byId("jwt-header").textContent = "—";
      byId("jwt-payload").textContent = "—";
      setStatus(`Could not decode token: ${error.message}`, "error");
    }
  }

  byId("decode-jwt").addEventListener("click", decode);
  byId("jwt-sample").addEventListener("click", () => {
    byId("jwt-input").value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3N3Rvb2xraXQtdXNlciIsIm5hbWUiOiJMb2NhbCBVc2VyIiwiaWF0IjoxNzIxMDQ0ODAwfQ.example-signature";
    decode();
  });
  byId("jwt-clear").addEventListener("click", () => {
    byId("jwt-input").value = "";
    byId("jwt-header").textContent = "—";
    byId("jwt-payload").textContent = "—";
    setStatus("");
  });
  byId("copy-jwt-payload").addEventListener("click", () => copyText(byId("jwt-payload").textContent));
}

function renderBase64() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Text and Base64</h2><p>UTF-8 characters are preserved correctly.</p></div></div>
      <div class="input-grid">
        <label class="field"><span>Plain text</span><textarea id="plain-input" placeholder="Type or paste text…"></textarea></label>
        <label class="field"><span>Base64</span><textarea id="base64-input" spellcheck="false" placeholder="SGVsbG8sIDc3IFRvb2xraXQh"></textarea></label>
      </div>
      <div class="toolbar">
        <button class="button button-primary" id="encode-base64" type="button">Encode →</button>
        <button class="button button-primary" id="decode-base64" type="button">← Decode</button>
        <label class="check-row"><input id="url-safe" type="checkbox"> URL-safe Base64</label>
        <button class="button" id="copy-base64" type="button">Copy Base64</button>
        <button class="button" id="base64-clear" type="button">Clear</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>`;

  function encode() {
    const bytes = new TextEncoder().encode(byId("plain-input").value);
    let binary = "";
    const chunk = 8192;
    for (let index = 0; index < bytes.length; index += chunk) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
    }
    let result = btoa(binary);
    if (byId("url-safe").checked) result = result.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    byId("base64-input").value = result;
    setStatus(`Encoded ${bytes.length.toLocaleString()} UTF-8 bytes.`, "success");
  }

  function decode() {
    try {
      let value = byId("base64-input").value.trim().replace(/\s/g, "");
      value = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
      const binary = atob(value);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      byId("plain-input").value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      setStatus(`Decoded ${bytes.length.toLocaleString()} bytes as UTF-8.`, "success");
    } catch (error) {
      setStatus(`Invalid Base64 or UTF-8 data: ${error.message}`, "error");
    }
  }

  byId("encode-base64").addEventListener("click", encode);
  byId("decode-base64").addEventListener("click", decode);
  byId("copy-base64").addEventListener("click", () => copyText(byId("base64-input").value));
  byId("base64-clear").addEventListener("click", () => {
    byId("plain-input").value = "";
    byId("base64-input").value = "";
    setStatus("");
  });
}

function renderRegex() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Regular expression</h2><p>JavaScript regular expression syntax is used.</p></div></div>
      <div class="control-grid">
        <label class="field" style="grid-column: span 3"><span>Pattern (without / delimiters)</span><input id="regex-pattern" type="text" value="\\btool\\w*" spellcheck="false"></label>
        <label class="field"><span>Flags</span><input id="regex-flags" type="text" value="gi" maxlength="8" spellcheck="false"></label>
      </div>
      <label class="field" style="margin-top: 14px"><span>Test text</span><textarea id="regex-text">77 Toolkit collects useful tools. Each tool runs locally in your browser.</textarea></label>
      <div class="toolbar">
        <button class="button button-primary" id="run-regex" type="button">Run test</button>
        <button class="button" id="regex-clear" type="button">Clear</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="panel-heading"><div><h2>Highlighted matches</h2><p id="regex-summary">Run the test to inspect matches.</p></div></div>
      <div class="match-preview" id="regex-preview"></div>
      <div id="regex-results" style="margin-top: 14px"></div>
    </section>`;

  function run() {
    const pattern = byId("regex-pattern").value;
    const source = byId("regex-text").value;
    try {
      if (!pattern) throw new Error("Pattern cannot be empty.");
      const requestedFlags = [...new Set(byId("regex-flags").value.trim())].join("");
      const flags = requestedFlags.includes("g") ? requestedFlags : `${requestedFlags}g`;
      const expression = new RegExp(pattern, flags);
      const matches = [...source.matchAll(expression)].slice(0, 500);
      const preview = byId("regex-preview");
      preview.replaceChildren();
      let cursor = 0;
      for (const match of matches) {
        preview.append(document.createTextNode(source.slice(cursor, match.index)));
        const mark = document.createElement("mark");
        mark.textContent = match[0] || "​";
        preview.append(mark);
        cursor = match.index + match[0].length;
      }
      preview.append(document.createTextNode(source.slice(cursor)));
      if (!source) preview.textContent = "Paste text above to test the expression.";

      const results = byId("regex-results");
      results.replaceChildren();
      if (matches.length) {
        const wrapper = document.createElement("div");
        wrapper.className = "result-table-wrap";
        const table = document.createElement("table");
        table.className = "result-table";
        table.innerHTML = "<thead><tr><th>#</th><th>Match</th><th>Index</th><th>Capture groups</th></tr></thead>";
        const body = document.createElement("tbody");
        matches.forEach((match, index) => {
          const row = document.createElement("tr");
          [index + 1, match[0] || "(empty)", match.index, match.slice(1).join(" · ") || "—"].forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
          });
          body.append(row);
        });
        table.append(body);
        wrapper.append(table);
        results.append(wrapper);
      } else {
        results.append(renderEmpty("No matches found."));
      }
      byId("regex-summary").textContent = `${matches.length} match${matches.length === 1 ? "" : "es"}${matches.length === 500 ? " (first 500 shown)" : ""}.`;
      setStatus("Expression is valid.", "success");
    } catch (error) {
      setStatus(`Regular expression error: ${error.message}`, "error");
    }
  }

  byId("run-regex").addEventListener("click", run);
  byId("regex-clear").addEventListener("click", () => {
    byId("regex-pattern").value = "";
    byId("regex-text").value = "";
    byId("regex-preview").textContent = "";
    byId("regex-results").replaceChildren();
    setStatus("");
  });
  run();
}

function renderUuid() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Generate UUID v4</h2><p>Values are created with the browser's cryptographically secure random generator.</p></div></div>
      <div class="control-grid">
        <label class="field"><span>Quantity (1–100)</span><input id="uuid-count" type="number" min="1" max="100" value="5"></label>
        <label class="check-row"><input id="uuid-uppercase" type="checkbox"> Uppercase</label>
        <label class="check-row"><input id="uuid-hyphens" type="checkbox" checked> Include hyphens</label>
      </div>
      <div class="toolbar">
        <button class="button button-primary" id="generate-uuid" type="button">Generate UUIDs</button>
        <button class="button" id="copy-uuids" type="button">Copy all</button>
      </div>
      <label class="field" style="margin-top: 14px"><span>Generated values</span><textarea id="uuid-output" readonly spellcheck="false"></textarea></label>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="panel-heading"><div><h2>Validate a UUID</h2><p>Checks the standard 8-4-4-4-12 representation and reports its version.</p></div></div>
      <div class="toolbar">
        <input id="uuid-validate-input" type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style="flex: 1; min-width: 260px">
        <button class="button" id="validate-uuid" type="button">Validate</button>
      </div>
      <p class="status-message" id="uuid-validation" aria-live="polite"></p>
    </section>`;

  function generate() {
    const count = Math.min(100, Math.max(1, Number(byId("uuid-count").value) || 1));
    const upper = byId("uuid-uppercase").checked;
    const hyphens = byId("uuid-hyphens").checked;
    const values = Array.from({ length: count }, () => {
      let value = crypto.randomUUID();
      if (!hyphens) value = value.replaceAll("-", "");
      return upper ? value.toUpperCase() : value;
    });
    byId("uuid-output").value = values.join("\n");
    setStatus(`Generated ${count} UUID${count === 1 ? "" : "s"}.`, "success");
  }

  byId("generate-uuid").addEventListener("click", generate);
  byId("copy-uuids").addEventListener("click", () => copyText(byId("uuid-output").value));
  byId("validate-uuid").addEventListener("click", () => {
    const value = byId("uuid-validate-input").value.trim();
    const match = value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    const status = byId("uuid-validation");
    status.textContent = match ? `Valid RFC 9562 UUID, version ${match[1]}.` : "Not a valid canonical UUID.";
    status.dataset.type = match ? "success" : "error";
  });
  generate();
}

function renderHash() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Hash input</h2><p>Choose text or a local file. Files never leave this browser tab.</p></div></div>
      <label class="field"><span>Text</span><textarea id="hash-text" placeholder="Text to hash…"></textarea></label>
      <div class="control-grid" style="margin-top: 14px">
        <label class="field"><span>Algorithm</span><select id="hash-algorithm"><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></label>
        <label class="field" style="grid-column: span 2"><span>Or choose a file</span><input id="hash-file" type="file"></label>
      </div>
      <div class="toolbar">
        <button class="button button-primary" id="calculate-hash" type="button">Calculate hash</button>
        <button class="button" id="copy-hash" type="button">Copy result</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <label class="field"><span>Hex digest</span><textarea class="compact-output" id="hash-output" readonly spellcheck="false"></textarea></label>
    </section>`;

  byId("calculate-hash").addEventListener("click", async () => {
    try {
      const file = byId("hash-file").files[0];
      const data = file ? await file.arrayBuffer() : new TextEncoder().encode(byId("hash-text").value);
      const algorithm = byId("hash-algorithm").value;
      const digest = await crypto.subtle.digest(algorithm, data);
      const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      byId("hash-output").value = hex;
      setStatus(`${algorithm} calculated for ${file ? `${file.name} (${formatBytes(file.size)})` : `${data.byteLength.toLocaleString()} UTF-8 bytes`}.`, "success");
    } catch (error) {
      setStatus(`Could not calculate hash: ${error.message}`, "error");
    }
  });
  byId("copy-hash").addEventListener("click", () => copyText(byId("hash-output").value));
}

function renderTextDiff() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Text versions</h2><p>Comparison is line based and preserves repeated lines.</p></div></div>
      <div class="input-grid">
        <label class="field"><span>Original text</span><textarea id="text-left" placeholder="Paste the original text…"></textarea></label>
        <label class="field"><span>Updated text</span><textarea id="text-right" placeholder="Paste the updated text…"></textarea></label>
      </div>
      <div class="toolbar">
        <button class="button button-primary" id="compare-text" type="button">Compare text</button>
        <button class="button" id="text-diff-sample" type="button">Load example</button>
        <label class="check-row"><input id="ignore-space" type="checkbox"> Ignore surrounding whitespace</label>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="panel-heading"><div><h2>Line changes</h2><p id="text-diff-summary">Run a comparison to see changes.</p></div></div>
      <div id="text-diff-results"></div>
    </section>`;

  function createDiff(left, right, normalize) {
    const leftComparable = left.map(normalize);
    const rightComparable = right.map(normalize);
    if (left.length * right.length > 2_000_000) {
      throw new Error("This comparison is too large. Keep the combined text below roughly 1,400 lines.");
    }
    const rows = Array.from({ length: left.length + 1 }, () => new Uint32Array(right.length + 1));
    for (let i = left.length - 1; i >= 0; i -= 1) {
      for (let j = right.length - 1; j >= 0; j -= 1) {
        rows[i][j] = leftComparable[i] === rightComparable[j] ? rows[i + 1][j + 1] + 1 : Math.max(rows[i + 1][j], rows[i][j + 1]);
      }
    }
    const result = [];
    let i = 0;
    let j = 0;
    while (i < left.length || j < right.length) {
      if (i < left.length && j < right.length && leftComparable[i] === rightComparable[j]) {
        result.push({ type: "same", left: left[i], right: right[j], leftNumber: i + 1, rightNumber: j + 1 });
        i += 1;
        j += 1;
      } else if (j < right.length && (i === left.length || rows[i][j + 1] >= rows[i + 1][j])) {
        result.push({ type: "added", left: "", right: right[j], leftNumber: "", rightNumber: j + 1 });
        j += 1;
      } else {
        result.push({ type: "removed", left: left[i], right: "", leftNumber: i + 1, rightNumber: "" });
        i += 1;
      }
    }
    return result;
  }

  function run() {
    try {
      const left = byId("text-left").value.split("\n");
      const right = byId("text-right").value.split("\n");
      const normalize = byId("ignore-space").checked ? (line) => line.trim() : (line) => line;
      const diff = createDiff(left, right, normalize);
      const changed = diff.filter((row) => row.type !== "same");
      const results = byId("text-diff-results");
      results.replaceChildren();
      const wrapper = document.createElement("div");
      wrapper.className = "result-table-wrap";
      const table = document.createElement("table");
      table.className = "result-table";
      table.innerHTML = "<thead><tr><th>Old</th><th>Original line</th><th>New</th><th>Updated line</th></tr></thead>";
      const body = document.createElement("tbody");
      diff.forEach((entry) => {
        const row = document.createElement("tr");
        if (entry.type !== "same") row.className = `change-${entry.type}`;
        [entry.leftNumber, entry.left, entry.rightNumber, entry.right].forEach((value, index) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          if (index === 1 || index === 3) cell.style.whiteSpace = "pre-wrap";
          row.append(cell);
        });
        body.append(row);
      });
      table.append(body);
      wrapper.append(table);
      results.append(wrapper);
      const additions = changed.filter((row) => row.type === "added").length;
      const removals = changed.filter((row) => row.type === "removed").length;
      byId("text-diff-summary").textContent = `${additions} added · ${removals} removed · ${diff.length - changed.length} unchanged`;
      setStatus(changed.length ? `Found ${changed.length} changed lines.` : "The texts are identical.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  byId("compare-text").addEventListener("click", run);
  byId("text-diff-sample").addEventListener("click", () => {
    byId("text-left").value = "77 Toolkit\nSmall browser tools\nNo uploads required\nFast and focused";
    byId("text-right").value = "77 Toolkit\nUseful browser tools\nNo uploads required\nPrivate, fast, and focused";
    run();
  });
}

function renderCaseConverter() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Convert text case</h2><p>Works with spaces, punctuation, kebab-case, snake_case, and camelCase input.</p></div></div>
      <label class="field"><span>Input</span><textarea id="case-input" placeholder="make useful browser tools"></textarea></label>
      <div class="toolbar" id="case-actions">
        <button class="button button-primary" data-case="title" type="button">Title Case</button>
        <button class="button" data-case="sentence" type="button">Sentence case</button>
        <button class="button" data-case="upper" type="button">UPPER CASE</button>
        <button class="button" data-case="lower" type="button">lower case</button>
        <button class="button" data-case="camel" type="button">camelCase</button>
        <button class="button" data-case="pascal" type="button">PascalCase</button>
        <button class="button" data-case="snake" type="button">snake_case</button>
        <button class="button" data-case="kebab" type="button">kebab-case</button>
        <button class="button" data-case="constant" type="button">CONSTANT_CASE</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <label class="field"><span>Converted text</span><textarea id="case-output" readonly></textarea></label>
      <div class="toolbar"><button class="button" id="copy-case" type="button">Copy result</button><button class="button" id="swap-case" type="button">Use as input</button></div>
    </section>`;

  function words(value) {
    return value
      .replace(/([\p{Ll}\d])([\p{Lu}])/gu, "$1 $2")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .split(/\s+/u)
      .filter(Boolean)
      .map((word) => word.toLocaleLowerCase());
  }

  const converters = {
    upper: (value) => value.toLocaleUpperCase(),
    lower: (value) => value.toLocaleLowerCase(),
    title: (value) => words(value).map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1)).join(" "),
    sentence: (value) => {
      const result = words(value).join(" ");
      return result ? result.charAt(0).toLocaleUpperCase() + result.slice(1) : "";
    },
    camel: (value) => words(value).map((word, index) => index ? word.charAt(0).toLocaleUpperCase() + word.slice(1) : word).join(""),
    pascal: (value) => words(value).map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1)).join(""),
    snake: (value) => words(value).join("_"),
    kebab: (value) => words(value).join("-"),
    constant: (value) => words(value).join("_").toLocaleUpperCase(),
  };

  byId("case-actions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-case]");
    if (!button) return;
    const value = byId("case-input").value;
    byId("case-output").value = converters[button.dataset.case](value);
    setStatus(`Converted to ${button.textContent}.`, "success");
  });
  byId("copy-case").addEventListener("click", () => copyText(byId("case-output").value));
  byId("swap-case").addEventListener("click", () => {
    byId("case-input").value = byId("case-output").value;
    byId("case-input").focus();
    setStatus("Result moved to input.", "success");
  });
}

function renderLineProcessor() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Process a list of lines</h2><p>Choose one operation at a time, then chain operations by using the result as input.</p></div></div>
      <label class="field"><span>Input lines</span><textarea id="line-input" placeholder="One item per line…"></textarea></label>
      <div class="control-grid" style="margin-top: 14px">
        <label class="field"><span>Operation</span><select id="line-operation"><option value="trim">Trim every line</option><option value="empty">Remove empty lines</option><option value="dedupe">Remove duplicates</option><option value="sort-asc">Sort A → Z</option><option value="sort-desc">Sort Z → A</option><option value="reverse">Reverse line order</option><option value="number">Add line numbers</option><option value="prefix">Add prefix</option><option value="suffix">Add suffix</option></select></label>
        <label class="field" style="grid-column: span 2"><span>Prefix or suffix value</span><input id="line-affix" type="text" placeholder="Example: - "></label>
        <label class="check-row"><input id="line-case-sensitive" type="checkbox" checked> Case-sensitive</label>
      </div>
      <div class="toolbar">
        <button class="button button-primary" id="process-lines" type="button">Process lines</button>
        <button class="button" id="line-sample" type="button">Load example</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <label class="field"><span>Result</span><textarea id="line-output" readonly></textarea></label>
      <div class="toolbar"><button class="button" id="copy-lines" type="button">Copy result</button><button class="button" id="reuse-lines" type="button">Use as input</button></div>
    </section>`;

  function process() {
    const input = byId("line-input").value;
    let lines = input.split("\n");
    const operation = byId("line-operation").value;
    const affix = byId("line-affix").value;
    const sensitive = byId("line-case-sensitive").checked;
    if (operation === "trim") lines = lines.map((line) => line.trim());
    if (operation === "empty") lines = lines.filter((line) => line.trim());
    if (operation === "dedupe") {
      const seen = new Set();
      lines = lines.filter((line) => {
        const key = sensitive ? line : line.toLocaleLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    if (operation === "sort-asc" || operation === "sort-desc") {
      const direction = operation === "sort-asc" ? 1 : -1;
      lines = [...lines].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: sensitive ? "variant" : "base", numeric: true }) * direction);
    }
    if (operation === "reverse") lines = [...lines].reverse();
    if (operation === "number") lines = lines.map((line, index) => `${index + 1}. ${line}`);
    if (operation === "prefix") lines = lines.map((line) => `${affix}${line}`);
    if (operation === "suffix") lines = lines.map((line) => `${line}${affix}`);
    byId("line-output").value = lines.join("\n");
    setStatus(`${input.split("\n").length} input lines → ${lines.length} output lines.`, "success");
  }

  byId("process-lines").addEventListener("click", process);
  byId("line-sample").addEventListener("click", () => {
    byId("line-input").value = "  orange\nApple\nbanana\nApple\n\n  pear  ";
    byId("line-operation").value = "trim";
    process();
  });
  byId("copy-lines").addEventListener("click", () => copyText(byId("line-output").value));
  byId("reuse-lines").addEventListener("click", () => {
    byId("line-input").value = byId("line-output").value;
    setStatus("Result moved to input. Choose another operation to continue.", "success");
  });
}

function renderWordCounter() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Live text statistics</h2><p>Counts update as you type. Reading time assumes 200 words per minute.</p></div></div>
      <label class="field"><span>Text</span><textarea id="word-input" style="min-height: 260px" placeholder="Write or paste text here…"></textarea></label>
      <div class="toolbar"><button class="button" id="word-sample" type="button">Load example</button><button class="button" id="word-clear" type="button">Clear</button></div>
    </section>
    <section class="tool-panel panel-divider">
      <div class="stat-grid">
        <div class="metric"><strong id="count-words">0</strong><span>Words</span></div>
        <div class="metric"><strong id="count-characters">0</strong><span>Characters</span></div>
        <div class="metric"><strong id="count-no-spaces">0</strong><span>No spaces</span></div>
        <div class="metric"><strong id="count-lines">0</strong><span>Lines</span></div>
        <div class="metric"><strong id="count-sentences">0</strong><span>Sentences</span></div>
        <div class="metric"><strong id="count-reading">0 min</strong><span>Reading time</span></div>
      </div>
      <div class="panel-heading" style="margin-top: 24px"><div><h2>Most frequent words</h2><p>Common short English words are excluded.</p></div></div>
      <div id="word-frequency"></div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>`;

  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "is", "are", "was", "were", "be", "with", "that", "this", "it", "as", "at", "by", "from"]);

  function update() {
    const text = byId("word-input").value;
    const words = text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
    const sentences = text.trim() ? (text.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/gu) || []).length : 0;
    const lines = text ? text.split("\n").length : 0;
    byId("count-words").textContent = words.length.toLocaleString();
    byId("count-characters").textContent = [...text].length.toLocaleString();
    byId("count-no-spaces").textContent = [...text.replace(/\s/gu, "")].length.toLocaleString();
    byId("count-lines").textContent = lines.toLocaleString();
    byId("count-sentences").textContent = sentences.toLocaleString();
    byId("count-reading").textContent = words.length ? `${Math.max(1, Math.ceil(words.length / 200))} min` : "0 min";

    const frequency = new Map();
    words.forEach((word) => {
      const normalized = word.toLocaleLowerCase();
      if (normalized.length > 2 && !stopWords.has(normalized)) frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
    });
    const common = [...frequency.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 10);
    const container = byId("word-frequency");
    container.replaceChildren();
    if (!common.length) {
      container.append(renderEmpty("Add more text to see word frequency."));
      return;
    }
    const list = document.createElement("div");
    list.className = "badge-list";
    common.forEach(([word, count]) => {
      const badge = document.createElement("span");
      badge.className = "result-badge pass";
      badge.textContent = `${word} · ${count}`;
      list.append(badge);
    });
    container.append(list);
  }

  byId("word-input").addEventListener("input", update);
  byId("word-sample").addEventListener("click", () => {
    byId("word-input").value = "77 Toolkit brings focused browser tools together. The tools run locally, load quickly, and help people finish small digital tasks without uploading private content.";
    update();
  });
  byId("word-clear").addEventListener("click", () => {
    byId("word-input").value = "";
    update();
  });
  update();
}

function renderUrlParser() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Inspect an absolute URL</h2><p>The address is parsed locally. This tool never visits the destination.</p></div></div>
      <label class="field"><span>URL</span><textarea id="url-parser-input" spellcheck="false" placeholder="https://example.com:8443/search?q=local+tools&q=privacy#results"></textarea></label>
      <div class="toolbar">
        <button class="button button-primary" id="parse-url" type="button">Parse URL</button>
        <button class="button" id="url-parser-sample" type="button">Load example</button>
        <button class="button" id="url-parser-clear" type="button">Clear</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="panel-heading"><div><h2>URL components</h2><p>Decoded values should still be treated as untrusted input.</p></div></div>
      <div id="url-components"></div>
      <div class="panel-heading" style="margin-top: 24px"><div><h2>Query parameters</h2><p>Repeated keys are listed as separate entries in source order.</p></div></div>
      <div id="url-query"></div>
    </section>`;

  function createTable(headers, rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "result-table-wrap";
    const table = document.createElement("table");
    table.className = "result-table";
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    headers.forEach((label) => {
      const cell = document.createElement("th");
      cell.textContent = label;
      headRow.append(cell);
    });
    head.append(headRow);
    const body = document.createElement("tbody");
    rows.forEach((values) => {
      const row = document.createElement("tr");
      values.forEach((value) => {
        const cell = document.createElement("td");
        const code = document.createElement("code");
        code.textContent = value || "—";
        cell.append(code);
        row.append(cell);
      });
      body.append(row);
    });
    table.append(head, body);
    wrapper.append(table);
    return wrapper;
  }

  function parse() {
    try {
      const value = byId("url-parser-input").value.trim();
      if (!value) throw new Error("Enter a complete URL including http:// or https://.");
      const url = new URL(value);
      const componentRows = [
        ["Normalized URL", url.href],
        ["Scheme", url.protocol],
        ["Origin", url.origin],
        ["Username", url.username],
        ["Password present", url.password ? "Yes — treat this URL as sensitive" : "No"],
        ["Hostname", url.hostname],
        ["Port", url.port || "Default for scheme"],
        ["Path", url.pathname],
        ["Fragment", url.hash ? url.hash.slice(1) : ""],
      ];
      byId("url-components").replaceChildren(createTable(["Component", "Value"], componentRows));
      const queryRows = [...url.searchParams.entries()].map(([key, parameterValue], index) => [String(index + 1), key, parameterValue]);
      byId("url-query").replaceChildren(queryRows.length ? createTable(["#", "Key", "Decoded value"], queryRows) : renderEmpty("This URL has no query parameters."));
      setStatus(`Parsed ${url.hostname} with ${queryRows.length} query ${queryRows.length === 1 ? "entry" : "entries"}.`, "success");
    } catch (error) {
      byId("url-components").replaceChildren();
      byId("url-query").replaceChildren();
      setStatus(`URL error: ${error.message}`, "error");
    }
  }

  byId("parse-url").addEventListener("click", parse);
  byId("url-parser-sample").addEventListener("click", () => {
    byId("url-parser-input").value = "https://example.com:8443/search?q=local+tools&q=privacy&return_to=https%3A%2F%2F77toolkit.com%2Fguides%2F#results";
    parse();
  });
  byId("url-parser-clear").addEventListener("click", () => {
    byId("url-parser-input").value = "";
    byId("url-components").replaceChildren();
    byId("url-query").replaceChildren();
    setStatus("");
  });
}

function renderUrlEncoder() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Encode or decode URL text</h2><p>Use component mode for one parameter value and full-URI mode for an already structured address.</p></div></div>
      <div class="control-grid">
        <label class="field"><span>Mode</span><select id="url-encoding-mode"><option value="component">Single component</option><option value="uri">Complete URI</option></select></label>
      </div>
      <label class="field"><span>Input</span><textarea id="url-encoding-input" spellcheck="false" placeholder="reports/July & August"></textarea></label>
      <div class="toolbar">
        <button class="button button-primary" id="encode-url" type="button">Encode</button>
        <button class="button" id="decode-url" type="button">Decode</button>
        <button class="button" id="url-encoding-sample" type="button">Load example</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <label class="field"><span>Result</span><textarea id="url-encoding-output" readonly spellcheck="false" placeholder="Encoded or decoded result"></textarea></label>
      <div class="toolbar">
        <button class="button" id="copy-url-result" type="button">Copy result</button>
        <button class="button" id="reuse-url-result" type="button">Use as input</button>
      </div>
    </section>`;

  function convert(direction) {
    try {
      const input = byId("url-encoding-input").value;
      const componentMode = byId("url-encoding-mode").value === "component";
      const result = direction === "encode"
        ? (componentMode ? encodeURIComponent(input) : encodeURI(input))
        : (componentMode ? decodeURIComponent(input) : decodeURI(input));
      byId("url-encoding-output").value = result;
      setStatus(`${direction === "encode" ? "Encoded" : "Decoded"} in ${componentMode ? "component" : "full-URI"} mode. Review separators before reuse.`, "success");
    } catch (error) {
      byId("url-encoding-output").value = "";
      setStatus(`Encoding error: ${error.message}`, "error");
    }
  }

  byId("encode-url").addEventListener("click", () => convert("encode"));
  byId("decode-url").addEventListener("click", () => convert("decode"));
  byId("url-encoding-sample").addEventListener("click", () => {
    byId("url-encoding-mode").value = "component";
    byId("url-encoding-input").value = "reports/July & August + review";
    convert("encode");
  });
  byId("copy-url-result").addEventListener("click", () => copyText(byId("url-encoding-output").value));
  byId("reuse-url-result").addEventListener("click", () => {
    byId("url-encoding-input").value = byId("url-encoding-output").value;
    setStatus("Result moved to input.", "success");
  });
}

function renderCsvJsonConverter() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Convert CSV and JSON</h2><p>CSV imports use the first row as unique column names. Values remain strings.</p></div></div>
      <div class="control-grid">
        <label class="field"><span>CSV delimiter</span><select id="csv-delimiter"><option value=",">Comma</option><option value=";">Semicolon</option><option value="tab">Tab</option></select></label>
      </div>
      <label class="field"><span>Source data</span><textarea id="csv-json-input" style="min-height: 260px" spellcheck="false" placeholder='name,note&#10;Ada,"local, private"'></textarea></label>
      <div class="toolbar">
        <button class="button button-primary" id="csv-to-json" type="button">CSV → JSON</button>
        <button class="button" id="json-to-csv" type="button">JSON → CSV</button>
        <button class="button" id="csv-json-sample" type="button">Load CSV example</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <label class="field"><span>Result</span><textarea id="csv-json-output" style="min-height: 260px" readonly spellcheck="false"></textarea></label>
      <div class="toolbar">
        <button class="button" id="copy-csv-json" type="button">Copy result</button>
        <button class="button" id="reuse-csv-json" type="button">Use as input</button>
      </div>
    </section>`;

  const delimiter = () => byId("csv-delimiter").value === "tab" ? "\t" : byId("csv-delimiter").value;

  function parseCsv(text, separator) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    let touched = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      touched = true;
      if (quoted) {
        if (character === '"' && text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else if (character === '"') {
          quoted = false;
        } else {
          field += character;
        }
      } else if (character === '"' && field === "") {
        quoted = true;
      } else if (character === separator) {
        row.push(field);
        field = "";
      } else if (character === "\n" || character === "\r") {
        if (character === "\r" && text[index + 1] === "\n") index += 1;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += character;
      }
    }
    if (quoted) throw new Error("A quoted CSV field is not closed.");
    if (touched && (field !== "" || row.length || !/[\r\n]$/.test(text))) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  function csvToJson() {
    try {
      const rows = parseCsv(byId("csv-json-input").value, delimiter());
      if (rows.length < 2) throw new Error("CSV needs a header row and at least one data row.");
      const headers = rows[0].map((header) => header.trim());
      if (headers.some((header) => !header)) throw new Error("Every CSV column needs a non-empty header.");
      if (new Set(headers).size !== headers.length) throw new Error("CSV headers must be unique.");
      const records = rows.slice(1).filter((row) => row.some((value) => value !== "")).map((row, index) => {
        if (row.length !== headers.length) throw new Error(`Row ${index + 2} has ${row.length} fields; expected ${headers.length}.`);
        return Object.fromEntries(headers.map((header, column) => [header, row[column]]));
      });
      byId("csv-json-output").value = JSON.stringify(records, null, 2);
      setStatus(`Converted ${records.length} records and ${headers.length} columns. CSV values remain strings.`, "success");
    } catch (error) {
      byId("csv-json-output").value = "";
      setStatus(`CSV error: ${error.message}`, "error");
    }
  }

  function csvCell(value, separator) {
    let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    if (text.includes('"')) text = text.replaceAll('"', '""');
    return text.includes(separator) || /["\r\n]/.test(text) ? `"${text}"` : text;
  }

  function jsonToCsv() {
    try {
      const records = JSON.parse(byId("csv-json-input").value);
      if (!Array.isArray(records) || !records.length) throw new Error("JSON must be a non-empty array of objects.");
      if (records.some((record) => !record || Array.isArray(record) || typeof record !== "object")) throw new Error("Every array item must be an object.");
      const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
      if (!headers.length) throw new Error("The objects do not contain any properties.");
      const separator = delimiter();
      const rows = [
        headers.map((header) => csvCell(header, separator)).join(separator),
        ...records.map((record) => headers.map((header) => csvCell(record[header], separator)).join(separator)),
      ];
      const formulaLike = records.some((record) => Object.values(record).some((value) => typeof value === "string" && /^[=+\-@]/.test(value)));
      byId("csv-json-output").value = rows.join("\n");
      setStatus(`Converted ${records.length} records and ${headers.length} columns.${formulaLike ? " Review formula-like cells before opening this file in a spreadsheet." : ""}`, formulaLike ? "info" : "success");
    } catch (error) {
      byId("csv-json-output").value = "";
      setStatus(`JSON error: ${error.message}`, "error");
    }
  }

  byId("csv-to-json").addEventListener("click", csvToJson);
  byId("json-to-csv").addEventListener("click", jsonToCsv);
  byId("csv-json-sample").addEventListener("click", () => {
    byId("csv-delimiter").value = ",";
    byId("csv-json-input").value = 'name,note,code\nAda,"local, private",007\nLin,"line one\nline two",042';
    csvToJson();
  });
  byId("copy-csv-json").addEventListener("click", () => copyText(byId("csv-json-output").value));
  byId("reuse-csv-json").addEventListener("click", () => {
    byId("csv-json-input").value = byId("csv-json-output").value;
    setStatus("Result moved to input. Choose the opposite conversion to test a round trip.", "success");
  });
}

function renderHtmlEntities() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Encode or decode HTML character references</h2><p>The result is always displayed as text and is never executed as markup.</p></div></div>
      <label class="field"><span>Input</span><textarea id="html-entity-input" spellcheck="false" placeholder="<strong>Tools & privacy</strong>"></textarea></label>
      <div class="toolbar">
        <button class="button button-primary" id="encode-html-entities" type="button">Encode entities</button>
        <button class="button" id="decode-html-entities" type="button">Decode entities</button>
        <button class="button" id="html-entity-sample" type="button">Load example</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <label class="field"><span>Result</span><textarea id="html-entity-output" readonly spellcheck="false"></textarea></label>
      <div class="toolbar"><button class="button" id="copy-html-entities" type="button">Copy result</button><button class="button" id="reuse-html-entities" type="button">Use as input</button></div>
    </section>`;

  function encode() {
    const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    byId("html-entity-output").value = byId("html-entity-input").value.replace(/[&<>"']/g, (character) => replacements[character]);
    setStatus("Encoded five HTML-sensitive characters. Confirm the destination context before interpolation.", "success");
  }

  function decode() {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = byId("html-entity-input").value.replaceAll("<", "&lt;");
    byId("html-entity-output").value = textarea.value;
    setStatus("Decoded browser-recognized named and numeric references as plain text.", "success");
  }

  byId("encode-html-entities").addEventListener("click", encode);
  byId("decode-html-entities").addEventListener("click", decode);
  byId("html-entity-sample").addEventListener("click", () => {
    byId("html-entity-input").value = '<strong title="local">Tools & privacy</strong>';
    encode();
  });
  byId("copy-html-entities").addEventListener("click", () => copyText(byId("html-entity-output").value));
  byId("reuse-html-entities").addEventListener("click", () => {
    byId("html-entity-input").value = byId("html-entity-output").value;
    setStatus("Result moved to input.", "success");
  });
}

function renderCssUnitConverter() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>CSS measurement assumptions</h2><p>Set the values that apply to the component before comparing units.</p></div></div>
      <div class="control-grid">
        <label class="field"><span>Value</span><input id="css-unit-value" type="number" value="24" step="any"></label>
        <label class="field"><span>Source unit</span><select id="css-source-unit"><option value="px">px</option><option value="rem">rem</option><option value="em">em</option><option value="vw">vw</option><option value="vh">vh</option></select></label>
        <label class="field"><span>Root font size (px)</span><input id="css-root-size" type="number" value="16" min="0.1" step="any"></label>
        <label class="field"><span>Element font size (px)</span><input id="css-element-size" type="number" value="16" min="0.1" step="any"></label>
        <label class="field"><span>Viewport width (px)</span><input id="css-viewport-width" type="number" value="1440" min="1" step="1"></label>
        <label class="field"><span>Viewport height (px)</span><input id="css-viewport-height" type="number" value="900" min="1" step="1"></label>
      </div>
      <div class="toolbar"><button class="button button-primary" id="convert-css-unit" type="button">Convert units</button><button class="button" id="css-unit-sample" type="button">Reset example</button></div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="stat-grid">
        <div class="metric"><strong id="css-result-px">—</strong><span>px</span></div>
        <div class="metric"><strong id="css-result-rem">—</strong><span>rem</span></div>
        <div class="metric"><strong id="css-result-em">—</strong><span>em</span></div>
        <div class="metric"><strong id="css-result-vw">—</strong><span>vw</span></div>
        <div class="metric"><strong id="css-result-vh">—</strong><span>vh</span></div>
      </div>
    </section>`;

  function cleanNumber(value) {
    return Number(value.toFixed(6)).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }

  function convert() {
    const value = Number(byId("css-unit-value").value);
    const rootSize = Number(byId("css-root-size").value);
    const elementSize = Number(byId("css-element-size").value);
    const viewportWidth = Number(byId("css-viewport-width").value);
    const viewportHeight = Number(byId("css-viewport-height").value);
    if (![value, rootSize, elementSize, viewportWidth, viewportHeight].every(Number.isFinite) || rootSize <= 0 || elementSize <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
      setStatus("Enter a finite value and positive font and viewport sizes.", "error");
      return;
    }
    const source = byId("css-source-unit").value;
    const pixelValue = {
      px: value,
      rem: value * rootSize,
      em: value * elementSize,
      vw: value * viewportWidth / 100,
      vh: value * viewportHeight / 100,
    }[source];
    const results = {
      px: pixelValue,
      rem: pixelValue / rootSize,
      em: pixelValue / elementSize,
      vw: pixelValue / viewportWidth * 100,
      vh: pixelValue / viewportHeight * 100,
    };
    Object.entries(results).forEach(([unit, result]) => {
      byId(`css-result-${unit}`).textContent = cleanNumber(result);
    });
    setStatus(`Converted ${value} ${source} using the stated layout assumptions. Verify computed styles in the real page.`, "success");
  }

  ["css-unit-value", "css-source-unit", "css-root-size", "css-element-size", "css-viewport-width", "css-viewport-height"].forEach((id) => byId(id).addEventListener("input", convert));
  byId("convert-css-unit").addEventListener("click", convert);
  byId("css-unit-sample").addEventListener("click", () => {
    byId("css-unit-value").value = "24";
    byId("css-source-unit").value = "px";
    byId("css-root-size").value = "16";
    byId("css-element-size").value = "16";
    byId("css-viewport-width").value = "1440";
    byId("css-viewport-height").value = "900";
    convert();
  });
  convert();
}

async function decodeImage(file) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Choose a supported image file.");
  if (file.size > 50 * 1024 * 1024) throw new Error("Keep images below 50 MB for reliable browser processing.");
  let image;
  if ("createImageBitmap" in window) {
    image = await createImageBitmap(file, { imageOrientation: "from-image" });
  } else {
    image = await new Promise((resolve, reject) => {
      const element = new Image();
      const url = URL.createObjectURL(file);
      element.onload = () => {
        URL.revokeObjectURL(url);
        resolve(element);
      };
      element.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("The browser could not decode this image."));
      };
      element.src = url;
    });
  }
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;
  if (!width || !height || width * height > 60_000_000) {
    if (typeof image.close === "function") image.close();
    throw new Error("Image dimensions are too large. Keep images below 60 megapixels.");
  }
  return { image, width, height };
}

function renderCanvas(image, width, height, mimeType) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: mimeType !== "image/jpeg" });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function canvasBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("This browser could not encode the requested format.")), mimeType, quality);
  });
}

function mimeDetails(value) {
  const details = {
    jpeg: { mime: "image/jpeg", extension: "jpg" },
    png: { mime: "image/png", extension: "png" },
    webp: { mime: "image/webp", extension: "webp" },
  };
  return details[value] || details.png;
}

function baseFilename(filename) {
  return filename.replace(/\.[^.]+$/, "") || "77toolkit-image";
}

function renderImageTransform(mode) {
  const settings = {
    compressor: {
      heading: "Compress an image",
      help: "Choose JPEG or WebP and adjust quality to balance detail and file size.",
      action: "Compress image",
      controls: `
        <label class="field"><span>Output format</span><select id="image-format"><option value="webp">WebP</option><option value="jpeg">JPEG</option></select></label>
        <label class="field" style="grid-column: span 2"><span>Quality</span><div class="range-row"><input id="image-quality" type="range" min="10" max="100" value="78"><span class="range-value" id="quality-value">78%</span></div></label>`,
    },
    resizer: {
      heading: "Resize an image",
      help: "Set exact pixel dimensions and preserve the original aspect ratio when needed.",
      action: "Resize image",
      controls: `
        <label class="field"><span>Width (px)</span><input id="image-width" type="number" min="1" max="16384"></label>
        <label class="field"><span>Height (px)</span><input id="image-height" type="number" min="1" max="16384"></label>
        <label class="field"><span>Output format</span><select id="image-format"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></label>
        <label class="check-row"><input id="keep-ratio" type="checkbox" checked> Keep aspect ratio</label>`,
    },
    converter: {
      heading: "Convert image format",
      help: "Re-encode a local image as PNG, JPEG, or WebP.",
      action: "Convert image",
      controls: `
        <label class="field"><span>Output format</span><select id="image-format"><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></label>
        <label class="field" style="grid-column: span 2"><span>JPEG / WebP quality</span><div class="range-row"><input id="image-quality" type="range" min="10" max="100" value="92"><span class="range-value" id="quality-value">92%</span></div></label>`,
    },
    metadata: {
      heading: "Remove image metadata",
      help: "The image is decoded and rebuilt without EXIF, GPS, camera, or comment fields.",
      action: "Remove metadata",
      controls: `
        <label class="field"><span>Output format</span><select id="image-format"><option value="same">Keep JPEG, PNG, or WebP</option><option value="jpeg">JPEG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label>
        <label class="field" style="grid-column: span 2"><span>JPEG / WebP quality</span><div class="range-row"><input id="image-quality" type="range" min="10" max="100" value="94"><span class="range-value" id="quality-value">94%</span></div></label>`,
    },
  }[mode];

  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>${settings.heading}</h2><p>${settings.help}</p></div></div>
      <label class="drop-zone">
        <div><strong>Choose an image</strong><input class="visually-hidden" id="image-file" type="file" accept="image/*"><p>Click here to select a JPEG, PNG, WebP, or other browser-supported image.</p></div>
      </label>
      <div class="control-grid" style="margin-top: 16px">${settings.controls}</div>
      <div class="toolbar">
        <button class="button button-primary" id="process-image" type="button" disabled>${settings.action}</button>
        <button class="button" id="download-image" type="button" disabled>Download result</button>
      </div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="preview-grid">
        <div class="field"><span>Original</span><div class="image-preview" id="original-preview"><span class="status-message">No image selected</span></div><div class="preview-meta"><span id="original-dimensions">—</span><span id="original-size">—</span></div></div>
        <div class="field"><span>Result</span><div class="image-preview" id="result-preview"><span class="status-message">Process an image to preview the result</span></div><div class="preview-meta"><span id="result-dimensions">—</span><span id="result-size">—</span></div></div>
      </div>
    </section>`;

  const state = { file: null, decoded: null, originalUrl: null, resultUrl: null, blob: null, extension: "png" };
  const quality = byId("image-quality");
  if (quality) {
    quality.addEventListener("input", () => {
      byId("quality-value").textContent = `${quality.value}%`;
    });
  }

  function outputDetails() {
    const selected = byId("image-format").value;
    if (selected !== "same") return mimeDetails(selected);
    const sourceType = state.file?.type;
    if (sourceType === "image/jpeg") return mimeDetails("jpeg");
    if (sourceType === "image/webp") return mimeDetails("webp");
    return mimeDetails("png");
  }

  function updateResultPreview(blob, width, height) {
    if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
    state.resultUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.alt = "Processed image preview";
    image.src = state.resultUrl;
    byId("result-preview").replaceChildren(image);
    byId("result-dimensions").textContent = `${width.toLocaleString()} × ${height.toLocaleString()} px`;
    byId("result-size").textContent = formatBytes(blob.size);
    byId("download-image").disabled = false;
  }

  async function chooseFile(file) {
    try {
      if (state.decoded && typeof state.decoded.image.close === "function") state.decoded.image.close();
      state.decoded = await decodeImage(file);
      state.file = file;
      state.blob = null;
      if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
      state.originalUrl = URL.createObjectURL(file);
      const preview = new Image();
      preview.alt = `Preview of ${file.name}`;
      preview.src = state.originalUrl;
      byId("original-preview").replaceChildren(preview);
      byId("original-dimensions").textContent = `${state.decoded.width.toLocaleString()} × ${state.decoded.height.toLocaleString()} px`;
      byId("original-size").textContent = formatBytes(file.size);
      byId("process-image").disabled = false;
      byId("download-image").disabled = true;
      if (mode === "resizer") {
        byId("image-width").value = state.decoded.width;
        byId("image-height").value = state.decoded.height;
      }
      setStatus(`${file.name} is ready.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  byId("image-file").addEventListener("change", (event) => chooseFile(event.target.files[0]));
  const dropZone = document.querySelector(".drop-zone");
  dropZone.addEventListener("dragover", (event) => event.preventDefault());
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    if (event.dataTransfer.files[0]) chooseFile(event.dataTransfer.files[0]);
  });

  if (mode === "resizer") {
    byId("image-width").addEventListener("input", () => {
      if (state.decoded && byId("keep-ratio").checked) byId("image-height").value = Math.max(1, Math.round(Number(byId("image-width").value) * state.decoded.height / state.decoded.width));
    });
    byId("image-height").addEventListener("input", () => {
      if (state.decoded && byId("keep-ratio").checked) byId("image-width").value = Math.max(1, Math.round(Number(byId("image-height").value) * state.decoded.width / state.decoded.height));
    });
  }

  byId("process-image").addEventListener("click", async () => {
    try {
      if (!state.decoded) throw new Error("Choose an image first.");
      const width = mode === "resizer" ? Math.round(Number(byId("image-width").value)) : state.decoded.width;
      const height = mode === "resizer" ? Math.round(Number(byId("image-height").value)) : state.decoded.height;
      if (!width || !height || width > 16384 || height > 16384 || width * height > 60_000_000) throw new Error("Output dimensions must be between 1 px and 16,384 px and below 60 megapixels.");
      const details = outputDetails();
      const canvas = renderCanvas(state.decoded.image, width, height, details.mime);
      const result = await canvasBlob(canvas, details.mime, quality ? Number(quality.value) / 100 : 0.92);
      state.blob = result;
      state.extension = details.extension;
      updateResultPreview(result, width, height);
      if (mode === "compressor") {
        const saving = (1 - result.size / state.file.size) * 100;
        setStatus(`${formatBytes(state.file.size)} → ${formatBytes(result.size)} (${saving >= 0 ? `${saving.toFixed(1)}% smaller` : `${Math.abs(saving).toFixed(1)}% larger`}).`, saving >= 0 ? "success" : "info");
      } else if (mode === "metadata") {
        setStatus("Image rebuilt without original metadata. Visual pixels are retained, but animation is not preserved.", "success");
      } else {
        setStatus(`Created ${width.toLocaleString()} × ${height.toLocaleString()} ${details.extension.toUpperCase()} image.`, "success");
      }
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  byId("download-image").addEventListener("click", () => {
    if (state.blob) downloadBlob(state.blob, `${baseFilename(state.file.name)}-${mode === "metadata" ? "clean" : mode}.${state.extension}`);
  });
  window.addEventListener("pagehide", () => {
    if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
    if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
    if (state.decoded && typeof state.decoded.image.close === "function") state.decoded.image.close();
  }, { once: true });
}

function renderContrast() {
  root.innerHTML = `
    <section class="tool-panel">
      <div class="panel-heading"><div><h2>Choose two colors</h2><p>Contrast is calculated from WCAG relative luminance.</p></div></div>
      <div class="input-grid">
        <label class="field"><span>Foreground / text</span><span class="color-control"><input id="foreground-picker" type="color" value="#17212b"><input id="foreground-value" type="text" value="#17212b" spellcheck="false"></span></label>
        <label class="field"><span>Background</span><span class="color-control"><input id="background-picker" type="color" value="#ffffff"><input id="background-value" type="text" value="#ffffff" spellcheck="false"></span></label>
      </div>
      <div class="toolbar"><button class="button" id="swap-colors" type="button">Swap colors</button></div>
      <p class="status-message" id="tool-status" aria-live="polite"></p>
    </section>
    <section class="tool-panel panel-divider">
      <div class="output-grid">
        <div class="contrast-sample" id="contrast-sample"><div><strong>Readable text</strong><span>77 Toolkit contrast preview</span></div></div>
        <div>
          <div class="metric"><strong id="contrast-ratio">—</strong><span>Contrast ratio</span></div>
          <div class="badge-list" id="contrast-results"></div>
          <p class="status-message">AA normal text requires 4.5:1; AA large text requires 3:1; AAA normal text requires 7:1.</p>
        </div>
      </div>
    </section>`;

  function normalizeHex(value) {
    let hex = value.trim();
    if (!hex.startsWith("#")) hex = `#${hex}`;
    if (/^#[0-9a-f]{3}$/i.test(hex)) hex = `#${hex.slice(1).split("").map((character) => character.repeat(2)).join("")}`;
    return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : null;
  }

  function luminance(hex) {
    const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function update() {
    const foreground = normalizeHex(byId("foreground-value").value);
    const background = normalizeHex(byId("background-value").value);
    if (!foreground || !background) {
      setStatus("Enter colors as three- or six-digit hex values.", "error");
      return;
    }
    byId("foreground-picker").value = foreground;
    byId("background-picker").value = background;
    const light = Math.max(luminance(foreground), luminance(background));
    const dark = Math.min(luminance(foreground), luminance(background));
    const ratio = (light + 0.05) / (dark + 0.05);
    byId("contrast-ratio").textContent = `${ratio.toFixed(2)} : 1`;
    const sample = byId("contrast-sample");
    sample.style.color = foreground;
    sample.style.backgroundColor = background;
    const tests = [
      ["AA normal", ratio >= 4.5],
      ["AA large", ratio >= 3],
      ["AAA normal", ratio >= 7],
      ["AAA large", ratio >= 4.5],
    ];
    const results = byId("contrast-results");
    results.replaceChildren(...tests.map(([label, pass]) => {
      const badge = document.createElement("span");
      badge.className = `result-badge${pass ? " pass" : ""}`;
      badge.textContent = `${label}: ${pass ? "Pass" : "Fail"}`;
      return badge;
    }));
    setStatus(ratio >= 4.5 ? "This pair passes AA for normal text." : ratio >= 3 ? "This pair passes AA only for large text." : "This pair does not pass AA text contrast.", ratio >= 4.5 ? "success" : "error");
  }

  [["foreground-picker", "foreground-value"], ["background-picker", "background-value"]].forEach(([pickerId, valueId]) => {
    byId(pickerId).addEventListener("input", () => {
      byId(valueId).value = byId(pickerId).value;
      update();
    });
    byId(valueId).addEventListener("input", update);
  });
  byId("swap-colors").addEventListener("click", () => {
    const foreground = byId("foreground-value").value;
    byId("foreground-value").value = byId("background-value").value;
    byId("background-value").value = foreground;
    update();
  });
  update();
}

const renderers = {
  "json-diff": renderJsonDiff,
  timestamp: renderTimestamp,
  "jwt-decoder": renderJwt,
  base64: renderBase64,
  "regex-tester": renderRegex,
  "uuid-generator": renderUuid,
  "hash-generator": renderHash,
  "text-diff": renderTextDiff,
  "case-converter": renderCaseConverter,
  "line-processor": renderLineProcessor,
  "word-counter": renderWordCounter,
  "image-compressor": () => renderImageTransform("compressor"),
  "image-resizer": () => renderImageTransform("resizer"),
  "image-converter": () => renderImageTransform("converter"),
  "contrast-checker": renderContrast,
  "metadata-remover": () => renderImageTransform("metadata"),
  "url-parser": renderUrlParser,
  "url-encoder": renderUrlEncoder,
  "csv-json-converter": renderCsvJsonConverter,
  "html-entities": renderHtmlEntities,
  "css-unit-converter": renderCssUnitConverter,
};

if (!root || !config || !renderers[config.slug]) {
  if (root) root.innerHTML = '<section class="tool-panel"><p>This tool could not be loaded. Return to the toolkit and try again.</p></section>';
} else {
  renderers[config.slug]();
}
