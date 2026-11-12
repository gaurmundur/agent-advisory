# hjalti-vefur

Personal site for Hjalti Unnar Ágústsson, AI consulting in Reykjavík.
Built with **Astro 6**, **Tailwind CSS 4** and **MDX**. Every page is pre-rendered to static HTML,
so it can be hosted for free on Cloudflare or on any ordinary web host.

Languages: Icelandic (default, at `/`), English (`/en/`), Danish (`/da/`), Polish (`/pl/`).

## Quick start

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev        # http://localhost:4321, reloads on save
```

| Command                   | What it does                                                     |
| ------------------------- | ---------------------------------------------------------------- |
| `npm run dev`             | Local dev server. Draft articles are visible here only.          |
| `npm run build`           | Type-checks, then builds the site into `dist/`.                  |
| `npm run preview`         | Serves `dist/` the way Cloudflare will (needs a build).          |
| `npm run deploy`          | Builds and deploys to Cloudflare Workers.                        |
| `npm run deploy:scaleway` | Builds and uploads `dist/` to Scaleway over FTPS (needs `.env`). |
| `npm run format`          | Formats every file with Prettier (sorts Tailwind classes too).   |

## Where to change things

| I want to change...                   | Edit                                         |
| ------------------------------------- | -------------------------------------------- |
| Any text on the home page             | `src/content/home/<language>.yaml`           |
| Text on the tech page (`/tekni/`)     | `src/content/tech/<language>.yaml`           |
| Email, booking link, domain, keywords | `src/config/site.ts`                         |
| Colours                               | `src/styles/global.css`                      |
| Fonts                                 | `fonts` in `astro.config.ts`                 |
| The layout of one section             | `src/components/home/<Name>Section.astro`    |
| Add an article                        | `src/content/articles/<language>/<slug>.mdx` |
| Add a language                        | `src/i18n/locales.ts` + a new YAML file      |

How the project is organised, and the naming rules, are in
**[docs/project-structure.md](docs/project-structure.md)**. Read that before adding files.

## Before going live

1. Set the real domain in `src/config/site.ts` (`url`). Canonical links, hreflang, the sitemap
   and `robots.txt` all read it from there.
2. Have native speakers proof-read the Danish and Polish text.
3. Replace the "HU" portrait placeholder in `src/components/home/AboutSection.astro` with a photo.
4. Add an Open Graph image (1200×630) and submit `sitemap-index.xml` in Google Search Console.

## Hosting

The build output in `dist/` is plain HTML, CSS, JS and fonts. No server code.

**Cloudflare Workers (recommended, free):** once the GitHub repo is connected to Cloudflare, every
push to `main` builds and deploys the site, and every other branch gets its own preview URL.
Set it up once in the Cloudflare dashboard: Workers & Pages → Create → Import a repository →
pick `agent-advisory`, keep the Worker name `agent-advisory` (it must match `name` in
`wrangler.jsonc`), build command `npm run build`, deploy command `npx wrangler deploy`.
Settings are in `wrangler.jsonc`; response headers are in `public/_headers`.
To deploy by hand from your own computer instead: `npx wrangler login` once, then `npm run deploy`.

**Any other web host (cPanel, Scaleway web hosting, etc.):** run `npm run build` and upload the
_contents_ of `dist/` into `public_html/`. `public/.htaccess` sets the 404 page and caching on Apache.

**Scaleway web hosting, by hand:** `npm run zip` builds the site and writes `dist.zip`. In cPanel
File Manager, upload it into `public_html/`, right-click it, choose Extract, then delete the zip.

**Scaleway web hosting, one command (currently blocked: Scaleway's FTP passive ports do not answer):** copy `.env.example` to `.env` and fill in the FTP details
from cPanel, then run `npm run deploy:scaleway`. It builds the site and uploads `dist/` to
`public_html/` over encrypted FTP (FTPS) with curl. Files are added or overwritten, never deleted.
`node scripts/deploy-ftp.mjs --dry-run` lists what would be uploaded without uploading.

Costs: Cloudflare's free plan serves static sites with unlimited requests. The only fixed cost
is the domain name.
