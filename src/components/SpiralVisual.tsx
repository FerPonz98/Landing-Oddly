'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import { useEffect, useRef } from 'react';

const LOOPS = 3, TAU = Math.PI * 2, END = LOOPS * TAU, START = 20 * Math.PI / 180;
const stages = ['Datos', 'Estrategia', 'Crecimiento'] as const;
const parse = (hex: string) => { const h = hex.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };

export default function SpiralVisual({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const translate = getTranslator(locale);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 400, height = 400, ratio = 1, frame = 0, visible = false, clock = 0, previous = 0, font = 'sans-serif';
    const colors: Record<string, string> = {};
    const read = () => {
      const style = getComputedStyle(element);
      for (const key of ['spiral-1', 'spiral-2', 'spiral-3', 'accent', 'background', 'foreground', 'muted']) colors[key] = style.getPropertyValue(`--${key}`).trim();
      font = style.fontFamily;
    };
    // Each round of the cycle sits higher and wider than the one before; the dot runs it from the top down.
    const point = (turn: number) => {
      const s = width / 400, loop = turn / TAU, a = turn + START, r = (60 + 24 * loop) * s;
      return { x: width * .56 + r * Math.cos(a), y: height - 84 * s - loop * 82 * s + r * .34 * Math.sin(a), depth: Math.sin(a) };
    };
    const stageOf = (turn: number) => Math.min(2, Math.floor((turn % TAU) / (TAU / 3)));
    // The far side of each round blends into the paper for depth.
    const shade = (hex: string, back: boolean) => {
      const a = parse(hex), b = parse(colors.background || '#fffdf9'), k = back ? .28 : 0;
      return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
    };
    // The spiral itself never changes, so it is painted once per size and theme into a back and a front layer;
    // each frame only stacks them around the moving dot.
    const layers = [document.createElement('canvas'), document.createElement('canvas')];
    const paint = () => layers.forEach((layer, index) => {
      const front = index === 1, ink = layer.getContext('2d');
      layer.width = element.width; layer.height = element.height;
      if (!ink) return;
      const s = width / 400, band = 24 * s, tones = [1, 2, 3].map(n => shade(colors[`spiral-${n}`], !front));
      ink.setTransform(ratio, 0, 0, ratio, 0, 0); ink.lineCap = 'round';
      for (let turn = 0; turn < END; turn += .035) {
        const a = point(turn), b = point(Math.min(END, turn + .04)), mid = (a.depth + b.depth) / 2;
        if (mid >= 0 !== front || (END - turn) % (TAU / 3) < .16) continue;
        ink.strokeStyle = tones[stageOf(END - turn)];
        ink.lineWidth = band * (.82 + .18 * (mid + 1) / 2);
        ink.beginPath(); ink.moveTo(a.x, a.y); ink.lineTo(b.x, b.y); ink.stroke();
      }
      if (!front) return;
      // The lowest round ends in an arrow that keeps heading the way the dot runs.
      const tip = point(.02), back = point(.3), angle = Math.atan2(tip.y - back.y, tip.x - back.x);
      ink.fillStyle = colors['spiral-3'];
      ink.beginPath();
      ink.moveTo(tip.x + Math.cos(angle) * band * .85, tip.y + Math.sin(angle) * band * .85);
      ink.lineTo(tip.x + Math.cos(angle + 2.2) * band * .7, tip.y + Math.sin(angle + 2.2) * band * .7);
      ink.lineTo(tip.x + Math.cos(angle - 2.2) * band * .7, tip.y + Math.sin(angle - 2.2) * band * .7);
      ink.closePath(); ink.fill();
      ink.font = `600 ${12 * s}px ${font}`; ink.textBaseline = 'middle'; ink.textAlign = 'right'; ink.fillStyle = colors.muted;
      for (let loop = 0; loop < LOOPS; loop++) {
        const left = point(loop * TAU + Math.PI - START);
        ink.fillText(`${translate('Vuelta')} ${LOOPS - loop}`, left.x - band * .85, left.y);
      }
    });
    const draw = (now: number) => {
      frame = 0;
      clock += previous ? Math.min(now - previous, 50) / 1000 : 0; previous = now;
      const s = width / 400, band = 24 * s;
      const travel = reduced.matches ? END : (clock * 1.15) % (END + 2.4), dot = END - Math.min(travel, END);
      context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, element.width, element.height);
      for (const front of [false, true]) {
        context.setTransform(1, 0, 0, 1, 0, 0); context.drawImage(layers[front ? 1 : 0], 0, 0);
        context.setTransform(ratio, 0, 0, ratio, 0, 0); context.lineCap = 'round';
        // An orange trail follows the dot, over the stretch it has just come down.
        context.strokeStyle = colors.accent; context.lineWidth = band * .34;
        for (let turn = dot; turn < Math.min(END, dot + 1.4); turn += .03) {
          const a = point(turn), b = point(Math.min(END, turn + .035)), mid = (a.depth + b.depth) / 2;
          if (mid >= 0 !== front) continue;
          context.globalAlpha = (1 - (turn - dot) / 1.4) * .85;
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
        }
        context.globalAlpha = 1;
        const head = point(dot);
        if (head.depth >= 0 === front) {
          context.fillStyle = colors.accent; context.beginPath(); context.arc(head.x, head.y, band * .42, 0, TAU); context.fill();
          context.strokeStyle = colors.background; context.lineWidth = 2.5 * s; context.stroke();
        }
      }
      // A pill above the dot names the current stage and round.
      const head = point(dot), current = Math.min(END - dot, END - .001);
      const label = `${translate(stages[stageOf(current)])} · ${translate('vuelta')} ${Math.floor(current / TAU) + 1}`;
      context.font = `600 ${12.5 * s}px ${font}`; context.textBaseline = 'middle'; context.textAlign = 'center';
      const w = context.measureText(label).width + 18 * s, h = 24 * s;
      const x = Math.max(w / 2 + 4, Math.min(width - w / 2 - 4, head.x)), y = head.y - band * 1.25;
      context.fillStyle = colors.foreground; context.beginPath();
      if (context.roundRect) context.roundRect(x - w / 2, y - h / 2, w, h, h / 2); else context.rect(x - w / 2, y - h / 2, w, h);
      context.fill(); context.fillStyle = colors.background; context.fillText(label, x, y + .5);
      if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    };
    const refresh = () => { cancelAnimationFrame(frame); previous = 0; read(); paint(); draw(performance.now()); };
    const resize = new ResizeObserver(() => {
      width = element.clientWidth; height = element.clientHeight; ratio = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio); refresh();
    });
    resize.observe(element);
    const resume = () => { cancelAnimationFrame(frame); previous = 0; draw(performance.now()); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) resume(); }, { threshold: .05 });
    observer.observe(element);
    reduced.addEventListener('change', refresh); window.addEventListener('oddly-theme-change', refresh); document.addEventListener('visibilitychange', resume);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      reduced.removeEventListener('change', refresh); window.removeEventListener('oddly-theme-change', refresh); document.removeEventListener('visibilitychange', resume);
    };
  }, [locale]);
  return <div className="spiral-visual">
    <canvas ref={canvas} role="img" aria-label={t('El Ciclo Oddly en espiral: tres vueltas de datos, estrategia y crecimiento.')} />
    <div className="spiral-visual__legend" aria-hidden="true">{stages.map((stage, i) => <span key={stage}><i className={`spiral-visual__swatch-${i + 1}`} />{t(stage)}</span>)}<span><i className="spiral-visual__swatch-dot" />{t('Tu empresa')}</span></div>
  </div>;
}
