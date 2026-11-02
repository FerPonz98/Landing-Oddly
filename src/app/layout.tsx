import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/i18n';
import { socialLinks } from '@/lib/contact';
import { Barlow, Merienda } from 'next/font/google';
import './globals.css';
const barlow = Barlow({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-barlow', display: 'swap' });
const merienda = Merienda({ subsets: ['latin', 'latin-ext'], weight: ['400', '600', '700'], variable: '--font-merienda', display: 'swap' });
const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
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
// The loading intro plays on a regular visit; deep links, reduced motion and language switches open the page directly.
// If the intro never starts, the page shows itself after 6s.
const introScript = `(function(){var d=document.documentElement,skip=false;try{skip=sessionStorage.getItem('oddly-intro')==='skip';sessionStorage.removeItem('oddly-intro')}catch(e){}if(skip||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.intro='pending';try{history.scrollRestoration='manual'}catch(e){}setTimeout(function(){if(d.dataset.intro==='pending')delete d.dataset.intro},6000)})()`;
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocale((await headers()).get('x-oddly-locale'));
  return <html lang={locale} data-theme="light" className={`${barlow.variable} ${merienda.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /><script dangerouslySetInnerHTML={{ __html: introScript }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} /></head><body>{children}</body></html>;
}
