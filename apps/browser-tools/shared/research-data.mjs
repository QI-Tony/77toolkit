// Machado et al. (2009), severity 1.0, applied in linear sRGB.
const matrices = {
  Protanopia: [[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],
  Deuteranopia: [[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.011820,.042940,.968881]],
  Tritanopia: [[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.303900]],
  Grayscale: Array.from({length:3}, () => [.2126,.7152,.0722]),
};

export function simulateColor(hex, mode) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error("Use six-digit HEX colors.");
  if (!matrices[mode]) return hex;
  const rgb = hex.slice(1).match(/../g).map((part) => {
    const v = parseInt(part,16) / 255;
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  });
  return "#" + matrices[mode].map((row) => {
    const v = Math.min(1, Math.max(0, row.reduce((sum, weight, i) => sum + weight * rgb[i], 0)));
    return Math.round(255 * (v <= .0031308 ? 12.92 * v : 1.055 * v ** (1/2.4) - .055)).toString(16).padStart(2,"0");
  }).join("");
}

export function figureResolution(pixels, width, unit, dpi) {
  if (![pixels,width,dpi].every((v) => Number.isFinite(v) && v > 0)) throw new Error("Enter positive dimensions and target DPI.");
  const inches = unit === "mm" ? width / 25.4 : width;
  return { effective: pixels / inches, required: Math.ceil(inches * dpi) };
}

export function randomizeSamples(ids, groups, seed) {
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error("Provide unique sample IDs.");
  if (!seed.trim()) throw new Error("Enter a seed.");
  if (groups.length < 2 || new Set(groups.map(([name]) => name)).size !== groups.length ||
      groups.some(([name,count]) => !name || !Number.isSafeInteger(count) || count < 1) ||
      groups.reduce((sum,[,count]) => sum + count,0) !== ids.length) {
    throw new Error("Use at least two unique groups with positive integer counts totaling the number of samples.");
  }
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.codePointAt(0),16777619);
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ state >>> 15, 1 | state);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    const j = Math.floor(((value ^ value >>> 14) >>> 0) / 4294967296 * (i + 1));
    [shuffled[i],shuffled[j]] = [shuffled[j],shuffled[i]];
  }
  let offset = 0;
  return groups.flatMap(([name,count]) => {
    const assigned = shuffled.slice(offset, offset + count);
    offset += count;
    return assigned.map((id) => [id,name]);
  });
}

export function inspectCsv(rows, { id, group, numeric }) {
  const [header, ...records] = rows;
  if (!header || !records.length) throw new Error("Provide a header and at least one record.");
  const names = header.map((name) => name.trim());
  if (names.some((name) => !name) || new Set(names).size !== names.length) throw new Error("Headers must be unique and nonempty.");
  for (const name of [id,group,...numeric].filter(Boolean)) {
    if (!names.includes(name)) throw new Error(`Unknown column: ${name}`);
  }
  const seen = new Map(), counts = new Map(), issues = [];
  records.forEach((row,i) => {
    const record = i + 2;
    if (row.length !== names.length) issues.push(`Record ${record}: expected ${names.length} fields, found ${row.length}.`);
    names.forEach((name,column) => {
      const value = row[column]?.trim() || "";
      if (!value || /^(na|n\/a|null)$/i.test(value)) {
        issues.push(`Record ${record}, ${name}: missing value.`);
        return;
      }
      if (name === id) {
        if (seen.has(value)) issues.push(`Record ${record}: duplicate ID "${value}" (first at record ${seen.get(value)}).`);
        else seen.set(value, record);
      }
      if (name === group) counts.set(value,(counts.get(value) || 0) + 1);
      if (numeric.includes(name) && (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value) || !Number.isFinite(Number(value)))) {
        issues.push(`Record ${record}, ${name}: expected a finite number.`);
      }
    });
  });
  return { records: records.length, issues, counts };
}

function splitBibtex(text) {
  const records = [];
  let cursor = 0;
  while (cursor < text.length) {
    const rest = text.slice(cursor).replace(/^(?:\s|%[^\r\n]*(?:\r?\n|$))+/,"");
    cursor = text.length - rest.length;
    if (!rest) break;
    const start = /^@(\w+)\s*([({])/.exec(rest);
    if (!start) throw new Error("Expected a BibTeX entry. Check the text between entries.");
    let braces = 0, quoted = false, end = start[0].length;
    for (; end < rest.length; end++) {
      const c = rest[end];
      if (c === "\\") { end++; continue; }
      if (c === '"' && braces === 0) quoted = !quoted;
      if (quoted) continue;
      if (!braces && c === (start[2] === "{" ? "}" : ")")) break;
      if (c === "{") braces++;
      if (c === "}") braces--;
    }
    if (end >= rest.length) throw new Error("A BibTeX entry is not closed.");
    const body = rest.slice(start[0].length,end);
    const special = /^(comment|string|preamble)$/i.test(start[1]);
    const key = special ? "" : body.split(",")[0].trim();
    if (!special && (!body.includes(",") || !key)) throw new Error("A BibTeX entry is missing its citation key.");
    const doi = /,\s*doi\s*=\s*(?:\{([^}]+)\}|"([^"]+)")/i.exec(body);
    records.push({ raw: rest.slice(0,end+1), key, special, doi: doi?.[1] || doi?.[2], year: /,\s*(?:year|date)\s*=\s*[{" ]*\d{4}/i.test(body) });
    cursor += end + 1;
  }
  return records;
}

export function cleanReferences(text, format, deduplicate) {
  const source = text.replace(/^\uFEFF/,"").trim();
  if (!source) throw new Error("Paste a bibliography first.");
  const records = format === "bib" ? splitBibtex(source) : source.split(/(?<=^ER {2}-[^\r\n]*)\r?\n\s*/m).filter(Boolean).map((raw) => {
    if (!/^TY {2}-/m.test(raw) || !/^ER {2}-\s*$/m.test(raw) || [...raw.matchAll(/^TY {2}-/gm)].length !== 1) throw new Error("Each RIS record must start with TY and end with ER.");
    return { raw, doi: /^DO {2}-\s*(.+)$/m.exec(raw)?.[1], year: /^(?:PY|Y1|DA) {2}-\s*\d{4}/m.test(raw) };
  });
  const dois = new Map(), keys = new Map(), issues = [], output = [];
  records.forEach((record,i) => {
    if (record.special) { output.push(record.raw); return; }
    const number = i + 1;
    const doi = record.doi?.trim().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i,"").toLowerCase();
    if (!record.year) issues.push(`Record ${number}: missing or unrecognized year.`);
    if (record.key) {
      if (keys.has(record.key)) issues.push(`Record ${number}: citation key "${record.key}" conflicts with record ${keys.get(record.key)}.`);
      else keys.set(record.key,number);
    }
    if (doi && dois.has(doi)) {
      issues.push(`Record ${number}: duplicate DOI (record ${dois.get(doi)}).`);
      if (deduplicate) return;
    }
    if (doi) dois.set(doi,number);
    output.push(record.raw);
  });
  // Keep the original BibTeX verbatim for diagnostics, including comments and macros.
  return { issues, text: deduplicate ? output.join("\n\n") + "\n" : text, removed: records.length - output.length };
}
