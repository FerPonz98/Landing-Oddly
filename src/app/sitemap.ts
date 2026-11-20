import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { localeUrl, localizedPaths } from '@/lib/site';

// Each page in three languages: every language version is listed with its alternates (?lang=es|en|pt).
export default function sitemap(): MetadataRoute.Sitemap {
  return localizedPaths.flatMap(path => {
    const languages = Object.fromEntries(locales.map(locale => [locale, localeUrl(locale, path)]));
    return locales.map(locale => ({
      url: languages[locale],
      changeFrequency: 'monthly' as const,
      priority: (path === '/' ? 1 : .6) * (locale === 'es' ? 1 : .8),
      alternates: { languages },
    }));
  });
}
