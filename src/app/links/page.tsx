import type { Metadata } from 'next';
import { headers } from 'next/headers';
import LinksPage from '@/components/LinksPage';
import { getTranslator, locales, resolveLocale } from '@/lib/i18n';
import { localeUrl } from '@/lib/site';

const ogLocales = { es: 'es_BO', en: 'en_US', pt: 'pt_BR' } as const;
async function getLocale() { return resolveLocale((await headers()).get('x-oddly-locale')); }

// Link-in-bio page (oddly.com.bo/links). Its Open Graph image is opengraph-image.png next to this file.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getTranslator(locale);
  const title = t('Oddly | Links'), description = t('Diagnóstico express, WhatsApp, redes sociales y todo Oddly en un solo lugar.');
  return {
    title,
    description,
    openGraph: { title, description, url: localeUrl(locale, '/links'), siteName: 'Oddly', locale: ogLocales[locale], alternateLocale: locales.filter(code => code !== locale).map(code => ogLocales[code]), type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}
export default async function Links() { return <LinksPage locale={await getLocale()} />; }
