'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, CaretDown, GlobeSimple } from '@phosphor-icons/react';
import { getTranslator, languageNames, locales, type Locale, type Message } from '@/lib/i18n';
const translatedNames: Record<Locale, Message> = { es: 'Español', en: 'Inglés', pt: 'Portugués' };

export default function LanguageSelect({ locale, onOpen }: { locale: Locale; onOpen?: () => void }) {
  const t = getTranslator(locale);
  const id = useId();
  const root = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const initialFocus = useRef<number | null>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(locales.indexOf(locale));
  const close = useCallback((restoreFocus = false) => {
    if (root.current) root.current.open = false;
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }, []);
  const focusItem = (index: number) => { setFocused(index); items.current[index]?.focus(); };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    const dismiss = () => close();
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', dismiss);
    window.addEventListener('scroll', dismiss, { passive: true });
    window.addEventListener('oddly-navigation-open', dismiss);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', dismiss); window.removeEventListener('scroll', dismiss);
      window.removeEventListener('oddly-navigation-open', dismiss);
    };
  }, [open, close]);
  return <details ref={root} className="language-picker" onToggle={event => {
    const next = event.currentTarget.open;
    setOpen(next);
    if (next) { onOpen?.(); focusItem(initialFocus.current ?? locales.indexOf(locale)); initialFocus.current = null; }
  }}>
    <summary ref={trigger} className="language-trigger" aria-label={`${t('Cambiar idioma')}: ${languageNames[locale]}`} aria-haspopup="menu" aria-controls={id} onPointerDown={() => { if (root.current) root.current.dataset.keyboard = 'false'; }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const index = event.key === 'ArrowUp' ? locales.length - 1 : 0;
        if (root.current) { root.current.dataset.keyboard = 'true'; if (root.current.open) focusItem(index); else { initialFocus.current = index; root.current.open = true; } }
      } else if (event.key === 'Enter' || event.key === ' ') { if (root.current) root.current.dataset.keyboard = 'true'; } else if (event.key === 'Escape') { event.preventDefault(); close(true); }
    }}>
      <GlobeSimple size={18} aria-hidden="true" />
      <span className="language-trigger__name" aria-hidden="true" lang={locale}>{languageNames[locale]}</span>
      <span className="language-trigger__code" aria-hidden="true">{locale.toUpperCase()}</span>
      <CaretDown className="language-trigger__caret" size={12} aria-hidden="true" />
    </summary>
    <div className="language-panel">
      <p className="language-panel__title">{t('Elige tu idioma')}</p>
      <div id={id} role="menu" aria-label={t('Idioma')} className="language-options" onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
        else if (event.key === 'ArrowDown') { event.preventDefault(); focusItem((focused + 1) % locales.length); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); focusItem((focused + locales.length - 1) % locales.length); }
        else if (event.key === 'Home') { event.preventDefault(); focusItem(0); }
        else if (event.key === 'End') { event.preventDefault(); focusItem(locales.length - 1); }
        else if (event.key === 'Tab') { requestAnimationFrame(() => close()); }
        else if (event.key === ' ') { event.preventDefault(); items.current[focused]?.click(); }
        else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const index = locales.map((_, offset) => (focused + 1 + offset) % locales.length).find(index => languageNames[locales[index]].toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
          if (index !== undefined) { event.preventDefault(); focusItem(index); }
        }
      }}>{locales.map((code, index) => <a ref={element => { items.current[index] = element; }} key={code} href={`/?lang=${code}`} hrefLang={code} role="menuitemradio" aria-checked={code === locale} tabIndex={open ? (index === focused ? 0 : -1) : 0} className="language-option" onFocus={() => setFocused(index)} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (code === locale) { close(true); return; }
        const url = new URL(window.location.href); url.searchParams.set('lang', code);
        // The reload after a language switch opens the page directly, without the loading intro.
        try { sessionStorage.setItem('oddly-intro', 'skip'); } catch {}
        window.location.assign(url.toString());
      }}><span className="language-option__text"><span className="language-option__name" lang={code}>{languageNames[code]}</span><span className="language-option__description">{code === locale ? t('Idioma actual') : t(translatedNames[code])}</span></span><span className="language-option__mark" aria-hidden="true">{code === locale ? <Check size={17} weight="bold" /> : <span>{code.toUpperCase()}</span>}</span></a>)}</div>
      <p className="language-panel__note">{t('Tu elección se guarda.')}</p>
    </div>
  </details>;
}
