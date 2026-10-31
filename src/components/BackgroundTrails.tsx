'use client';
import { useEffect, useRef } from 'react';

// Curved trajectories echo the contact ring; scroll gradually gives them presence.
export default function BackgroundTrails() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, elapsed = 0, previous = 0, width = innerWidth, height = innerHeight, ratio = 1, progress = 0;
    let color = '';
    const updateColor = () => { color = getComputedStyle(element).getPropertyValue('--accent').trim(); };
    const updateScroll = () => {
      const range = document.documentElement.scrollHeight - innerHeight;
      progress = range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0;
      if (reduced.matches || !frame || progress <= .01) refresh();
    };
    let routes: Path2D[] = [];
    const point = (t: number, i: number) => {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side === 1 ? -.12 : 1.12;
      const lane = ((i * .618034) % 1) * .22;
      const end = side === 1 ? .2 + lane : .8 - lane;
      const u = 1 - t;
      return {
        x: width * (u * u * u * x + 3 * u * u * t * (x + side * .5) + 3 * u * t * t * (end - side * .3) + t * t * t * end),
        y: height * (u * u * u * (-.25 + ((i * .381966) % 1) * .5) + 3 * u * u * t * .35 + 3 * u * t * t * .55 + t * t * t * (1.1 + ((i * .217) % 1) * .3)),
      };
    };
    const draw = (time: number) => {
      frame = 0;
      const moving = !reduced.matches && !document.hidden;
      if (moving && previous) elapsed += Math.min(time - previous, 50) / 1000;
      previous = time;
      context.setTransform(ratio, 0, 0, ratio, 0, 0); context.clearRect(0, 0, width, height);
      const baseline = width < 700 ? 10 : 18;
      const targetCount = Math.min(routes.length, baseline * (1 + 3 * Math.pow(progress, 1.2)));
      const count = Math.ceil(targetCount);
      element.dataset.trailCount = String(targetCount);
      const intensity = .03 + Math.pow(progress, 1.2) * .4;
      context.strokeStyle = color; context.lineCap = 'round';
      for (let i = 0; i < count; i++) {
        const presence = Math.min(1, targetCount - i);
        // A quiet complete arc gives each moving trail a coherent route.
        context.globalAlpha = intensity * .18 * presence; context.lineWidth = .8;
        context.stroke(routes[i]);
        if (reduced.matches) continue;
        const head = (elapsed * (.065 + i * .003) + i * .143 + progress * .2) % 1;
        const length = .12;
        for (let n = 0; n < segments; n++) {
          const start = head - length + length * n / segments;
          if (start < 0) continue;
          const a = point(start, i), b = point(start + length / segments, i);
          context.globalAlpha = intensity * presence * (n / segments) * Math.sin(head * Math.PI);
          context.lineWidth = 1 + n / segments * 1.3;
          context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
        }
      }
      context.globalAlpha = 1;
      if (moving && progress > .01) frame = requestAnimationFrame(draw);
    };
    const refresh = () => { cancelAnimationFrame(frame); previous = 0; updateColor(); draw(performance.now()); };
    // Phones resize the viewport whenever the address bar shows or hides; only a real size change rebuilds the trails.
    let segments = 24;
    const resize = () => {
      if (routes.length && innerWidth === width && Math.abs(innerHeight - height) < 160) return;
      width = innerWidth; height = innerHeight;
      // Phones draw fewer, coarser trails at device pixel ratio 1.
      const phone = width < 700;
      ratio = phone ? 1 : Math.min(devicePixelRatio || 1, 2); segments = phone ? 12 : 24;
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio);
      routes = Array.from({ length: phone ? 20 : 72 }, (_, i) => {
        const route = new Path2D();
        for (let n = 0; n <= 60; n++) { const p = point(n / 60, i); if (!n) route.moveTo(p.x, p.y); else route.lineTo(p.x, p.y); }
        return route;
      });
      updateScroll(); refresh();
    };
    window.addEventListener('resize', resize); window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('oddly-theme-change', refresh); document.addEventListener('visibilitychange', refresh); reduced.addEventListener('change', refresh);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize); window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('oddly-theme-change', refresh); document.removeEventListener('visibilitychange', refresh); reduced.removeEventListener('change', refresh);
    };
  }, []);
  return <canvas ref={canvas} className="background-trails" aria-hidden="true" />;
}
