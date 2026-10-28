import { getTranslator, type Locale } from '@/lib/i18n';

const C = 200;
// Angles run clockwise from 12 o'clock, matching how the cycle is read.
const polar = (r: number, deg: number) => {
  const a = deg * Math.PI / 180;
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
};
// Ring segment whose leading edge is an arrow tip and trailing edge a matching notch, so segments interlock.
const arrowSegment = (from: number, to: number, inner: number, outer: number, tip: number) => {
  const mid = (inner + outer) / 2;
  const large = to - from > 180 ? 1 : 0;
  return `M${polar(outer, from)} A${outer} ${outer} 0 ${large} 1 ${polar(outer, to)} L${polar(mid, to + tip)} L${polar(inner, to)} A${inner} ${inner} 0 ${large} 0 ${polar(inner, from)} L${polar(mid, from + tip)} Z`;
};
const circlePath = (r: number, start: number) => `M${polar(r, start)} A${r} ${r} 0 1 1 ${polar(r, start + 180)} A${r} ${r} 0 1 1 ${polar(r, start)}`;

const stages = ['Datos', 'Estrategia', 'Crecimiento'] as const;

export default function CycleVisual({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const [first, second] = t('Ciclo Oddly').split(' ');
  return <svg className="cycle-visual" viewBox="0 0 400 400" role="img" aria-label={t('El Ciclo Oddly: datos, estrategia y crecimiento.')}>
    <defs>
      <path id="cycle-outer-path" d={circlePath(177, -45)} />
      <path id="cycle-inner-path" d={circlePath(121, -60)} />
    </defs>
    <circle cx={C} cy={C} r={197} className="cycle-visual__gap" />
    <g className="cycle-visual__outer">
      {[0, 1, 2, 3].map(i => <path key={i} className={`cycle-visual__tone-${i % 2 ? 'b' : 'a'}`} d={arrowSegment(-45 + i * 90, 45 + i * 90, 159, 195, 7)} />)}
      <text className="cycle-visual__brand">{[12.5, 37.5, 62.5, 87.5].map(offset => <textPath key={offset} href="#cycle-outer-path" startOffset={`${offset}%`}>ODDLY</textPath>)}</text>
    </g>
    <g className="cycle-visual__inner">
      {stages.map((stage, i) => <path key={stage} className={`cycle-visual__tone-${'cde'[i]}`} d={arrowSegment(-60 + i * 120, 60 + i * 120, 90, 152, 9)} />)}
      <text className="cycle-visual__stage">{stages.map((stage, i) => <textPath key={stage} href="#cycle-inner-path" startOffset={`${(i * 2 + 1) * 100 / 6}%`}>{t(stage)}</textPath>)}</text>
    </g>
    <circle cx={C} cy={C} r={76} className="cycle-visual__core" />
    <text className="cycle-visual__title" x={C} y={C}><tspan x={C} dy="-.55em">{first}</tspan><tspan x={C} dy="1.1em">{second}</tspan></text>
  </svg>;
}
