// The one list of languages the site is published in.
// To add a language: add it here, add its flag in src/components/layout/Flag.astro,
// then add src/content/home/<code>.yaml.

export const locales = ["is", "en", "da", "pl"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "is";

/** label: short code on the switch button. name: the language's own name, in the dropdown. */
export const localeInfo: Record<Locale, { label: string; name: string; ogLocale: string }> = {
  is: { label: "IS", name: "Íslenska", ogLocale: "is_IS" },
  en: { label: "EN", name: "English", ogLocale: "en_GB" },
  da: { label: "DA", name: "Dansk", ogLocale: "da_DK" },
  pl: { label: "PL", name: "Polski", ogLocale: "pl_PL" },
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** URL path for a page in a given language: localePath("en", "/blog/x/") -> "/en/blog/x/". */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}

/** Route param for [...locale] pages: undefined for the default language, so it lives at "/". */
export function localeParam(locale: Locale): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}
