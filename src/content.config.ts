// Content collections: the "model" layer. Each collection has a schema, so a typo
// in a content file fails the build instead of shipping a broken page.
// Docs: https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const text = z.string().min(1);

/** Home page text, one YAML file per language: src/content/home/<locale>.yaml */
const home = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/home" }),
  schema: z.object({
    meta: z.object({ title: text, description: text, ogLocale: text, offerName: text }),
    nav: z.object({ services: text, about: text, contact: text, blog: text, languageLabel: text }),
    /** Links on article pages: breadcrumb, previous/next article, back to the list and home. */
    articleNav: z.object({
      label: text,
      home: text,
      allArticles: text,
      previous: text,
      next: text,
    }),
    hero: z.object({ title: text, lead: text, cta: text }),
    diagram: z.object({
      ariaLabel: text,
      task: text,
      main: text,
      sub1: text,
      sub2: text,
      sub3: text,
      result: text,
    }),
    services: z.object({
      eyebrow: text,
      heading: text,
      agents: z.object({
        kicker: text,
        heading: text,
        body: text,
        points: z.array(text),
        tree: z.object({
          comment: text,
          root: text,
          steps: z.array(z.object({ name: text, note: text })),
          result: text,
        }),
      }),
      setup: z.object({
        kicker: text,
        heading: text,
        body: text,
        matches: z.array(z.object({ task: text, kind: text, fit: text })),
        caption: text,
      }),
      training: z.object({
        kicker: text,
        heading: text,
        body: text,
        points: z.array(text),
        prompt: z.object({ beforeLabel: text, before: text, afterLabel: text, after: text }),
      }),
      also: z.object({ label: text, text }),
    }),
    process: z.object({
      eyebrow: text,
      heading: text,
      intro: text,
      steps: z.array(z.object({ title: text, text })),
    }),
    about: z.object({
      eyebrow: text,
      portraitAlt: text,
      quote: text,
      bio: text,
      facts: z.array(z.object({ value: text, label: text })),
    }),
    faq: z.object({
      eyebrow: text,
      heading: text,
      items: z.array(z.object({ question: text, answer: text })),
    }),
    contact: z.object({
      heading: text,
      body: text,
      book: text,
      bookNote: text,
      or: text,
      copy: text,
      copied: text,
      selected: text,
    }),
  }),
});

/** Articles in MDX: src/content/articles/<locale>/<slug>.mdx */
const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: text,
    description: text,
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** Same value in every translation of one article, so the languages link to each other. */
    translationKey: z.string().min(1).optional(),
    /** Drafts are built in `npm run dev` only, never published. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { home, articles };
