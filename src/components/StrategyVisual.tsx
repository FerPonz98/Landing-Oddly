'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; delay: number; seed: number };
type Network = { nodes: Node[]; edges: [number, number][]; aspect: number };

// Seconds until every node of the isotype is connected; the clean mark then holds before the points connect again.
const BUILD = 2.6;
const HOLD = 6;
const FADE = .7;
const CYCLE = BUILD + .9 + HOLD + FADE;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const easeOut = (n: number) => 1 - Math.pow(1 - clamp(n), 3);

// Samples the isotype's alpha mask into evenly spaced nodes and links neighbours that stay inside the mark.
function traceIsotype(image: HTMLImageElement): Network {
  const w = 240, h = Math.round(w * image.naturalHeight / image.naturalWidth);
  const empty = { nodes: [], edges: [], aspect: h / w };
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return empty;
  context.drawImage(image, 0, 0, w, h);
  const alpha = context.getImageData(0, 0, w, h).data;
  const inside = (x: number, y: number) => {
    const px = Math.round(x), py = Math.round(y);
    return px >= 0 && py >= 0 && px < w && py < h && alpha[(py * w + px) * 4 + 3] > 110;
  };
  const near = (x: number, y: number) => [-2, 0, 2].some(dx => [-2, 0, 2].some(dy => inside(x + dx, y + dy)));
  const spacing = w * .046;
  const points: { x: number; y: number }[] = [];
  const free = (x: number, y: number, gap: number) => points.every(p => (p.x - x) ** 2 + (p.y - y) ** 2 >= gap * gap);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const edge = inside(x, y) && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1));
    if (edge && free(x, y, spacing)) points.push({ x, y });
  }
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (inside(x, y) && free(x, y, spacing * 1.5)) points.push({ x, y });
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  points.forEach((p, i) => {
    points.map((q, j) => ({ j, d: Math.hypot(q.x - p.x, q.y - p.y) }))
      .filter(({ j, d }) => j !== i && d < spacing * 2.2)
      .sort((a, b) => a.d - b.d).slice(0, 4)
      .forEach(({ j, d }) => {
        const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
        const q = points[j];
        const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
        // Short links may follow a concave outline; longer ones must cross solid artwork, never a gap.
        const within = d < spacing * 1.4 ? near(mid.x, mid.y) : [.25, .5, .75].every(f => inside(p.x + (q.x - p.x) * f, p.y + (q.y - p.y) * f));
        if (seen.has(key) || !within) return;
        seen.add(key); edges.push([i, j]);
      });
  });
  // The mark grows from the base of the isotype towards the tips of its arms.
  const root = { x: w / 2, y: h };
  const reach = Math.max(...points.map(p => Math.hypot(p.x - root.x, p.y - root.y)), 1);
  const nodes = points.map((p, i) => {
    const seed = (Math.sin(i * 78.233) * 43758.5453) % 1;
    return { x: p.x / w, y: p.y / w, seed: Math.abs(seed), delay: .15 + (Math.hypot(p.x - root.x, p.y - root.y) / reach) * (BUILD - .9) + Math.abs(seed) * .12 };
  });
  return { nodes, edges, aspect: h / w };
}

export default function StrategyVisual({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext('2d');
    if (!context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, visible = false, elapsed = 0, previous = 0, disposed = false;
    let width = 0, height = 0, ratio = 1;
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0, pointerOn = 0, pointerTarget = 0;
    let ink = '', accent = '', background = '';
    let network: Network | null = null, image: HTMLImageElement | null = null;
    let size = 0, left = 0, top = 0;
    const tint = document.createElement('canvas');
    const colors = () => {
      const style = getComputedStyle(element);
      ink = style.getPropertyValue('--foreground').trim();
      accent = style.getPropertyValue('--accent').trim();
      background = style.getPropertyValue('--background').trim();
    };
    // The solid isotype is painted once per size and theme, in the current ink colour.
    const paintMark = () => {
      if (!image || !network || !size) return;
      tint.width = Math.max(1, Math.round(size * ratio));
      tint.height = Math.max(1, Math.round(size * network.aspect * ratio));
      const paint = tint.getContext('2d');
      if (!paint) return;
      paint.globalCompositeOperation = 'source-over';
      paint.clearRect(0, 0, tint.width, tint.height);
      paint.drawImage(image, 0, 0, tint.width, tint.height);
      paint.globalCompositeOperation = 'source-in';
      paint.fillStyle = ink; paint.fillRect(0, 0, tint.width, tint.height);
    };
    const layout = () => {
      const aspect = network?.aspect ?? .74;
      size = Math.min(width * .58, height * .46 / aspect);
      left = width / 2 - size / 2; top = height * .44 - size * aspect / 2;
      paintMark();
    };
    const anchors = [{ x: .17, y: .19 }, { x: .83, y: .19 }, { x: .17, y: .71 }, { x: .83, y: .71 }];
    const draw = (time: number) => {
      frame = 0;
      const moving = !reduced.matches;
      const dt = moving && previous ? Math.min(time - previous, 40) / 1000 : 0;
      elapsed += dt; previous = time;
      // Connect the points, settle into the clean mark, hold it, fade out and connect again.
      const phase = moving ? elapsed % CYCLE : BUILD + 1;
      const settle = easeOut((phase - BUILD) / .9);
      const mark = settle * (1 - easeOut((phase - CYCLE + FADE) / FADE));
      const intro = moving ? elapsed : 60;
      pointerX += (targetX - pointerX) * .18; pointerY += (targetY - pointerY) * .18;
      pointerOn += (pointerTarget - pointerOn) * .12;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const nodes = (network?.nodes || []).map(node => ({
        x: left + node.x * size + (moving ? Math.sin(elapsed * .8 + node.seed * 12) * 1.1 : 0),
        y: top + node.y * size + (moving ? Math.cos(elapsed * .7 + node.seed * 9) * 1.1 : 0),
        show: easeOut((phase - node.delay) / .35), delay: node.delay,
      }));
      // Business, customers, market, channels and the resulting strategy all connect into the mark.
      const sources = anchors.map((anchor, i) => {
        const x = width * anchor.x, y = height * anchor.y;
        let target = { x: width / 2, y: height * .44 };
        let best = Infinity;
        for (const node of nodes) { const d = (node.x - x) ** 2 + (node.y - y) ** 2; if (d < best) { best = d; target = node; } }
        return { x, y, tx: target.x, ty: target.y, reach: easeOut((intro - BUILD * .55 - i * .12) / .7), line: ink, lineAlpha: .16 };
      });
      if (network) sources.push({ x: width / 2, y: height * .83, tx: width / 2, ty: top + size * network.aspect + 6, reach: easeOut((intro - BUILD) / .9), line: accent, lineAlpha: .4 });
      sources.forEach((source, i) => {
        const { x, y, tx, ty, reach } = source;
        context.globalAlpha = source.lineAlpha; context.strokeStyle = source.line; context.lineWidth = .9;
        context.beginPath(); context.moveTo(x, y); context.lineTo(x + (tx - x) * reach, y + (ty - y) * reach); context.stroke();
        if (moving && reach >= 1) {
          // Each point keeps sending small dots along its line until they disappear into the isotype.
          context.fillStyle = ink;
          for (let k = 0; k < 3; k++) {
            const travel = ((elapsed + i * .37) / 2.4 + k / 3) % 1;
            const along = travel * travel * (3 - 2 * travel);
            context.globalAlpha = Math.sin(travel * Math.PI) * .7;
            context.beginPath(); context.arc(x + (tx - x) * along, y + (ty - y) * along, 2, 0, Math.PI * 2); context.fill();
          }
          const ring = ((elapsed + i * .48) / 2.4) % 1;
          context.globalAlpha = (1 - ring) * .3; context.strokeStyle = ink; context.lineWidth = 1;
          context.beginPath(); context.arc(x, y, 4 + ring * 10, 0, Math.PI * 2); context.stroke();
        }
        context.globalAlpha = 1; context.fillStyle = ink;
        context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill();
      });
      if (network && mark > 0) { context.globalAlpha = mark; context.drawImage(tint, left, top, size, size * network.aspect); }
      // While building, each link grows from the earlier node and reaches the later one as it appears.
      if (network && settle < 1) {
        const links = new Path2D();
        network.edges.forEach(([a, b]) => {
          const [from, to] = nodes[a].delay <= nodes[b].delay ? [nodes[a], nodes[b]] : [nodes[b], nodes[a]];
          const grow = easeOut((phase - from.delay) / Math.max(to.delay + .1 - from.delay, .3));
          if (grow <= 0) return;
          links.moveTo(from.x, from.y); links.lineTo(from.x + (to.x - from.x) * grow, from.y + (to.y - from.y) * grow);
        });
        context.globalAlpha = .5 * (1 - settle); context.strokeStyle = ink; context.lineWidth = .9;
        context.stroke(links);
        context.fillStyle = ink;
        for (const node of nodes) {
          if (node.show <= 0) continue;
          const pop = node.show < 1 ? Math.sin(node.show * Math.PI) * 1.4 : 0;
          context.globalAlpha = node.show * (1 - settle);
          context.beginPath(); context.arc(node.x, node.y, 2 * node.show + pop, 0, Math.PI * 2); context.fill();
        }
      }
      // Under a mouse, the network shows through the clean mark around the cursor.
      if (network && moving && pointerOn > .01 && mark > 0) {
        const lit = nodes.map(node => clamp(1 - Math.hypot(node.x - pointerX, node.y - pointerY) / 110) * pointerOn * mark);
        context.strokeStyle = background; context.lineWidth = .9;
        network.edges.forEach(([a, b]) => {
          const glow = Math.min(lit[a], lit[b]);
          if (glow <= 0) return;
          context.globalAlpha = glow * .55;
          context.beginPath(); context.moveTo(nodes[a].x, nodes[a].y); context.lineTo(nodes[b].x, nodes[b].y); context.stroke();
        });
        context.fillStyle = background;
        nodes.forEach((node, i) => {
          if (lit[i] <= 0) return;
          context.globalAlpha = lit[i] * .9;
          context.beginPath(); context.arc(node.x, node.y, 1.8, 0, Math.PI * 2); context.fill();
        });
      }
      context.globalAlpha = 1;
      if (moving && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const refresh = () => { cancelAnimationFrame(frame); previous = 0; colors(); paintMark(); draw(performance.now()); };
    const resize = new ResizeObserver(() => {
      width = element.clientWidth; height = element.clientHeight; ratio = Math.min(devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio); layout(); refresh();
    });
    resize.observe(element);
    // Each time the hero comes back into view, the points connect again from the base.
    const observer = new IntersectionObserver(entries => {
      const wasVisible = visible;
      visible = entries[0].isIntersecting;
      cancelAnimationFrame(frame); previous = 0;
      if (visible && !wasVisible) elapsed = 0;
      if (visible) refresh();
    }, { threshold: .05 });
    observer.observe(element);
    const symbol = new Image();
    symbol.src = '/brand/oddly-symbol.webp';
    symbol.decode().then(() => {
      if (disposed) return;
      image = symbol; network = traceIsotype(symbol); elapsed = 0; layout(); refresh();
    }).catch(() => {});
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = element.getBoundingClientRect();
      targetX = event.clientX - bounds.left; targetY = event.clientY - bounds.top;
      if (!pointerTarget) { pointerX = targetX; pointerY = targetY; }
      pointerTarget = 1;
    };
    const resetPointer = () => { pointerTarget = 0; };
    element.addEventListener('pointermove', onPointer); element.addEventListener('pointerleave', resetPointer);
    reduced.addEventListener('change', refresh); window.addEventListener('oddly-theme-change', refresh); document.addEventListener('visibilitychange', refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      element.removeEventListener('pointermove', onPointer); element.removeEventListener('pointerleave', resetPointer);
      reduced.removeEventListener('change', refresh);
      window.removeEventListener('oddly-theme-change', refresh); document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return <figure className="strategy-visual" aria-label={t('Tu negocio, clientes, mercado y canales se conectan en una evaluación para definir tu estrategia.')}>
    <canvas ref={canvas} aria-hidden="true" />
    <span className="strategy-visual__label strategy-visual__label--business">{t('Tu negocio')}</span><span className="strategy-visual__label strategy-visual__label--customers">{t('Tus clientes')}</span><span className="strategy-visual__label strategy-visual__label--market">{t('Tu mercado')}</span><span className="strategy-visual__label strategy-visual__label--channels">{t('Tus canales')}</span>
    <figcaption>{t('Una estrategia')}<br /><strong>{t('a tu medida.')}</strong></figcaption>
  </figure>;
}
