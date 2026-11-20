import { getTranslator, type Locale } from "./i18n";
export const whatsappMessage =
  "Hola Oddly, quiero conocer cómo su asesoría de marketing puede ayudar a mejorar las ventas de mi empresa.";
export const oddlyWhatsAppNumber = "59177351263";
// Formulario del Diagnóstico express (Google Forms): cambiar aquí el enlace actualiza /links.
export const diagnosticFormUrl = "https://forms.gle/5rAr6CQv9zEtypii7";
// App de fidelización Mi Tarjeta.
export const miTarjetaUrl = "https://mitarjeta.oddly.com.bo";
// Mostrar el botón de Mi Tarjeta en /links: cambiar a true para volver a mostrarlo.
export const showMiTarjeta = false;

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
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/oddly-marketing-a51223448/",
  },
  { name: "Instagram", href: "https://www.instagram.com/oddly_bo/" },
  { name: "TikTok", href: "https://www.tiktok.com/@oddly_bo" },
] as const;
export type SocialNetwork = (typeof socialLinks)[number]["name"];
