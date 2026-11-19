'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import LanguageSelect from './LanguageSelect';
import SocialLinks from './SocialLinks';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, List, X } from '@phosphor-icons/react';
import ThemeToggle from './ThemeToggle';
const links = [{ href: '#problema', label: 'Enfoque' }, { href: '#proceso', label: 'Proceso' }, { href: '#proyectos', label: 'Asesoría' }, { href: '#faq', label: 'Preguntas' }] as const;
export default function LandingHeader({ logo, whatsappHref, locale }: { logo: ReactNode; whatsappHref?: string; locale: Locale }) {
  const t = getTranslator(locale);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new Event('oddly-navigation-open'));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab' && menu.current && menuButton.current) {
        const focusable = menu.current.querySelectorAll<HTMLAnchorElement>('a[href]');
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === menuButton.current) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.current.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth > 1000) setOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);
  return <header className="header"><nav className="header__inner section-shell" aria-label={t('Navegación principal')}><a href="#top" className="header__brand" aria-label={t('Oddly, inicio')} onClick={() => setOpen(false)}>{logo}</a><div className="header__links">{links.map(link => <a href={link.href} key={link.href}>{t(link.label)}</a>)}</div><div className="header__controls"><LanguageSelect locale={locale} onOpen={() => setOpen(false)} /><ThemeToggle locale={locale} /><a className="header__contact" href={whatsappHref || '#contacto'} target={whatsappHref ? '_blank' : undefined} rel={whatsappHref ? 'noopener noreferrer' : undefined}>{t('Hablemos')}<ArrowUpRight size={18} aria-hidden="true" /></a><button ref={menuButton} className="icon-button menu-toggle" type="button" aria-label={open ? t('Cerrar menú') : t('Abrir menú')} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X size={23} aria-hidden="true" /> : <List size={23} aria-hidden="true" />}</button></div><div ref={menu} id="mobile-menu" className="mobile-menu" hidden={!open}>{links.map(link => <a href={link.href} key={link.href} onClick={() => setOpen(false)}>{t(link.label)}<ArrowUpRight size={20} aria-hidden="true" /></a>)}<a href={whatsappHref || '#contacto'} target={whatsappHref ? '_blank' : undefined} rel={whatsappHref ? 'noopener noreferrer' : undefined} onClick={() => setOpen(false)}>{t('Contáctanos')}<ArrowUpRight size={20} aria-hidden="true" /></a><div className="mobile-menu__social"><SocialLinks locale={locale} /></div></div></nav></header>;
}
