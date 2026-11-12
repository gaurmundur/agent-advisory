// Astro configuration. Docs: https://docs.astro.build/en/reference/configuration-reference/
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

import { site } from "./src/config/site";
import rehypeTableLabels from "./src/lib/rehype-table-labels";
import { defaultLocale, locales } from "./src/i18n/locales";

// Character ranges for the two font subsets. Latin covers Icelandic, English and Danish;
// Latin Extended adds the Polish letters (ą, ć, ę, ł, ń, ś, ź, ż).
const latin = [
  "U+0000-00FF",
  "U+0131",
  "U+0152-0153",
  "U+02BB-02BC",
  "U+02C6",
  "U+02DA",
  "U+02DC",
  "U+0304",
  "U+0308",
  "U+0329",
  "U+2000-206F",
  "U+20AC",
  "U+2122",
  "U+2191",
  "U+2193",
  "U+2212",
  "U+2215",
  "U+FEFF",
  "U+FFFD",
] as [string, ...string[]];
const latinExt = [
  "U+0100-02BA",
  "U+02BD-02C5",
  "U+02C7-02CC",
  "U+02CE-02D7",
  "U+02DD-02FF",
  "U+0304",
  "U+0308",
  "U+0329",
  "U+1D00-1DBF",
  "U+1E00-1E9F",
  "U+1EF2-1EFF",
  "U+2020",
  "U+20A0-20AB",
  "U+20AD-20C0",
  "U+2113",
  "U+2C60-2C7F",
  "U+A720-A7FF",
] as [string, ...string[]];

/** One @font-face for a variable font file in src/assets/fonts/. */
function localFont(file: string, weight: string, unicodeRange: [string, ...string[]]) {
  return {
    src: [`./src/assets/fonts/${file}.woff2`] as [string],
    weight,
    style: "normal" as const,
    unicodeRange,
  };
}

export default defineConfig({
  site: site.url,
  // Every page is pre-rendered to plain HTML, so Cloudflare only serves static files.
  output: "static",
  trailingSlash: "always",
  i18n: {
    defaultLocale,
    locales: [...locales],
    // Icelandic lives at "/", the other languages at "/en/", "/da/", "/pl/".
    routing: { prefixDefaultLocale: false },
  },
  // Fonts: Astro's Fonts API self-hosts them, adds fallback metrics and preloads them.
  // The .woff2 files live in src/assets/fonts/, so the build needs no network.
  // Docs: https://docs.astro.build/en/guides/fonts/
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Plus Jakarta Sans",
      cssVariable: "--font-jakarta",
      fallbacks: ["Arial", "system-ui", "sans-serif"],
      options: {
        variants: [
          localFont("plus-jakarta-sans-latin-wght-normal", "200 800", latin),
          localFont("plus-jakarta-sans-latin-ext-wght-normal", "200 800", latinExt),
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains",
      fallbacks: ["ui-monospace", "Menlo", "Consolas", "monospace"],
      options: {
        variants: [
          localFont("jetbrains-mono-latin-wght-normal", "100 800", latin),
          localFont("jetbrains-mono-latin-ext-wght-normal", "100 800", latinExt),
        ],
      },
    },
  ],
  integrations: [
    // Tables get column names on each cell, for the phone layout in Table.astro.
    mdx({ rehypePlugins: [rehypeTableLabels] }),
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map((locale) => [locale, locale])),
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
