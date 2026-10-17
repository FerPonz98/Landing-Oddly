'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import { useEffect, useRef } from 'react';

export default function StrategyVisual({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext('2d');
    if (!context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, visible = false, elapsed = 0, previous = 0;
    let width = 0, height = 0, ratio = 1;
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0, scroll = 0;
    let ink = '', accent = '', background = '';
    const colors = () => {
      const style = getComputedStyle(element);
      ink = style.getPropertyValue('--foreground').trim();
      accent = style.getPropertyValue('--accent').trim();
      background = style.getPropertyValue('--background').trim();
    };
    const draw = (time: number) => {
      const moving = !reduced.matches;
      if (moving && previous) elapsed += Math.min(time - previous, 40) / 1000;
      previous = time;
      if (moving) { pointerX += (targetX - pointerX) * .065; pointerY += (targetY - pointerY) * .065; }
      const t = reduced.matches ? 0 : elapsed;
      const turn = reduced.matches ? 0 : scroll;
      const yaw = t * .17 + (reduced.matches ? 0 : pointerX) + turn * 1.1;
      const pitch = .42 + (reduced.matches ? 0 : pointerY) + turn * .3;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const cx = width * .5, cy = height * .43, radius = Math.min(width, height) * .28;
      const project = (x: number, y: number, z: number) => {
        const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
        const rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
        const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
        const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
        const scale = 3.6 / (3.6 - depth);
        return { x: cx + rx * radius * scale, y: cy + ry * radius * scale, z: depth, scale };
      };
      // Rotating great circles and depth-scaled satellites share a true 3D projection.
      const orbit = (angle: number, plane: number) => {
        const x = Math.cos(angle), y = Math.sin(angle);
        const twist = plane * Math.PI / 3;
        return project(x, y * Math.cos(twist), y * Math.sin(twist));
      };
      const groups = [{ x: .17, y: .19 }, { x: .83, y: .19 }, { x: .17, y: .71 }, { x: .83, y: .71 }];
      groups.forEach((group, i) => {
        const x = width * group.x, y = height * group.y;
        context.strokeStyle = ink; context.globalAlpha = .14; context.lineWidth = .8;
        context.beginPath(); context.moveTo(x, y); context.lineTo(cx, cy); context.stroke();
        const flow = (t * .2 + i * .25) % 1;
        context.globalAlpha = .85; context.fillStyle = accent;
        context.beginPath(); context.arc(x + (cx - x) * flow, y + (cy - y) * flow, 2.5, 0, Math.PI * 2); context.fill();
        context.fillStyle = ink; context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill();
      });
      for (let plane = 0; plane < 3; plane++) {
        for (let step = 0; step < 100; step++) {
          const a = orbit(step * Math.PI * 2 / 100, plane), b = orbit((step + 1) * Math.PI * 2 / 100, plane);
          context.globalAlpha = .14 + (a.z + 1) * .13;
          context.strokeStyle = plane === 1 ? ink : accent; context.lineWidth = 1;
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
        }
      }
      const core = radius * .38;
      context.globalAlpha = 1;
      const sphere = context.createRadialGradient(cx - core * .4, cy - core * .45, core * .04, cx + core * .2, cy + core * .2, core * 1.2);
      sphere.addColorStop(0, '#df793e'); sphere.addColorStop(.5, '#cf5b25'); sphere.addColorStop(1, '#99401e');
      context.fillStyle = sphere; context.beginPath(); context.arc(cx, cy, core, 0, Math.PI * 2); context.fill();
      for (let i = 0; i < 12; i++) {
        const point = orbit(i * 2.4 + t * (i % 2 ? .24 : -.18), i % 3);
        context.globalAlpha = .45 + (point.z + 1) * .25;
        context.fillStyle = i % 3 === 0 ? ink : accent;
        context.beginPath(); context.arc(point.x, point.y, (i % 3 === 0 ? 4.5 : 2.5) * point.scale, 0, Math.PI * 2); context.fill();
      }
      context.globalAlpha = .4; context.strokeStyle = accent;
      context.beginPath(); context.moveTo(cx, cy + radius * 1.35); context.lineTo(cx, height * .85); context.stroke();
      context.globalAlpha = 1; context.fillStyle = background;
      if (moving && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const refresh = () => { cancelAnimationFrame(frame); previous = 0; colors(); draw(performance.now()); };
    const resize = new ResizeObserver(() => {
      width = element.clientWidth; height = element.clientHeight; ratio = Math.min(devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio); refresh();
    });
    resize.observe(element);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; cancelAnimationFrame(frame); previous = 0; if (visible) refresh(); }, { threshold: .05 });
    observer.observe(element);
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = element.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 1.2;
      targetY = ((event.clientY - bounds.top) / bounds.height - .5) * .8;
    };
    const resetPointer = () => { targetX = 0; targetY = 0; };
    const onScroll = () => { if (visible && !reduced.matches) scroll = Math.min(window.scrollY / window.innerHeight, 1.5); };
    element.addEventListener('pointermove', onPointer); element.addEventListener('pointerleave', resetPointer);
    window.addEventListener('scroll', onScroll, { passive: true });
    reduced.addEventListener('change', refresh); window.addEventListener('oddly-theme-change', refresh); document.addEventListener('visibilitychange', refresh);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      element.removeEventListener('pointermove', onPointer); element.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('scroll', onScroll); reduced.removeEventListener('change', refresh);
      window.removeEventListener('oddly-theme-change', refresh); document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return <figure className="strategy-visual" aria-label={t('Tu negocio, clientes, mercado y canales se conectan en una evaluación para definir tu estrategia.')}>
    <canvas ref={canvas} aria-hidden="true" />
    <span className="strategy-visual__label strategy-visual__label--business">{t('Tu negocio')}</span><span className="strategy-visual__label strategy-visual__label--customers">{t('Tus clientes')}</span><span className="strategy-visual__label strategy-visual__label--market">{t('Tu mercado')}</span><span className="strategy-visual__label strategy-visual__label--channels">{t('Tus canales')}</span>
    <span className="strategy-visual__diagnosis">{t('Evaluación')}</span><figcaption>{t('Una estrategia')}<br /><strong>{t('a tu medida.')}</strong></figcaption>  </figure>;
}
