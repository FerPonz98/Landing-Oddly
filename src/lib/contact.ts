import { getTranslator, type Locale } from './i18n';
export const whatsappMessage = 'Hola Oddly, quiero conocer cómo su asesoría de marketing puede ayudar a mejorar las ventas de mi empresa.';
export const oddlyWhatsAppNumber = '59169634466';

export function getWhatsAppHref(rawNumber?: string, locale: Locale = 'es'): string | undefined {
  const number = (rawNumber || '').replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(number)) return undefined;
  return `https://wa.me/${number}?text=${encodeURIComponent(getTranslator(locale)(whatsappMessage))}`;
}
