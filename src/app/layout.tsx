import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { locales, resolveLocale } from '@/lib/i18n';
import { socialLinks } from '@/lib/contact';
import { isLocalizedPath, localeUrl, siteUrl } from '@/lib/site';
import { Barlow, Merienda } from 'next/font/google';
import './globals.css';
const barlow = Barlow({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-barlow', display: 'swap' });
const merienda = Merienda({ subsets: ['latin', 'latin-ext'], weight: ['400', '600', '700'], variable: '--font-merienda', display: 'swap' });
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'Oddly | Consultoría de marketing para mejorar tus ventas',
  description: 'Evaluamos tu empresa y recomendamos estrategias de marketing adaptadas a tu negocio para ayudarte a mejorar tus ventas.',
  openGraph: { title: 'Oddly | Marketing pensado para vender mejor', description: 'Asesoría de marketing que empieza por entender tu empresa.', locale: 'es', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Oddly | Marketing pensado para vender mejor', description: 'Asesoría de marketing que empieza por entender tu empresa.' },
};
// Organization JSON-LD so search engines link the social profiles to the brand. `<` is escaped to keep the JSON inert inside <script>.
const organizationJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Oddly', url: siteUrl.href, sameAs: socialLinks.map(link => link.href) }).replace(/</g, '\\u003c');
const themeScript = `(function(){try{var t=localStorage.getItem('oddly-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;
// The loading intro plays on a regular visit to the home; deep links, reduced motion and language switches open the page directly.
// If the intro never starts, the page shows itself after 6s. /links only draws its isotype (data-links-intro), shown as is after 3s.
const introScript = `(function(){var d=document.documentElement,skip=false,p=location.pathname;try{skip=sessionStorage.getItem('oddly-intro')==='skip';sessionStorage.removeItem('oddly-intro')}catch(e){}if(skip||matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(p==='/links'){d.dataset.linksIntro='pending';setTimeout(function(){delete d.dataset.linksIntro},3000);return}if(p!=='/'||location.hash)return;d.dataset.intro='pending';try{history.scrollRestoration='manual'}catch(e){}setTimeout(function(){if(d.dataset.intro==='pending')delete d.dataset.intro},6000)})()`;
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get('x-oddly-locale'));
  // Canonical and hreflang links only for the localized pages; the path comes from the middleware.
  const path = requestHeaders.get('x-oddly-path');
  const localizedPath = isLocalizedPath(path) ? path : null;
  return <html lang={locale} data-theme="light" className={`${barlow.variable} ${merienda.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /><script dangerouslySetInnerHTML={{ __html: introScript }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} />{localizedPath && <><link rel="canonical" href={localeUrl(locale, localizedPath)} />{locales.map(code => <link key={code} rel="alternate" hrefLang={code} href={localeUrl(code, localizedPath)} />)}<link rel="alternate" hrefLang="x-default" href={localeUrl('es', localizedPath)} /></>}</head><body>{children}</body></html>;
}
