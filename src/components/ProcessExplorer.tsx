'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import { ISO, ISO_HEIGHT, ISO_WIDTH, sampleOutline } from '@/lib/isotype';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
const steps = [
  { title: 'Conocemos tu empresa', text: 'Empezamos por tu negocio: qué ofreces, a quién quieres llegar y cuáles son tus objetivos de ventas.', question: '¿Qué quieres conseguir con tu negocio?' },
  { title: 'Evaluamos tu situación', text: 'Revisamos cómo conectas con tus clientes y qué puede estar limitando tus oportunidades comerciales.', question: '¿Qué está frenando tus oportunidades de venta?' },
  { title: 'Identificamos oportunidades', text: 'Distinguimos dónde conviene enfocar tus esfuerzos y qué necesita atención primero.', question: '¿Dónde puede marcar la diferencia tu marketing?' },
  { title: 'Recomendamos una estrategia', text: 'Te orientamos sobre qué hacer y por qué, con recomendaciones adaptadas a la realidad de tu empresa.', question: '¿Cuál es el siguiente paso que tiene sentido para ti?' },
] as const;
type Point = { x: number; y: number };
type Origin = Point & { beside: boolean };
type Node = { end: Point; part: number; delay: number; bend: number; spread: Point };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const easeInOut = (n: number) => { n = clamp(n); return n < .5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2; };
const rand = (i: number) => { const s = Math.sin(i * 91.7 + 13.1) * 43758.5453; return s - Math.floor(s); };
const bezier = (a: Point, c: Point, b: Point, t: number) => ({ x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
// A soft arc: upwards when the cards sit beside the panel, sideways when they sit above it.
const curve = (from: Point, to: Point, bend: number, beside: boolean) => {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2, d = Math.hypot(to.x - from.x, to.y - from.y);
  return beside ? { x: mx + bend * d * .3, y: Math.min(from.y, to.y) - d * (.25 + Math.abs(bend) * .3) } : { x: mx + bend * d * .9, y: my - d * .15 };
};

// The section pins while it scrolls; each stage sends circles from its card that build its part of the isotype,
// from the wings at the base to the arms, so the logo only reveals itself at the last stage.
export default function ProcessExplorer({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const net = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const goTo = useRef<(index: number) => void>(() => {});
  useEffect(() => {
    const section = track.current, pinned = sticky.current, element = canvas.current, area = net.current;
    const context = element?.getContext('2d');
    if (!section || !pinned || !element || !area || !context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const isotype = new Path2D(ISO);
    // The probe tests points in isotype units, so its size never depends on the screen.
    const probe = Object.assign(document.createElement('canvas'), { width: ISO_WIDTH, height: ISO_HEIGHT }).getContext('2d');
    let width = 0, height = 0, ratio = 1, range = 1, top = 0, frame = 0, visible = false, shown = 0, step = -1, streamAt = 0;
    let mark = { x: 0, y: 0, s: 1 }, nodes: Node[] = [], edges: [number, number][] = [], bands: [number, number][] = [], pools: number[][] = [], origins: Origin[] = [];
    const stream: { to: Point; born: number; origin: Origin; bend: number; part: number }[] = [];
    const colors = { ink: '', accent: '', paper: '' };
    const read = () => {
      const style = getComputedStyle(element);
      colors.ink = style.getPropertyValue('--foreground').trim(); colors.accent = style.getPropertyValue('--accent').trim();
      colors.paper = getComputedStyle(area.parentElement || area).backgroundColor;
    };
    const inside = (x: number, y: number) => !!probe && probe.isPointInPath(isotype, (x - mark.x) / mark.s, (y - mark.y) / mark.s, 'evenodd');
    // Layout is measured only when something resizes: the isotype nodes, their four bands and where each card launches from.
    const measure = () => {
      const box = element.getBoundingClientRect(), region = area.getBoundingClientRect();
      width = box.width; height = box.height; ratio = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio);
      top = parseFloat(getComputedStyle(pinned).top) || 0;
      range = Math.max(1, section.offsetHeight - pinned.offsetHeight);
      const r = { x: region.left - box.left + 16, y: region.top - box.top + 14, w: Math.max(1, region.width - 32), h: Math.max(1, region.height - 22) };
      const s = Math.min(r.w * .66 / ISO_WIDTH, r.h * .92 / ISO_HEIGHT);
      mark = { s, x: r.x + (r.w - ISO_WIDTH * s) / 2, y: r.y + (r.h - ISO_HEIGHT * s) / 2 };
      const gap = Math.max(8, Math.min(15, ISO_WIDTH * s / 26)), points: Point[] = [];
      let last: Point | null = null;
      for (const o of sampleOutline()) {
        const p = { x: mark.x + o.x * s, y: mark.y + o.y * s };
        if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= gap) { points.push(p); last = p; }
      }
      for (let y = mark.y + gap * .6; y < mark.y + ISO_HEIGHT * s; y += gap) for (let x = mark.x + gap * .6; x < mark.x + ISO_WIDTH * s; x += gap) {
        const jx = x + (rand(points.length * 3 + 1) - .5) * gap * .5, jy = y + (rand(points.length * 5 + 2) - .5) * gap * .5;
        if (inside(jx, jy) && points.every(p => Math.hypot(p.x - jx, p.y - jy) > gap * .7)) points.push({ x: jx, y: jy });
      }
      const heights = points.map(p => (p.y - mark.y) / s).sort((a, b) => b - a);
      const cuts = [1, 2, 3].map(k => heights[Math.floor(heights.length * k / 4)]);
      bands = [[cuts[0], 600], [cuts[1], cuts[0]], [cuts[2], cuts[1]], [-60, cuts[2]]];
      nodes = points.map((end, i) => {
        const ly = (end.y - mark.y) / s;
        return { end, part: ly > cuts[0] ? 0 : ly > cuts[1] ? 1 : ly > cuts[2] ? 2 : 3, delay: rand(i * 17 + 4) * .42, bend: rand(i * 23 + 9) - .5, spread: { x: rand(i * 29 + 1) - .5, y: rand(i * 31 + 2) - .5 } };
      });
      pools = [0, 1, 2, 3].map(j => nodes.flatMap((n, i) => n.part <= j ? [i] : []));
      edges = []; const seen = new Set<string>();
      nodes.forEach((a, i) => nodes.map((b, j) => ({ j, d: Math.hypot(a.end.x - b.end.x, a.end.y - b.end.y) })).filter(o => o.j !== i && o.d < gap * 1.8).sort((m, n) => m.d - n.d).slice(0, 3).forEach(o => {
        const b = nodes[o.j], key = `${Math.min(i, o.j)}-${Math.max(i, o.j)}`;
        if (seen.has(key) || !inside((a.end.x + b.end.x) / 2, (a.end.y + b.end.y) / 2)) return;
        seen.add(key); edges.push([i, o.j]);
      }));
      origins = cards.current.map(card => {
        const c = card?.getBoundingClientRect() || box, beside = region.left >= c.right - 2;
        return beside ? { x: c.right - box.left - 26, y: c.top - box.top + c.height / 2, beside } : { x: c.left - box.left + c.width / 2, y: c.bottom - box.top - 10, beside };
      });
    };
    const progress = () => Math.max(0, Math.min(3.999, (top - section.getBoundingClientRect().top) / range * 4));
    goTo.current = index => {
      const start = section.getBoundingClientRect().top + scrollY - top;
      scrollTo({ top: start + range * (index + .92) / 4, behavior: reduced.matches ? 'auto' : 'smooth' });
    };
    const draw = (now: number) => {
      frame = 0;
      const moving = !reduced.matches, p = progress(), time = now / 1000;
      shown += (p - shown) * (moving ? .12 : 1);
      const current = Math.min(3, Math.floor(p));
      if (current !== step) { step = current; setActive(current); }
      context.setTransform(ratio, 0, 0, ratio, 0, 0); context.clearRect(0, 0, width, height);
      const u = [0, 1, 2, 3].map(j => clamp(shown - j));
      const link = u.map(v => easeInOut((v - .55) / .2)), solid = u.map(v => easeInOut((v - .72) / .22));
      // The solid logo appears band by band as each stage completes.
      context.save(); context.translate(mark.x, mark.y); context.scale(mark.s, mark.s); context.fillStyle = colors.ink;
      bands.forEach(([from, to], j) => {
        if (solid[j] <= 0) return;
        context.save(); context.globalAlpha = solid[j]; context.beginPath(); context.rect(-50, from - .5, 820, to - from + 1); context.clip();
        context.fill(isotype, 'evenodd'); context.restore();
      });
      context.restore();
      // Each circle leaves its card, travels on an arc and lands on its place in the logo.
      const pos = nodes.map(n => {
        const o = origins[n.part], f = clamp((u[n.part] - n.delay) / .3);
        if (!o || f <= 0) return null;
        const from = { x: o.x + n.spread.x * 16, y: o.y + n.spread.y * 14 }, e = easeInOut(f), c = curve(from, n.end, n.bend, o.beside);
        return { ...bezier(from, c, n.end, e), f, e, from, c };
      });
      context.lineWidth = .8; context.strokeStyle = colors.ink;
      for (const [a, b] of edges) {
        const j = Math.max(nodes[a].part, nodes[b].part), alpha = link[j] * (1 - solid[j] * .9), pa = pos[a], pb = pos[b];
        if (alpha <= .01 || !pa || !pb) continue;
        context.globalAlpha = alpha * .5; context.beginPath(); context.moveTo(pa.x, pa.y); context.lineTo(pb.x, pb.y); context.stroke();
      }
      nodes.forEach((n, i) => {
        const at = pos[i];
        if (!at) return;
        const flying = at.f < 1, j = n.part;
        if (flying && moving) {
          context.fillStyle = colors.accent;
          for (let k = 1; k <= 7; k++) {
            const trail = bezier(at.from, at.c, n.end, Math.max(0, at.e - k * .035));
            context.globalAlpha = (1 - k / 8) * .5 * Math.min(1, at.f * 5);
            context.beginPath(); context.arc(trail.x, trail.y, 3.6 * (1 - k / 9), 0, Math.PI * 2); context.fill();
          }
        }
        context.globalAlpha = Math.min(1, at.f * 6) * (1 - solid[j] * .8);
        context.fillStyle = flying ? colors.accent : solid[j] > .5 ? colors.paper : colors.ink;
        context.beginPath(); context.arc(at.x, at.y, flying ? 4 : 2.6, 0, Math.PI * 2); context.fill();
        // A ring opens where a circle lands.
        const pop = at.f >= 1 ? clamp((u[j] - n.delay - .3) / .12) : 0;
        if (pop > 0 && pop < 1 && moving) {
          context.globalAlpha = (1 - pop) * .7; context.strokeStyle = colors.accent; context.lineWidth = 1.2;
          context.beginPath(); context.arc(at.x, at.y, 3 + pop * 12, 0, Math.PI * 2); context.stroke();
        }
      });
      // While a stage is active its card keeps sending circles to the logo, and its launch point pulses.
      if (moving && nodes.length && origins[step]) {
        if (now - streamAt > 170) {
          streamAt = now;
          const pool = pools[step], pick = pool[Math.floor(Math.random() * pool.length)];
          if (pick !== undefined && pos[pick]) stream.push({ to: nodes[pick].end, born: now, origin: origins[step], bend: Math.random() - .5, part: step });
        }
        context.fillStyle = colors.accent;
        for (let k = stream.length - 1; k >= 0; k--) {
          const s = stream[k], life = (now - s.born) / 1100;
          if (life >= 1 || s.part !== step) { stream.splice(k, 1); continue; }
          const at = bezier(s.origin, curve(s.origin, s.to, s.bend, s.origin.beside), s.to, easeInOut(life));
          context.globalAlpha = Math.sin(life * Math.PI) * .9; context.beginPath(); context.arc(at.x, at.y, 3, 0, Math.PI * 2); context.fill();
        }
        const o = origins[step], ring = (time * 1.4) % 1;
        context.globalAlpha = (1 - ring) * .8; context.strokeStyle = colors.accent; context.lineWidth = 1.5;
        context.beginPath(); context.arc(o.x, o.y, 4 + ring * 14, 0, Math.PI * 2); context.stroke();
      }
      context.globalAlpha = 1;
      fills.current.forEach((fill, i) => { if (fill) fill.style.transform = `scaleX(${i === step ? clamp(p - i) : i < step ? 1 : 0})`; });
      // Motion keeps the loop running while the section is on screen; without it, the canvas redraws on scroll only.
      if (visible && !document.hidden && moving) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const refresh = () => { read(); schedule(); };
    const resize = new ResizeObserver(() => { measure(); schedule(); });
    [pinned, area, ...cards.current].forEach(node => node && resize.observe(node));
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) schedule(); }, { threshold: 0 });
    observer.observe(section);
    read(); measure();
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('oddly-theme-change', refresh);
    document.addEventListener('visibilitychange', schedule); reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('oddly-theme-change', refresh);
      document.removeEventListener('visibilitychange', schedule); reduced.removeEventListener('change', schedule);
    };
  }, []);
  return <div className="process-track" ref={track}>
    <div className="process-sticky" ref={sticky}>
      <div className="process-head"><h2 id="process-title">{t('Del diagnóstico')}<br />{t('a una dirección clara.')}</h2><p>{t('Un proceso para transformar la percepción de tu marca en un activo que se puede ver crecer.')}</p></div>
      <div className="process-body">
        <div className="process-steps" role="tablist" aria-label={t('Explora las etapas de nuestra asesoría')}>{steps.map((step, index) => <button key={step.title} ref={node => { cards.current[index] = node; }} id={`step-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls="process-panel" tabIndex={active === index ? 0 : -1} className={`process-step${index < active ? ' is-done' : ''}`} onClick={() => goTo.current(index)} onKeyDown={event => {
          const next = ({ ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: steps.length - 1 } as Record<string, number>)[event.key];
          if (next === undefined) return;
          event.preventDefault();
          const target = Math.max(0, Math.min(steps.length - 1, next));
          cards.current[target]?.focus(); goTo.current(target);
        }}><span className="process-step__number">0{index + 1}</span><span>{t(step.title)}</span><ArrowUpRight size={18} aria-hidden="true" /><span className="process-step__fill" ref={node => { fills.current[index] = node; }} aria-hidden="true" /></button>)}</div>
        <div className="process-stage" id="process-panel" role="tabpanel" aria-labelledby={`step-${active}`} aria-live="polite">
          <div className="process-stage__number" aria-hidden="true"><span style={{ transform: `translateY(${-active}em)` }}>01<br />02<br />03<br />04</span></div>
          <div className="process-stage__net" ref={net} />
          <div className="process-stage__copy" key={active}><h3>{t(steps[active].question)}</h3><p>{t(steps[active].text)}</p></div>
        </div>
      </div>
      <canvas className="process-canvas" ref={canvas} aria-hidden="true" />
    </div>
  </div>;
}
