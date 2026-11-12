// Packs the contents of dist/ into dist.zip for upload through cPanel File Manager.
//
// Usage:  npm run zip   (builds, then writes dist.zip in the project root)
//
// In File Manager: upload dist.zip into public_html, right-click it -> Extract, then delete it.
// Uses the tar that ships with Windows 10+ and macOS (bsdtar writes zip files), so no npm package.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = join(import.meta.dirname, "..");
const distDir = join(root, "dist");
const zipPath = join(root, "dist.zip");

if (!existsSync(distDir)) {
  console.error("dist/ does not exist. Run `npm run build` first.");
  process.exit(1);
}

/** Every file under dir, including dotfiles such as .htaccess. */
function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

// Cloudflare-only files that mean nothing on Apache.
const skip = new Set([".assetsignore", "_headers"]);

const files = listFiles(distDir)
  .map((path) => relative(distDir, path).split(sep).join("/"))
  .filter((file) => !skip.has(file));

// Git Bash puts GNU tar (no zip support) first on PATH, so use Windows' own bsdtar there.
const tar =
  process.platform === "win32"
    ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe")
    : "tar";

rmSync(zipPath, { force: true });
const result = spawnSync(tar, ["-a", "-c", "-f", zipPath, "-C", distDir, ...files], {
  stdio: "inherit",
});
if (result.error) throw result.error;
if (result.status !== 0) {
  console.error(`Zip failed (tar exit code ${result.status}).`);
  process.exit(result.status ?? 1);
}

const size = (statSync(zipPath).size / 1024).toFixed(0);
console.log(`dist.zip: ${files.length} files, ${size} KB.`);
console.log("Upload it into public_html in cPanel File Manager, then right-click -> Extract.");
