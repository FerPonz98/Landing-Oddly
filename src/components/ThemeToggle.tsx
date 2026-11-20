'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';
import { getTranslator, type Locale } from '@/lib/i18n';

// Light/dark switch shared by the landing header and /links. The inline script in layout.tsx applies the saved theme before paint.
export default function ThemeToggle({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => { setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'); }, []);
  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem('oddly-theme', next); } catch { /* Toggle works even when storage is blocked. */ }
    window.dispatchEvent(new Event('oddly-theme-change'));
  }
  return <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'light' ? t('Activar tema oscuro') : t('Activar tema claro')}>{theme === 'light' ? <Moon size={21} aria-hidden="true" /> : <Sun size={21} aria-hidden="true" />}</button>;
}
