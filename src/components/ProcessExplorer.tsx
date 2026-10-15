'use client';
import { getTranslator, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
const steps = [
  { title: 'Conocemos tu empresa', text: 'Empezamos por tu negocio: qué ofreces, a quién quieres llegar y cuáles son tus objetivos de ventas.', question: '¿Qué quieres conseguir con tu negocio?' },
  { title: 'Evaluamos tu situación', text: 'Revisamos cómo conectas con tus clientes y qué puede estar limitando tus oportunidades comerciales.', question: '¿Qué está frenando tus oportunidades de venta?' },
  { title: 'Identificamos oportunidades', text: 'Distinguimos dónde conviene enfocar tus esfuerzos y qué necesita atención primero.', question: '¿Dónde puede marcar la diferencia tu marketing?' },
  { title: 'Recomendamos una estrategia', text: 'Te orientamos sobre qué hacer y por qué, con recomendaciones adaptadas a la realidad de tu empresa.', question: '¿Cuál es el siguiente paso que tiene sentido para ti?' },
] as const;
export default function ProcessExplorer({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const [active, setActive] = useState(0);
  return <div className="process-explorer">
    <div className="process-tabs" role="tablist" aria-label={t('Explora las etapas de nuestra asesoría')}>{steps.map((step, index) => <button key={t(step.title)} id={`step-${index}`} role="tab" aria-selected={active === index} aria-controls="process-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % steps.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + steps.length - 1) % steps.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = steps.length - 1;
      else return;
      event.preventDefault(); setActive(next); document.getElementById(`step-${next}`)?.focus();
    }}><span className="process-tab__number">0{index + 1}</span><span>{t(step.title)}</span><ArrowUpRight size={23} aria-hidden="true" /></button>)}</div>
    <div className="process-panel" id="process-panel" role="tabpanel" aria-labelledby={`step-${active}`} tabIndex={0}>
      <span className="process-panel__number" aria-hidden="true">0{active + 1}</span>
      <div className="process-panel__copy" key={active}><h3>{t(steps[active].question)}</h3><p>{t(steps[active].text)}</p><span className="process-panel__hint">{t('Selecciona una etapa para explorar el proceso.')}</span></div>
    </div>
  </div>;
}
