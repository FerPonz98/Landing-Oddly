'use client';

import { useEffect, useRef } from 'react';

export default function LandingMotion() {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const selectors = '.hero__copy > *, .hero__visual, .hero__closing, .section-heading, .assessment-list > div, .process-tabs, .process-panel, .advisory__intro, .advisory__outcomes > *, .faq__heading, .faq__items > details, .contact__inner';
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reduced.matches) continue;
        const element = entry.target as HTMLElement;
        const siblings = Array.from(element.parentElement?.children || []);
        const delay = Math.min(siblings.indexOf(element), 3) * 60;
        const animation = element.animate([
          { opacity: 0, transform: 'translateY(22px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
      }
    }, { threshold: .12 });
    document.querySelectorAll(selectors).forEach(element => observer.observe(element));
    const tiltElements = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'));
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const tiltHandlers = tiltElements.map(element => {
      const move = (event: PointerEvent) => {
        if (reduced.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
        const bounds = element.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        element.style.transform = `perspective(900px) rotateX(${-y * 12}deg) rotateY(${x * 16}deg)`;
      };
      const reset = () => { element.style.transform = ''; };
      element.addEventListener('pointermove', move); element.addEventListener('pointerleave', reset);
      return () => { reset(); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset); };
    });
    const stopMotion = () => {
      if (reduced.matches) {
        animations.forEach(animation => animation.cancel());
        tiltElements.forEach(element => { element.style.transform = ''; });
      }
      schedule();
    };
    reduced.addEventListener('change', stopMotion);
    let frame = 0;
    const heroVisual = document.querySelector<HTMLElement>('.hero__visual');
    const watermark = document.querySelector<HTMLElement>('.brand-watermark');
    const statementLine = document.querySelector<HTMLElement>('.approach__line');
    const statement = document.querySelector<HTMLElement>('.approach__statement');
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    const updateProgress = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const evolution = range > 0 ? clamp(window.scrollY / range) : 0;
      document.documentElement.style.setProperty('--scroll-evolution', `${(evolution * 100).toFixed(2)}%`);
      if (heroVisual) heroVisual.style.translate = reduced.matches ? '' : `0 ${Math.min(window.scrollY * .13, 65)}px`;
      if (watermark) watermark.style.opacity = `${clamp((evolution - .58) / .42) * .18}`;
      if (statementLine && statement) {
        const position = clamp((window.innerHeight - statement.getBoundingClientRect().top) / window.innerHeight);
        statementLine.style.transform = reduced.matches ? '' : `scaleX(${.25 + position * .75})`;
      }
      if (progress.current) progress.current.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    updateProgress();
    return () => {
      tiltHandlers.forEach(cleanup => cleanup());
      document.documentElement.style.removeProperty('--scroll-evolution');
      observer.disconnect(); animations.forEach(animation => animation.cancel());
      reduced.removeEventListener('change', stopMotion);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={progress} className="reading-progress" aria-hidden="true" />;
}
