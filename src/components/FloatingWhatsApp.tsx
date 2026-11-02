'use client';

import { useEffect, useRef, useState } from 'react';
import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { getWhatsAppHref, oddlyWhatsAppNumber } from '@/lib/contact';
import { getTranslator, type Locale } from '@/lib/i18n';

// Appears once the hero "Contáctanos" button has scrolled past, and steps aside while #contacto or the footer
// (which already offer a CTA) are on screen. On phones it also steps aside while the pinned process card fills the
// screen, where it would sit on the card's text. The loading intro hides it through CSS (html[data-intro]).
export default function FloatingWhatsApp({ locale }: { locale: Locale }) {
  const href = getWhatsAppHref(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || oddlyWhatsAppNumber, locale);
  const [visible, setVisible] = useState(false);
  const state = useRef({ heroPassed: false, endsOnScreen: new Set<Element>() });

  useEffect(() => {
    if (!href || !('IntersectionObserver' in window)) return;
    const current = state.current;
    const phone = window.matchMedia('(max-width: 700px)');
    const blocking = (element: Element) => !element.matches('.process-stage') || phone.matches;
    const update = () => setVisible(current.heroPassed && ![...current.endsOnScreen].some(blocking));
    const headerHeight = document.querySelector('.header')?.getBoundingClientRect().height ?? 0;

    const hero = document.querySelector('.hero__actions .button');
    const heroObserver = new IntersectionObserver(([entry]) => {
      // Passed means it left through the top, not that it is still below the fold.
      current.heroPassed = !entry.isIntersecting && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? headerHeight);
      update();
    }, { rootMargin: `-${Math.round(headerHeight)}px 0px 0px 0px` });
    if (hero) heroObserver.observe(hero);
    else current.heroPassed = true;

    const endObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) current.endsOnScreen.add(entry.target);
        else current.endsOnScreen.delete(entry.target);
      }
      update();
    });
    document.querySelectorAll('#contacto, .footer, .process-stage').forEach(element => endObserver.observe(element));
    phone.addEventListener('change', update);
    update();

    return () => { heroObserver.disconnect(); endObserver.disconnect(); phone.removeEventListener('change', update); current.endsOnScreen.clear(); };
  }, [href]);

  if (!href) return null;
  const label = getTranslator(locale)('Escríbenos por WhatsApp');
  return <a className="floating-whatsapp" data-visible={visible} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
    <WhatsappLogo size={28} weight="fill" aria-hidden="true" />
  </a>;
}
