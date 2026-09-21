import test from "node:test";
import assert from "node:assert/strict";
import { convertInteger, convertJsonString, buildCampaignUrl } from "../apps/browser-tools/shared/utilities.mjs";

for (const [input, from, to, expected] of [
  ["9007199254740993", 10, 16, "20000000000001"],
  ["18446744073709551615", 10, 16, "ffffffffffffffff"],
  ["-0xFF", 16, 2, "-11111111"], ["+0b0010", 2, 10, "2"],
  ["0o777", 8, 10, "511"], ["Z", 36, 10, "35"], ["-000", 10, 16, "0"],
]) test(`integer ${input} base ${from} → ${to}`, () => assert.equal(convertInteger(input, from, to), expected));

test("integer conversion round trips every supported base", () => {
  for (let base = 2; base <= 36; base++) {
    const value = "-123456789012345678901234567890";
    assert.equal(convertInteger(convertInteger(value, 10, base), base, 10), value);
  }
});
test("integer conversion rejects invalid or excessive input", () => {
  for (const input of ["", " ", "0x", "12oops", "1.5", "1e3", "1_000", "1 2", "--5", "1".repeat(4097)]) {
    assert.throws(() => convertInteger(input, 10, 16));
  }
  assert.throws(() => convertInteger("2", 2, 10));
  for (const base of [1, 37, 2.5, NaN]) {
    assert.throws(() => convertInteger("10", base, 10));
    assert.throws(() => convertInteger("10", 10, base));
  }
});
test("JSON strings round trip quotes, controls, Unicode, and literal markup", () => {
  for (const input of ["", '"hello"\n\t\\path\r\u0000', "你好 👋 café", "</script><img src=x onerror=alert(1)>", "\ud800"]) {
    assert.equal(convertJsonString(convertJsonString(input, "escape"), "unescape"), input);
  }
});
test("JSON string decoding rejects non-string JSON and malformed literals", () => {
  for (const input of ["", "null", "42", "true", "{}", "[]", "'hello'", '"bad\\q"']) {
    assert.throws(() => convertJsonString(input, "unescape"));
  }
  assert.throws(() => convertJsonString("a".repeat(1_000_001), "escape"));
  assert.throws(() => convertJsonString("text", "unknown"));
});
const campaign = { source: "newsletter", medium: "email", campaign: "春季 launch & sale", term: "", content: "" };
test("UTM preserves unrelated parameters and fragments and replaces duplicate tags", () => {
  const url = new URL(buildCampaignUrl("https://example.com/path?x=1&x=2&utm_source=old&utm_source=again&utm_term=old#details", campaign));
  assert.deepEqual(url.searchParams.getAll("x"), ["1", "2"]);
  assert.deepEqual(url.searchParams.getAll("utm_source"), ["newsletter"]);
  assert.equal(url.searchParams.get("utm_campaign"), campaign.campaign);
  assert.equal(url.searchParams.has("utm_term"), false);
  assert.equal(url.hash, "#details");
});
test("UTM treats reserved characters as data, not parameters", () => {
  const url = new URL(buildCampaignUrl("https://example.com/", { ...campaign, content: "a&admin=true#b+%" }));
  assert.equal(url.searchParams.get("content"), null);
  assert.equal(url.searchParams.get("admin"), null);
  assert.equal(url.searchParams.get("utm_content"), "a&admin=true#b+%");
});
test("UTM rejects unsafe schemes, credentials, relative URLs, and missing required values", () => {
  for (const url of ["javascript:alert(1)", "file:///tmp/a", "/relative", "https://user:secret@example.com", ""]) {
    assert.throws(() => buildCampaignUrl(url, campaign));
  }
  for (const key of ["source", "medium", "campaign"]) assert.throws(() => buildCampaignUrl("https://example.com", { ...campaign, [key]: " " }));
});
