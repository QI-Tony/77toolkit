const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

export function convertInteger(input, fromBase, toBase) {
  if (![fromBase, toBase].every((base) => Number.isInteger(base) && base >= 2 && base <= 36)) {
    throw new Error("Choose a base between 2 and 36.");
  }
  let text = input.trim().toLowerCase();
  if (!text) throw new Error("Enter an integer to convert.");
  const negative = text.startsWith("-");
  text = text.replace(/^[+-]/, "");
  const prefix = { 2: "0b", 8: "0o", 16: "0x" }[fromBase];
  if (prefix && text.startsWith(prefix)) text = text.slice(2);
  if (!text || text.length > 4096) throw new Error("Enter between 1 and 4,096 digits.");
  let value = 0n;
  for (const character of text) {
    const digit = DIGITS.indexOf(character);
    if (digit < 0 || digit >= fromBase) throw new Error(`“${character}” is not a base-${fromBase} digit.`);
    value = value * BigInt(fromBase) + BigInt(digit);
  }
  return (negative ? -value : value).toString(toBase);
}

export function convertJsonString(input, mode) {
  if (input.length > 1_000_000) throw new Error("Use text smaller than 1 million characters.");
  if (mode === "escape") return JSON.stringify(input);
  if (mode !== "unescape") throw new Error("Choose escape or unescape.");
  const result = JSON.parse(input);
  if (typeof result !== "string") throw new Error("Enter a JSON string in double quotes, not an object, array, number, or null.");
  return result;
}

export function buildCampaignUrl(input, fields) {
  const url = new URL(input.trim());
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Use an absolute http:// or https:// URL.");
  if (url.username || url.password) throw new Error("Remove the username and password from the URL.");
  for (const required of ["source", "medium", "campaign"]) {
    if (!fields[required]?.trim()) throw new Error(`Enter a campaign ${required}.`);
  }
  for (const key of ["source", "medium", "campaign", "term", "content"]) {
    const value = fields[key]?.trim() || "";
    // Replace duplicates and remove blank optional fields, preserving other query parameters.
    if (value) url.searchParams.set(`utm_${key}`, value);
    else url.searchParams.delete(`utm_${key}`);
  }
  return url.href;
}
