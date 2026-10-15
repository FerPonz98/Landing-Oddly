import type { Metadata } from 'next';
import { headers } from 'next/headers';
import OddlyLanding from '@/components/OddlyLanding';
import { getTranslator, resolveLocale } from '@/lib/i18n';
async function getLocale() { return resolveLocale((await headers()).get('x-oddly-locale')); }
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getTranslator(locale);
  return {
    title: t('Oddly | Consultoría de marketing para mejorar tus ventas'),
    description: t('Evaluamos tu empresa y recomendamos estrategias de marketing adaptadas a tu negocio para ayudarte a mejorar tus ventas.'),
    alternates: { canonical: `/?lang=${locale}`, languages: { es: '/?lang=es', en: '/?lang=en', pt: '/?lang=pt', 'x-default': '/?lang=es' } },
    openGraph: { title: t('Oddly | Marketing pensado para vender mejor'), description: t('Asesoría de marketing que empieza por entender tu empresa.'), locale: { es: 'es_BO', en: 'en_US', pt: 'pt_BR' }[locale], alternateLocale: ['es_BO', 'en_US', 'pt_BR'].filter(code => code !== { es: 'es_BO', en: 'en_US', pt: 'pt_BR' }[locale]), type: 'website' },
    twitter: { card: 'summary_large_image', title: t('Oddly | Marketing pensado para vender mejor'), description: t('Asesoría de marketing que empieza por entender tu empresa.') },
  };
}
export default async function Home() { return <OddlyLanding locale={await getLocale()} />; }
