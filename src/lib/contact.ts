import { getTranslator, type Locale } from "./i18n";
export const whatsappMessage =
  "Hola Oddly, quiero conocer cómo su asesoría de marketing puede ayudar a mejorar las ventas de mi empresa.";
export const oddlyWhatsAppNumber = "59177351263";

export function getWhatsAppHref(
  rawNumber?: string,
  locale: Locale = "es",
): string | undefined {
  const number = (rawNumber || "").replace(/\D/g, "");
  if (!/^\d{8,15}$/.test(number)) return undefined;
  return `https://wa.me/${number}?text=${encodeURIComponent(getTranslator(locale)(whatsappMessage))}`;
}

// Redes sociales de Oddly: cambiar aquí las URLs actualiza los íconos del footer, del menú móvil y el JSON-LD.
export const socialLinks = [
<<<<<<< HEAD
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/oddly-marketing-a51223448/",
  },
  { name: "Instagram", href: "https://www.instagram.com/oddly_bo/" },
  { name: "TikTok", href: "https://www.tiktok.com/@oddly_bo" },
] as const;
export type SocialNetwork = (typeof socialLinks)[number]["name"];
=======
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/oddly-marketing-a51223448/' },
  { name: 'Instagram', href: 'https://www.instagram.com/oddly_bo/' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@oddly_bo' },
] as const;
export type SocialNetwork = typeof socialLinks[number]['name'];
>>>>>>> d277b4c32402ce265daed9e4027866cb25dbb751
