import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/i18n';
import localFont from 'next/font/local';
import './globals.css';
const manrope = localFont({
  src: [
    { path: './fonts/manrope-regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/manrope-medium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/manrope-semibold.ttf', weight: '600', style: 'normal' },
    { path: './fonts/manrope-bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-manrope', display: 'swap',
});
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
  return <html lang={locale} data-theme="light" className={manrope.variable} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
