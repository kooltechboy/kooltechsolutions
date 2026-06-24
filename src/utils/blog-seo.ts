/**
 * Blog SEO utilities for bilingual (EN/ES) blog support.
 * Generates hreflang tags, canonical URLs, and alternate language URLs.
 */

const SITE_URL = "https://kooltechsolutions.com";

interface BlogPost {
  slug: string;
  lang: string;
  translated_from?: string | null;
}

interface CounterpartPost {
  slug: string;
  lang: string;
}

/**
 * Returns the full canonical URL for a blog post based on its language.
 */
export function getBlogCanonicalUrl(post: BlogPost): string {
  if (post.lang === "es") {
    return `${SITE_URL}/es/blog/${post.slug}`;
  }
  return `${SITE_URL}/blog/${post.slug}`;
}

/**
 * Returns the URL for the alternate language version of a post.
 * Returns null if no counterpart exists.
 */
export function getAlternateLanguageUrl(
  post: BlogPost,
  counterpart: CounterpartPost | null
): string | null {
  if (!counterpart) return null;
  if (counterpart.lang === "es") {
    return `${SITE_URL}/es/blog/${counterpart.slug}`;
  }
  return `${SITE_URL}/blog/${counterpart.slug}`;
}

/**
 * Generates the hreflang metadata alternates object for Next.js generateMetadata().
 * Returns the `alternates` object with canonical and languages fields.
 */
export function getBlogHreflangAlternates(
  post: BlogPost,
  counterpart: CounterpartPost | null
) {
  const canonical = getBlogCanonicalUrl(post);
  const enUrl =
    post.lang === "en"
      ? canonical
      : counterpart
        ? `${SITE_URL}/blog/${counterpart.slug}`
        : null;
  const esUrl =
    post.lang === "es"
      ? canonical
      : counterpart
        ? `${SITE_URL}/es/blog/${counterpart.slug}`
        : null;

  const languages: Record<string, string> = {};
  if (enUrl) languages.en = enUrl;
  if (esUrl) languages.es = esUrl;
  // x-default points to English (or whichever is the primary)
  if (enUrl) languages["x-default"] = enUrl;

  return {
    canonical,
    languages: Object.keys(languages).length > 0 ? languages : undefined,
  };
}

/**
 * Generates the `inLanguage` value for JSON-LD structured data.
 */
export function getJsonLdLanguage(lang: string): string {
  return lang === "es" ? "es" : "en";
}

/**
 * Returns the OpenGraph locale string for a given language.
 */
export function getOgLocale(lang: string): string {
  return lang === "es" ? "es_LA" : "en_US";
}
