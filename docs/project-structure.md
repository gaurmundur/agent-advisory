# Project structure and naming

This guide explains where code lives, why, and what to call new files.
The short version: **content in `src/content/`, logic in `src/pages/`, looks in `src/components/`.**

## The folder tree

```text
hjalti-vefur/
├── astro.config.ts          Astro setup: site URL, languages, integrations
├── wrangler.jsonc           Cloudflare hosting config
├── package.json             Scripts and dependencies
├── tsconfig.json            TypeScript settings (strict) and the @/ import alias
├── docs/                    Guides like this one
├── public/                  Copied to the site as-is: favicon, _headers, .htaccess
└── src/
    ├── assets/
    │   └── fonts/           Font files (.woff2) + their licences, loaded by the Fonts API
    ├── config/
    │   └── site.ts          Facts that are the same in every language (email, URL, name)
    ├── content/             ── MODEL: the data ──
    │   ├── home/
    │   │   ├── is.yaml      All home-page text, one file per language
    │   │   ├── en.yaml
    │   │   ├── da.yaml
    │   │   └── pl.yaml
    │   ├── tech/
    │   │   └── is.yaml      Tech page text (/tekni/), one file per language
    │   └── articles/
    │       └── is/
    │           └── daemi-um-grein.mdx
    ├── content.config.ts    Schemas: the shape every content file must have
    ├── i18n/
    │   └── locales.ts       The list of languages and URL helpers
    ├── lib/                 Small plain TypeScript helpers, no HTML
    ├── pages/               ── CONTROLLERS: one file per URL ──
    │   ├── [...locale]/
    │   │   ├── index.astro          /  /en/  /da/  /pl/
    │   │   └── blog/[slug].astro    /blog/<slug>/  /en/blog/<slug>/ ...
    │   ├── 404.astro
    │   └── robots.txt.ts
    ├── layouts/             ── VIEWS: page frames ──
    │   ├── BaseLayout.astro     <html>, <head>, fonts, global CSS
    │   └── ArticleLayout.astro  Frame for MDX articles
    ├── components/          ── VIEWS: building blocks ──
    │   ├── layout/          Site-wide: SiteHeader, SiteFooter, LanguageSwitch, SeoHead
    │   ├── home/            Home page sections and their parts
    │   └── ui/              Generic pieces: ButtonLink, SectionHeading
    └── styles/
        └── global.css       Tailwind and colour tokens
```

## How it maps to model / view / controller

Astro is not an MVC framework, but the same separation keeps this project tidy:

| Role           | Folder                                                 | Rule of thumb                                                                                    |
| -------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Model**      | `src/content/`, `src/content.config.ts`, `src/config/` | Data and its schema. No HTML. Edit text here, never inside components.                           |
| **Controller** | `src/pages/`                                           | One file per URL. Decides which language and which data, then passes it to views. Keep it short. |
| **View**       | `src/layouts/`, `src/components/`                      | Receives data through props and renders it. Never loads content itself, never hard-codes text.   |
| Helpers        | `src/lib/`, `src/i18n/`                                | Plain functions shared by the above.                                                             |

Following the request for the Polish home page, step by step:

1. `src/pages/[...locale]/index.astro` gets `locale = "pl"` from the URL `/pl/`.
2. It loads `src/content/home/pl.yaml` (checked against the schema in `content.config.ts`).
3. It passes each part to a section: `<FaqSection faq={content.faq} />`.
4. `FaqSection.astro` renders whatever questions it is given, in whatever language.

Because of that split, a new language never touches a component, and a design change never touches text.

## Naming rules

| What                        | Style                                   | Examples                                                       |
| --------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| Components and layouts      | `PascalCase.astro`                      | `ContactSection.astro`, `ButtonLink.astro`, `BaseLayout.astro` |
| Page sections               | `<Topic>Section.astro`                  | `HeroSection`, `ProcessSection`                                |
| Layouts                     | `<Kind>Layout.astro`                    | `BaseLayout`, `ArticleLayout`                                  |
| Pages (routes)              | `kebab-case`, lower case                | `404.astro`, `robots.txt.ts`, `blog/[slug].astro`              |
| Dynamic route segments      | `[name]`, `[...name]` for optional      | `[slug]`, `[...locale]`                                        |
| TypeScript helpers          | `kebab-case.ts`                         | `inline-markup.ts`, `escape-html.ts`                           |
| Content entries             | `kebab-case`, ASCII only                | `hvad-er-fulltrui.mdx` (not `hvað-er-fulltrúi.mdx`)            |
| Language files              | ISO 639-1 code                          | `is.yaml`, `en.yaml`, `da.yaml`, `pl.yaml`                     |
| Folders                     | `kebab-case`, lower case                | `components/home`, `content/articles`                          |
| Props, variables, functions | `camelCase`                             | `bookingUrl`, `localePath()`                                   |
| Types                       | `PascalCase`                            | `Locale`, `InlinePart`                                         |
| Constants lists             | `camelCase`                             | `locales`, `defaultLocale`                                     |
| YAML keys                   | `camelCase`, English                    | `bookNote`, `portraitAriaLabel`                                |
| Section anchors (`id`)      | short, Icelandic, same in all languages | `#thjonusta`, `#um`, `#samband`                                |

Why these:

- **PascalCase for components** is how Astro, React and Vue name them; it also makes `<ButtonLink />` read differently from an HTML tag.
- **kebab-case for anything that becomes a URL**, because URLs are case-sensitive on most hosts and lower case is what people type.
- **ASCII slugs**: `ð`, `þ`, `æ` become `%C3%B0` in links that people copy. Write `d`, `th`, `ae`, and drop accents.
- **English code, Icelandic content**: code names stay English so any developer (or AI tool) can read them; everything a visitor sees comes from the content files.
- **Name by what it is, not where it is used**: `ButtonLink`, not `HeroButton`. A component in `ui/` must not know about the home page.

## Where does a new file go?

- Used on one page only → `src/components/<page>/`.
- Used on every page (header, footer) → `src/components/layout/`.
- Generic and reusable anywhere (button, heading) → `src/components/ui/`.
- A function with no HTML → `src/lib/`.
- Text a visitor reads → a content file, never a component.

If a component file grows past ~150 lines or does two jobs, split it, like `ServicesSection` uses `ServiceRow`, `AgentTree`, `ModelMatchTable` and `PromptComparison`.

## Styling with Tailwind

- Style with Tailwind classes in the markup. `npm run format` sorts them in a fixed order.
- Colours come from tokens in `src/styles/global.css`: `bg-navy`, `text-muted`, `border-line`, `text-accent`, `bg-gold`. Never write a hex colour in a component; add a token instead.
- Dark mode is automatic: tokens swap value under `prefers-color-scheme: dark`, so there are no `dark:` classes.
- Breakpoints match the original design: `sm:` from 481px (past phones), `md:` from 821px (desktop). Write mobile first, then add `sm:` / `md:`.
- Text styles used in several places are custom utilities: `eyebrow`, `heading-2`, `heading-3`.
- Yellow (`gold`) is an accent. Keep it to one or two places per screen.
- Use a `<style>` block only for things Tailwind can't express cleanly, like styling MDX output (see `ArticleLayout.astro`).

## Content and translations

- Every `src/content/home/*.yaml` must have exactly the same keys. The build fails if one is missing, so a half-translated file can't go live.
- Simple markup inside YAML strings:
  - `*word*` highlights a word in the hero title (the yellow underline).
  - `**text**` highlights text in the prompt example.
  - A line break (`\n`) becomes a `<br>`.
- Terms: erindreki (agent), undirerindreki (subagent), færni (skills), fyrirmæli (prompt), líkan (model).
- The home page avoids these terms and talks about what AI does for a business (aðstoðarmaður for an agent). The technical terms live on the tech page.

### Add a language

1. Add the code to `locales` and `localeInfo` in `src/i18n/locales.ts`.
2. Copy `src/content/home/en.yaml` and `src/content/tech/en.yaml` to `<code>.yaml` and translate them.
3. Build. The page, the switch button, hreflang links and the sitemap update by themselves.

### Write an article

1. Copy `src/content/articles/is/daemi-um-grein.mdx` to `src/content/articles/<language>/<slug>.mdx`.
2. Fill in `title`, `description`, `publishedAt`. Keep `draft: true` while writing; drafts show in `npm run dev` only.
3. Set `draft: false` to publish at `/blog/<slug>/` (or `/en/blog/<slug>/` and so on).

MDX is Markdown that can also use components: `import ButtonLink from "@/components/ui/ButtonLink.astro";` at the top, then `<ButtonLink href="...">Text</ButtonLink>` in the text.

## Imports

Use the `@/` alias for anything in `src/`: `import SiteHeader from "@/components/layout/SiteHeader.astro";`
Group imports: Astro and packages first, then `@/` imports, alphabetically.

## Every component starts the same way

```astro
---
// One line on what this component shows.
import ...

interface Props {
  heading: string;
  items: { title: string; text: string }[];
}

const { heading, items } = Astro.props;
---

<section>...</section>
```

Typed `Props` mean `npm run build` catches a missing or misspelt prop before it ships.

## Fonts

Fonts use Astro's built-in Fonts API (`fonts` in `astro.config.ts`). The files are in `src/assets/fonts/`;
Astro serves them from the site itself, preloads them and generates size-matched fallbacks so text
doesn't jump while they load. Tailwind's `font-sans` and `font-mono` point at the CSS variables it creates.

## Hosting rules

- The site stays fully static (`output: "static"`). No server adapter, so the same `dist/` folder works on Cloudflare and on any ordinary web host.
- Add the Cloudflare adapter only when the site needs server code (a contact form that sends mail, for example), and only for that route.
