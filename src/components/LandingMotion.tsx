'use client';

import { useEffect, useRef } from 'react';

export default function LandingMotion() {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const reveals = new WeakMap<Element, Animation>();
    const selectors = '.hero__copy > *, .hero__visual > *, .hero__closing, .section-heading, .approach__statement, .assessment-list > div, .process-tabs, .process-panel, .advisory__intro, .advisory__outcomes > *, .cycle__steps > li, .faq__heading, .faq__items > details, .contact__inner, .footer > *';
    const hidden = (above: boolean) => ({ opacity: 0, translate: `0 ${above ? -24 : 24}px` });
    const shown = { opacity: 1, translate: '0 0' };
    // Elements enter and leave on every pass, from the side of the viewport they crossed.
    const reveal = (element: Element, visible: boolean, above: boolean, instant = false) => {
      const previous = reveals.get(element);
      const from = previous ? undefined : (visible ? hidden(above) : shown);
      if (previous) { previous.commitStyles(); previous.cancel(); animations.delete(previous); }
      const siblings = Array.from(element.parentElement?.children || []);
      const delay = visible && !instant ? Math.min(siblings.indexOf(element), 3) * 60 : 0;
      const target = visible ? shown : hidden(above);
      const animation = element.animate(from ? [from, target] : [target], { duration: instant ? 0 : visible ? 650 : 450, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      reveals.set(element, animation);
      animations.add(animation);
    };
    let initial = true;
    const observer = new IntersectionObserver(entries => {
      if (reduced.matches) { initial = false; return; }
      for (const entry of entries) {
        const above = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        if (initial && !entry.isIntersecting) reveal(entry.target, false, above, true);
        else if (entry.isIntersecting || reveals.has(entry.target)) reveal(entry.target, entry.isIntersecting, above);
      }
      initial = false;
    }, { threshold: .12 });
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(selectors));
    revealElements.forEach(element => observer.observe(element));
    const clearReveals = () => {
      animations.forEach(animation => animation.cancel());
      animations.clear();
      revealElements.forEach(element => { reveals.delete(element); element.style.opacity = ''; element.style.translate = ''; });
    };
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
        clearReveals();
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
      observer.disconnect(); clearReveals();
      reduced.removeEventListener('change', stopMotion);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={progress} className="reading-progress" aria-hidden="true" />;
}
