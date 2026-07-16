import { access, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(repositoryRoot, "dist");

const sites = [
  {
    label: "home",
    workspace: "@77toolkit/home",
    source: "apps/home/dist",
    target: "dist",
  },
  {
    label: "color spectrum",
    workspace: "@77toolkit/color-spectrum",
    source: "apps/color-spectrum/dist",
    target: "dist/tools/color-spectrum",
  },
  {
    label: "JSON fix",
    workspace: "@77toolkit/json-fix",
    source: "apps/json-fix/dist",
    target: "dist/tools/json-fix",
  },
  {
    label: "text clean",
    workspace: "@77toolkit/text-clean",
    source: "apps/text-clean/dist",
    target: "dist/tools/text-clean",
  },
];

function runWorkspaceBuild(workspace) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ["run", "build", `--workspace=${workspace}`], {
      cwd: repositoryRoot,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Build failed for ${workspace} with exit code ${code}.`));
    });
  });
}

async function copyDirectoryContents(source, target) {
  await access(source);
  await mkdir(target, { recursive: true });

  const entries = await readdir(source, { withFileTypes: true });
  await Promise.all(
    entries.map((entry) =>
      cp(path.join(source, entry.name), path.join(target, entry.name), {
        recursive: entry.isDirectory(),
        force: true,
      }),
    ),
  );
}

await rm(outputRoot, { recursive: true, force: true });

for (const site of sites) {
  console.log(`\nBuilding ${site.label}...`);
  await runWorkspaceBuild(site.workspace);
  await copyDirectoryContents(
    path.join(repositoryRoot, site.source),
    path.join(repositoryRoot, site.target),
  );
}

await writeFile(
  path.join(outputRoot, "_redirects"),
  [
    "/tools/color-spectrum /tools/color-spectrum/ 301",
    "/tools/json-fix /tools/json-fix/ 301",
    "/tools/text-clean /tools/text-clean/ 301",
    "",
  ].join("\n"),
);

console.log("\nUnified Pages output created in dist/.");

