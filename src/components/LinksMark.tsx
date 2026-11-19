'use client';
import { useEffect, useRef } from 'react';
import { ISO, easeInOut, easeOut, isotypePen } from '@/lib/isotype';

// Seconds: a short version of the loading intro. The pen traces the isotype, then the solid mark replaces the stroke.
const TRACE = 1.2, FILL = .3;

// The /links isotype. It is rendered solid; on a regular visit the inline script in layout.tsx sets
// html[data-links-intro] (not with reduced motion), which hides it until the pen draws it here.
export default function LinksMark() {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const element = svg.current;
    if (!element || !root.dataset.linksIntro) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { delete root.dataset.linksIntro; return; }
    const [fill, ink] = Array.from(element.querySelectorAll('path'));
    const pen = isotypePen({ ink, fill, nib: element.querySelector('circle')!, weight: 3 });
    pen(0, 0);
    let frame = 0, start = 0;
    const tick = (now: number) => {
      start ||= now;
      const time = (now - start) / 1000;
      pen(easeInOut(time / TRACE), easeOut((time - TRACE) / FILL));
      if (time < TRACE + FILL) frame = requestAnimationFrame(tick);
      else delete root.dataset.linksIntro;
    };
    frame = requestAnimationFrame(tick);
    // An interrupted trace (e.g. React remounting in development) starts over on the next mount.
    return () => { cancelAnimationFrame(frame); pen(1, 1); };
  }, []);
  return <svg ref={svg} className="links-mark" viewBox="0 0 720 533" aria-hidden="true" focusable="false">
    <path className="links-mark__fill" fillRule="evenodd" d={ISO} />
    <path className="links-mark__ink" d={ISO} />
    <circle className="links-mark__nib" r="18" />
  </svg>;
}
