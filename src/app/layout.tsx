import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/i18n';
import { Barlow, Merienda } from 'next/font/google';
import './globals.css';
const barlow = Barlow({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-barlow', display: 'swap' });
const merienda = Merienda({ subsets: ['latin', 'latin-ext'], weight: ['400', '600', '700'], variable: '--font-merienda', display: 'swap' });
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Oddly | Consultoría de marketing para mejorar tus ventas',
  description: 'Evaluamos tu empresa y recomendamos estrategias de marketing adaptadas a tu negocio para ayudarte a mejorar tus ventas.',
  openGraph: { title: 'Oddly | Marketing pensado para vender mejor', description: 'Asesoría de marketing que empieza por entender tu empresa.', locale: 'es', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Oddly | Marketing pensado para vender mejor', description: 'Asesoría de marketing que empieza por entender tu empresa.' },
};
const themeScript = `(function(){try{var t=localStorage.getItem('oddly-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocale((await headers()).get('x-oddly-locale'));
  return <html lang={locale} data-theme="light" className={`${barlow.variable} ${merienda.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
