// Uploads the contents of dist/ to the web host over FTPS (Scaleway web hosting / cPanel).
//
// Usage:  npm run deploy:scaleway             (builds, then uploads)
//         node scripts/deploy-ftp.mjs --dry-run   (lists what would be uploaded, uploads nothing)
//
// Credentials are read from .env in the project root (see .env.example). .env is git-ignored.
// Uses the curl that ships with Windows 10+, macOS and Linux, so no extra npm package is needed.
// Files are added or overwritten; nothing is deleted on the server.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";

const root = join(import.meta.dirname, "..");
const distDir = join(root, "dist");
const dryRun = process.argv.includes("--dry-run");

if (existsSync(join(root, ".env"))) process.loadEnvFile(join(root, ".env"));

const host = process.env.FTP_HOST;
const user = process.env.FTP_USER;
const password = process.env.FTP_PASSWORD;
const remoteDir = (process.env.FTP_REMOTE_DIR ?? "public_html").replace(/^\/+|\/+$/g, "");
const secure = process.env.FTP_SECURE !== "false";

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
  .map((path) => ({
    local: path.split(sep).join("/"),
    remote: relative(distDir, path).split(sep).join("/"),
  }))
  .filter((file) => !skip.has(file.remote));

const target = `${secure ? "ftps (explicit TLS)" : "ftp"}://${host ?? "<FTP_HOST>"}/${remoteDir ? `${remoteDir}/` : ""}`;
console.log(`${files.length} files from dist/ -> ${target}`);

if (dryRun) {
  for (const file of files) console.log(`  ${file.remote}`);
  console.log("Dry run: nothing was uploaded.");
  process.exit(0);
}

const missing = ["FTP_HOST", "FTP_USER", "FTP_PASSWORD"].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(
    `Missing in .env: ${missing.join(", ")}. Copy .env.example to .env and fill it in.`,
  );
  process.exit(1);
}

/** Quotes a value for a curl config file. */
const quote = (value) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

const config = [
  `user = ${quote(`${user}:${password}`)}`,
  "ftp-create-dirs",
  "show-error",
  "silent",
  "retry = 2",
  "fail-early",
  ...(secure ? ["ssl-reqd"] : []),
  ...files.flatMap((file) => [
    `upload-file = ${quote(file.local)}`,
    `url = ${quote(`ftp://${host}/${encodePath(remoteDir ? `${remoteDir}/${file.remote}` : file.remote)}`)}`,
  ]),
].join("\n");

// The config holds the password, so it lives in the OS temp folder only while curl runs.
const configPath = join(tmpdir(), `deploy-ftp-${process.pid}.curlrc`);
writeFileSync(configPath, config, { mode: 0o600 });
let result;
try {
  result = spawnSync("curl", ["--config", configPath], { stdio: "inherit" });
} finally {
  rmSync(configPath, { force: true });
}
if (result.error) throw result.error;
if (result.status !== 0) {
  console.error(`Upload failed (curl exit code ${result.status}).`);
  process.exit(result.status ?? 1);
}

console.log("Upload complete.");
