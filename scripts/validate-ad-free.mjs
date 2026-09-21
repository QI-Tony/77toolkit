import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

// Check both HTML and built JavaScript: an ad loader can be injected at runtime.
export async function assertAdFreeOutput(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await assertAdFreeOutput(filename);
    else if (entry.name === "ads.txt") throw new Error(`Advertising authorization file found: ${filename}`);
    else if (/\.(?:html|m?js)$/i.test(entry.name)) {
      const source = await readFile(filename, "utf8");
      if (/profitableratecpmnetwork\.com|googlesyndication\.com|doubleclick\.net|adsbygoogle|ca-pub-\d+/i.test(source)) {
        throw new Error(`Advertising integration found: ${filename}`);
      }
    }
  }
}
