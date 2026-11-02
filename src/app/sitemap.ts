import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { localeUrl } from '@/lib/site';

// One page in three languages: each language version is listed with its alternates (?lang=es|en|pt).
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map(locale => [locale, localeUrl(locale)]));
  return locales.map(locale => ({
    url: languages[locale],
    changeFrequency: 'monthly',
    priority: locale === 'es' ? 1 : 0.8,
    alternates: { languages },
  }));
}
