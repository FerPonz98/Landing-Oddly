import { InstagramLogo, LinkedinLogo, TiktokLogo } from '@phosphor-icons/react/dist/ssr';
import { socialLinks, type SocialNetwork } from '@/lib/contact';
import { getTranslator, type Locale } from '@/lib/i18n';

const socialIcons = { LinkedIn: LinkedinLogo, Instagram: InstagramLogo, TikTok: TiktokLogo } satisfies Record<SocialNetwork, unknown>;

// Social profile icons, shared by the footer and the mobile menu panel; the links live in socialLinks (src/lib/contact.ts).
export default function SocialLinks({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  return <ul className="social-links" aria-label={t('Redes sociales de Oddly')}>{socialLinks.map(({ name, href }) => {
    const Icon = socialIcons[name];
    return <li key={name}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={t(`Oddly en ${name}`)}><Icon size={20} aria-hidden="true" /></a></li>;
  })}</ul>;
}
