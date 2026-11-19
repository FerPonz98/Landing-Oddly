import Image from 'next/image';
import { ArrowUpRight, CreditCard, GlobeSimple, InstagramLogo, LinkedinLogo, ListChecks, TiktokLogo, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { diagnosticFormUrl, getWhatsAppHref, miTarjetaUrl, oddlyWhatsAppNumber, socialLinks, type SocialNetwork } from '@/lib/contact';
import { getTranslator, type Locale } from '@/lib/i18n';
import { siteUrl } from '@/lib/site';
import LanguageSelect from './LanguageSelect';
import LinksMark from './LinksMark';
import ThemeToggle from './ThemeToggle';

type LinkItem = { href: string; label: string; icon: Icon; note?: string; featured?: boolean; external?: boolean; accessibleName?: string };

const socialIcons = { LinkedIn: LinkedinLogo, Instagram: InstagramLogo, TikTok: TiktokLogo } satisfies Record<SocialNetwork, Icon>;
// Order on /links; socialLinks (src/lib/contact.ts) keeps the URLs.
const socialOrder: SocialNetwork[] = ['Instagram', 'TikTok', 'LinkedIn'];

// The link-in-bio page for Instagram, TikTok and LinkedIn: no landing header, footer or floating WhatsApp button.
export default function LinksPage({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const whatsappHref = getWhatsAppHref(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || oddlyWhatsAppNumber, locale);
  const items: LinkItem[] = [
    { href: diagnosticFormUrl, label: t('Diagnóstico express'), note: t('Responde unas preguntas y te decimos por dónde empezar'), icon: ListChecks, featured: true, external: true },
    ...(whatsappHref ? [{ href: whatsappHref, label: t('Escríbenos por WhatsApp'), icon: WhatsappLogo, external: true }] : []),
    ...socialOrder.map(name => ({ href: socialLinks.find(link => link.name === name)!.href, label: name, accessibleName: t(`Oddly en ${name}`), icon: socialIcons[name], external: true })),
    // Same site: it opens in the same tab, and the landing keeps the language chosen here (oddly-language cookie).
    { href: siteUrl.href, label: t('Sitio web'), icon: GlobeSimple },
    { href: miTarjetaUrl, label: t('Mi Tarjeta: nuestra app de fidelización'), icon: CreditCard, external: true },
  ];
  return <div className="links-page">
    <div className="links-toolbar"><LanguageSelect locale={locale} path="/links" /><ThemeToggle locale={locale} /></div>
    <main className="links" id="contenido">
      <header className="links__header">
        <LinksMark />
        <h1 className="links__title"><span className="brand-logo brand-logo--links">
          <Image className="brand-logo__dark" src="/brand/oddly-dark.webp" alt="Oddly" width={120} height={84} priority />
          <Image className="brand-logo__light" src="/brand/oddly-light.webp" alt="Oddly" width={120} height={84} priority />
        </span></h1>
        <p className="links__tagline">{t('Marketing pensado para vender mejor')}</p>
      </header>
      <nav aria-label={t('Enlaces de Oddly')}>
        <ul className="links__list">{items.map(({ href, label, icon: ItemIcon, note, featured, external, accessibleName }, index) => {
          const noteId = note ? `links-note-${index}` : undefined;
          const name = accessibleName ?? label;
          return <li key={href} style={{ '--i': index } as React.CSSProperties}>
            <a className={`links__button${featured ? ' links__button--featured' : ''}`} href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${name}, ${t('se abre en una pestaña nueva')}` } : { 'aria-label': name })}
              aria-describedby={noteId}>
              <span className="links__icon"><ItemIcon size={featured ? 26 : 24} weight={featured ? 'fill' : 'regular'} aria-hidden="true" /></span>
              <span className="links__text"><span className="links__label">{label}</span>{note && <span className="links__note" id={noteId}>{note}</span>}</span>
              <ArrowUpRight className="links__arrow" size={20} aria-hidden="true" />
            </a>
          </li>;
        })}</ul>
      </nav>
    </main>
    <footer className="links__footer"><small>© Oddly · <a href={siteUrl.href}>{siteUrl.host}</a></small></footer>
  </div>;
}
