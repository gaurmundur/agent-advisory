// Article lookups shared by the home page, the article list and the article pages.
import { type CollectionEntry, getCollection } from "astro:content";

import { type Locale, isLocale, localePath, locales } from "@/i18n/locales";

export type Article = CollectionEntry<"articles">;

/** Language of an article, from its folder: "is/my-post" -> "is". */
export function articleLocale(article: Article): Locale | undefined {
  const [locale] = article.id.split("/");
  return isLocale(locale) ? locale : undefined;
}

/** Slug of an article, without the language folder: "is/my-post" -> "my-post". */
export function articleSlug(article: Article): string {
  return article.id.split("/").slice(1).join("/");
}

/** URL path of an article: "/blog/my-post/" or "/en/blog/my-post/". */
export function articlePath(article: Article): string {
  const locale = articleLocale(article);
  if (!locale) throw new Error(`Article ${article.id} is not in a language folder`);
  return localePath(locale, `/blog/${articleSlug(article)}/`);
}

/** Articles that get built: everything in dev, only non-drafts in production. */
export function getVisibleArticles(): Promise<Article[]> {
  return getCollection("articles", (article) => import.meta.env.DEV || !article.data.draft);
}

/** One language's visible articles, newest first. */
export async function getArticlesFor(locale: Locale): Promise<Article[]> {
  const articles = await getVisibleArticles();
  return articles
    .filter((article) => articleLocale(article) === locale)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

/** Languages that have at least one visible article, so they get an article list. */
export async function getBlogLocales(): Promise<Locale[]> {
  const articles = await getVisibleArticles();
  return locales.filter((locale) => articles.some((article) => articleLocale(article) === locale));
}

/** URL path of each language's version of an article (the article itself included). */
export async function getTranslationPaths(
  article: Article,
): Promise<Partial<Record<Locale, string>>> {
  const key = article.data.translationKey;
  const articles = await getVisibleArticles();
  const translations = key
    ? articles.filter((other) => other.data.translationKey === key)
    : [article];
  return Object.fromEntries(
    translations.flatMap((translation) => {
      const locale = articleLocale(translation);
      return locale ? [[locale, articlePath(translation)]] : [];
    }),
  );
}

/** The article before (older) and after (newer) this one in the same language, if any. */
export async function getNeighbourArticles(
  article: Article,
): Promise<{ previous?: Article; next?: Article }> {
  const locale = articleLocale(article);
  if (!locale) return {};
  const articles = await getArticlesFor(locale); // newest first
  const index = articles.findIndex((other) => other.id === article.id);
  if (index === -1) return {};
  return { previous: articles[index + 1], next: articles[index - 1] };
}
