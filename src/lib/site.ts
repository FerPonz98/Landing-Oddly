import type { Locale } from './i18n';

// Public URL of the landing (NEXT_PUBLIC_SITE_URL, e.g. https://oddly.com.bo). It is inlined at build time;
// without it, metadata, robots.txt and the sitemap point to the local server.
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

// Absolute URL of each language version. Built by hand because Next's metadata `alternates` drops the query
// string when the path is `/`, which would collapse ?lang=es|en|pt into one URL.
export const localeUrl = (locale: Locale) => new URL(`/?lang=${locale}`, siteUrl).href;
