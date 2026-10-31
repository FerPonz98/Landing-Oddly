'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import { ISO } from '@/lib/isotype';
import { useEffect, useRef } from 'react';

// The hero stage is 600 × 560 and the isotype fills 300 × 222 of it.
const S = .4167, OX = 155, OY = 104;
// Each edge leaves the outline at the point nearest to its input; the last one leads to the resulting strategy.
const EDGES = [
  { from: { x: 246.2, y: 127 }, to: { x: 150, y: 108 } },
  { from: { x: 363.8, y: 126.5 }, to: { x: 460, y: 108 } },
  { from: { x: 155.2, y: 325.7 }, to: { x: 150, y: 384 } },
  { from: { x: 454.8, y: 325.7 }, to: { x: 460, y: 384 } },
  { from: { x: 305, y: 323.4 }, to: { x: 305, y: 452 }, out: true },
];
// Seconds: the pen traces and fills the mark at the centre of the screen, the mark flies to the hero,
// then the edges grow out of it and the rest of the page appears.
const TRACE = 2.4, FILL = .5, FLY = 3.1, FLIGHT = 1.1, REVEAL = 1.2, SETTLE = 1.9;
// Afterwards each edge keeps sending three beads out of the isotype to its point every 2.4s.
const PERIOD = 2.4, BEADS = 3;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const easeOut = (n: number) => 1 - Math.pow(1 - clamp(n), 3);
const easeInOut = (n: number) => { n = clamp(n); return n < .5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2; };
const edgeStart = (i: number) => EDGES[i].out ? .45 : i * .12;

// The loading screen is a single pen-drawn isotype, centred over the hidden page; it then flies onto the hero's own isotype.
function startIntro(stage: SVGSVGElement) {
  const overlay = document.createElement('div');
  overlay.className = 'intro';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<svg viewBox="0 0 720 533"><path class="intro__fill" fill-rule="evenodd" d="${ISO}"/><path class="intro__ink" d="${ISO}"/><circle class="intro__nib" r="10"/></svg>`;
  document.body.append(overlay);
  const mark = overlay.querySelector('svg')!;
  const [fill, ink] = Array.from(overlay.querySelectorAll('path'));
  const nib = overlay.querySelector('circle')!;
  const length = ink.getTotalLength();
  ink.style.strokeDasharray = `${length} ${length}`;
  let flight: { x: number; y: number; scale: number } | null = null;
  const step = (time: number) => {
    const drawn = easeInOut(Math.min(time, FLY) / TRACE), head = ink.getPointAtLength(drawn * length), filled = easeOut((time - TRACE) / FILL);
    ink.style.strokeDashoffset = String(length * (1 - drawn));
    // The pen leaves a slight calligraphic swell in the stroke.
    ink.style.strokeWidth = String(4 + 2.4 * Math.abs(Math.sin(drawn * 38)));
    nib.setAttribute('cx', String(head.x)); nib.setAttribute('cy', String(head.y));
    nib.style.opacity = drawn > 0 && drawn < 1 ? '1' : '0';
    fill.style.opacity = String(filled); ink.style.opacity = String(1 - filled);
    if (time < FLY) return;
    // The flight ends exactly over the hero's own isotype, which then takes its place.
    if (!flight) {
      const from = mark.getBoundingClientRect(), box = stage.getBoundingClientRect();
      const unit = Math.min(box.width / 600, box.height / 560);
      const x = box.left + (box.width - 600 * unit) / 2 + OX * unit, y = box.top + (box.height - 560 * unit) / 2 + OY * unit;
      flight = { x: x - from.left, y: y - from.top, scale: 720 * S * unit / from.width };
    }
    const e = easeInOut((time - FLY) / FLIGHT);
    mark.style.transform = `translate(${flight.x * e}px, ${flight.y * e}px) scale(${1 + (flight.scale - 1) * e})`;
    if (time >= FLY + FLIGHT) overlay.remove();
  };
  return { step, remove: () => overlay.remove() };
}

export default function StrategyVisual({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const figure = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const element = figure.current;
    const stage = element?.querySelector('svg');
    if (!element || !stage) { delete root.dataset.intro; return; }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const lines = Array.from(element.querySelectorAll<SVGLineElement>('.strategy-visual__edge line'));
    const beads = Array.from(element.querySelectorAll('.strategy-visual__edge'), edge => Array.from(edge.querySelectorAll<SVGCircleElement>('circle')));
    const points = Array.from(element.querySelectorAll<SVGGElement>('.strategy-visual__point'));
    const pulses = Array.from(element.querySelectorAll<SVGCircleElement>('.strategy-visual__pulse'));
    const captions = Array.from(element.querySelectorAll<HTMLElement>('.strategy-visual__label, figcaption'));
    const grow = (time: number) => EDGES.forEach(({ from, to, out }, i) => {
      const start = edgeStart(i), f = easeOut((time - start) / (out ? .7 : .8));
      lines[i].setAttribute('x2', String(from.x + (to.x - from.x) * f));
      lines[i].setAttribute('y2', String(from.y + (to.y - from.y) * f));
      points[i].style.opacity = String(clamp((time - start - .55) * 4));
      captions[i].style.opacity = String(clamp((time - start - .65) * 3));
    });
    // Beads ease out of the isotype and fade into their point; each edge joins in once it has grown.
    const flow = (time: number, since: number) => EDGES.forEach(({ from, to }, i) => {
      const ready = clamp((since - edgeStart(i) - .6) / .6), phase = (time + i * .37) / PERIOD;
      beads[i].forEach((bead, k) => {
        const travel = (phase + k / BEADS) % 1, along = travel * travel * (3 - 2 * travel);
        bead.setAttribute('cx', String(from.x + (to.x - from.x) * along));
        bead.setAttribute('cy', String(from.y + (to.y - from.y) * along));
        bead.style.opacity = String(Math.sin(travel * Math.PI) * ready);
      });
      // Each time the first bead arrives, a ring opens around the point.
      const ring = clamp((phase % 1) / .45);
      pulses[i].setAttribute('r', String(5 + ring * 12));
      pulses[i].style.opacity = String((1 - ring) * .45 * ready);
    });
    // Without motion the beads rest evenly along each edge.
    const rest = () => EDGES.forEach(({ from, to }, i) => {
      beads[i].forEach((bead, k) => {
        const along = (k + 1) / (BEADS + 1);
        bead.setAttribute('cx', String(from.x + (to.x - from.x) * along));
        bead.setAttribute('cy', String(from.y + (to.y - from.y) * along));
        bead.style.opacity = '';
      });
      pulses[i].style.opacity = '';
    });
    const intro = root.dataset.intro ? startIntro(stage) : null;
    let frame = 0, clock = 0, previous = 0, visible = false, playing = Boolean(intro), landed = false, revealed = false;
    const reveal = () => {
      revealed = true;
      delete root.dataset.intro;
      document.querySelectorAll('.header, .background-trails').forEach(node => node.animate({ opacity: [0, 1] }, { duration: 700, easing: 'ease-out' }));
      window.dispatchEvent(new Event('oddly-intro-end'));
    };
    const schedule = () => { if (!frame && (playing || (visible && !document.hidden && !reduced.matches))) frame = requestAnimationFrame(tick); };
    const tick = (now: number) => {
      frame = 0;
      clock += previous ? Math.min(now - previous, 50) / 1000 : 0; previous = now;
      let since = Infinity;
      if (intro && playing) {
        intro.step(clock);
        since = clock - FLY - FLIGHT;
        if (since >= 0) {
          if (!landed) { landed = true; root.dataset.intro = 'edges'; }
          grow(since);
          if (!revealed && since >= REVEAL) reveal();
        }
        if (since >= SETTLE) playing = false;
      }
      if (!reduced.matches) flow(clock, since);
      schedule();
    };
    if (intro) { root.dataset.intro = 'trace'; grow(0); }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .05 });
    observer.observe(element);
    const motionChange = () => { if (reduced.matches) rest(); schedule(); };
    reduced.addEventListener('change', motionChange); document.addEventListener('visibilitychange', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      reduced.removeEventListener('change', motionChange); document.removeEventListener('visibilitychange', schedule);
      intro?.remove(); grow(SETTLE); rest();
      // An interrupted intro starts over when the hero mounts again.
      if (intro && !revealed) root.dataset.intro = 'pending';
    };
  }, []);
  return <figure ref={figure} className="strategy-visual" aria-label={t('Tu negocio, clientes, mercado y canales se conectan en una evaluación para definir tu estrategia.')}>
    <svg viewBox="0 0 600 560" aria-hidden="true">
      {EDGES.map(({ from, to, out }, i) => <g key={i} className={`strategy-visual__edge${out ? ' strategy-visual__edge--out' : ''}`}>
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        {Array.from({ length: BEADS }, (_, k) => <circle key={k} cx={from.x + (to.x - from.x) * (k + 1) / (BEADS + 1)} cy={from.y + (to.y - from.y) * (k + 1) / (BEADS + 1)} r={2.7} />)}
      </g>)}
      <path className="strategy-visual__mark" d={ISO} fillRule="evenodd" transform={`translate(${OX} ${OY}) scale(${S})`} />
      {EDGES.map(({ to, out }, i) => <g key={i} className="strategy-visual__point"><circle cx={to.x} cy={to.y} r={9.5} /><circle cx={to.x} cy={to.y} r={out ? 5.5 : 5} /><circle className="strategy-visual__pulse" cx={to.x} cy={to.y} r={5} /></g>)}
    </svg>
    <span className="strategy-visual__label strategy-visual__label--business">{t('Tu negocio')}</span><span className="strategy-visual__label strategy-visual__label--customers">{t('Tus clientes')}</span><span className="strategy-visual__label strategy-visual__label--market">{t('Tu mercado')}</span><span className="strategy-visual__label strategy-visual__label--channels">{t('Tus canales')}</span>
    <figcaption>{t('Una estrategia')}<br /><strong>{t('a tu medida.')}</strong></figcaption>
  </figure>;
}
