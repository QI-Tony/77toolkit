import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { assertAdFreeOutput } from "../scripts/validate-ad-free.mjs";

test("ad-free validation accepts local pages and rejects loaders, bundles, and ads.txt", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "77-ad-free-"));
  try {
    await writeFile(path.join(directory, "index.html"), '<script src="/assets/app.js"></script><p>Ad-free tools</p>');
    await mkdir(path.join(directory, "assets"));
    await assert.doesNotReject(assertAdFreeOutput(directory));
    for (const [name, content] of [
      ["injected.html", '<script src="https://pl31227992.profitableratecpmnetwork.com/ad.js"></script>'],
      ["assets/bundle.js", 'script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"'],
      ["ads.txt", "google.com, pub-123, DIRECT, abc"],
    ]) {
      const file = path.join(directory, name);
      await writeFile(file, content);
      await assert.rejects(assertAdFreeOutput(directory), /Advertising/);
      await rm(file);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
