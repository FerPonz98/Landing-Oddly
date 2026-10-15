'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import LanguageSelect from './LanguageSelect';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, List, Moon, Sun, X } from '@phosphor-icons/react';
const links = [{ href: '#problema', label: 'Enfoque' }, { href: '#proceso', label: 'Proceso' }, { href: '#proyectos', label: 'Asesoría' }, { href: '#faq', label: 'Preguntas' }] as const;
export default function LandingHeader({ logo, whatsappHref, locale }: { logo: ReactNode; whatsappHref?: string; locale: Locale }) {
  const t = getTranslator(locale);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => { setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'); }, []);
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new Event('oddly-navigation-open'));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab' && menu.current && menuButton.current) {
        const last = menu.current.querySelector<HTMLAnchorElement>('a:last-child');
        if (event.shiftKey && document.activeElement === menuButton.current) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.current.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth > 1000) setOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);
  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem('oddly-theme', next); } catch { /* Toggle works even when storage is blocked. */ }
    window.dispatchEvent(new Event('oddly-theme-change'));
  }
  return <header className="header"><nav className="header__inner section-shell" aria-label={t('Navegación principal')}><a href="#top" className="header__brand" aria-label={t('Oddly, inicio')} onClick={() => setOpen(false)}>{logo}</a><div className="header__links">{links.map(link => <a href={link.href} key={link.href}>{t(link.label)}</a>)}</div><div className="header__controls"><LanguageSelect locale={locale} onOpen={() => setOpen(false)} /><button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'light' ? t('Activar tema oscuro') : t('Activar tema claro')}>{theme === 'light' ? <Moon size={21} aria-hidden="true" /> : <Sun size={21} aria-hidden="true" />}</button><a className="header__contact" href={whatsappHref || '#contacto'} target={whatsappHref ? '_blank' : undefined} rel={whatsappHref ? 'noopener noreferrer' : undefined}>{t('Hablemos')}<ArrowUpRight size={18} aria-hidden="true" /></a><button ref={menuButton} className="icon-button menu-toggle" type="button" aria-label={open ? t('Cerrar menú') : t('Abrir menú')} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X size={23} aria-hidden="true" /> : <List size={23} aria-hidden="true" />}</button></div><div ref={menu} id="mobile-menu" className="mobile-menu" hidden={!open}>{links.map(link => <a href={link.href} key={link.href} onClick={() => setOpen(false)}>{t(link.label)}<ArrowUpRight size={20} aria-hidden="true" /></a>)}<a href={whatsappHref || '#contacto'} target={whatsappHref ? '_blank' : undefined} rel={whatsappHref ? 'noopener noreferrer' : undefined} onClick={() => setOpen(false)}>{t('Hablemos de tu empresa')}<ArrowUpRight size={20} aria-hidden="true" /></a></div></nav></header>;
}
