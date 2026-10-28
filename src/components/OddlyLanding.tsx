import { getTranslator, type Locale } from '@/lib/i18n';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Check, Minus, Plus, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import LandingHeader from './LandingHeader';
import StrategyVisual from './StrategyVisual';
import { getWhatsAppHref, oddlyWhatsAppNumber } from '@/lib/contact';
import LandingMotion from './LandingMotion';
import ProcessExplorer from './ProcessExplorer';
import BackgroundTrails from './BackgroundTrails';
import CycleVisual from './CycleVisual';


export function BrandLogo() {
  return <span className="brand-logo">
    <Image className="brand-logo__dark" src="/brand/oddly-dark.webp" alt="Oddly" width={600} height={420} priority />
    <Image className="brand-logo__light" src="/brand/oddly-light.webp" alt="Oddly" width={600} height={420} priority />
  </span>;
}
function ContactAction({ secondary = false, locale, href: whatsappHref }: { secondary?: boolean; locale: Locale; href?: string }) {
  const t = getTranslator(locale);
  return <a className={`button${secondary ? ' button--outline' : ''}`} href={whatsappHref || '#contacto'} target={whatsappHref ? '_blank' : undefined} rel={whatsappHref ? 'noopener noreferrer' : undefined}><span>{t('Hablemos de tu empresa')}</span><ArrowUpRight size={20} aria-hidden="true" /></a>;
}
const faqs = [
  { question: '¿Trabajan con empresas de cualquier sector?', answer: 'Sí. Evaluamos cada empresa en su propio contexto. El sector, los clientes, la situación actual y los objetivos influyen en la estrategia que recomendamos.' },
  { question: '¿Qué pasa si todavía no sé qué necesita mi empresa?', answer: 'Ese es un buen punto de partida. La evaluación nos ayuda a entender tu situación, identificar oportunidades y orientar las decisiones de marketing.' },
  { question: '¿Oddly también ejecuta las campañas?', answer: 'Sí. El Ciclo Oddly no se queda en la recomendación: diseño, contenido, redes y web se ejecutan con nosotros, dentro del mismo proceso que ya te diagnosticó qué hacer.' },
  { question: '¿Todas las empresas reciben la misma estrategia?', answer: 'No. Una estrategia útil depende de tu negocio. Las recomendaciones se adaptan a tus objetivos, tus clientes y las oportunidades que encontramos al evaluar tu empresa.' },
  { question: '¿Pueden garantizar un aumento de ventas?', answer: 'Garantizamos el trabajo, no una cifra: cada ciclo tiene objetivos claros, reportes con números reales y ajustes basados en datos. Así sabrás en todo momento cuánto avanzan tus ventas y qué hacemos para que avancen más.' },
] as const;
const cycle = [
  { name: 'Diagnóstico', title: 'Entender antes de actuar.', text: 'Conocemos tu empresa, tus clientes y tu mercado para encontrar qué está frenando tus ventas.' },
  { name: 'Marca', title: 'Desde dónde construir.', text: 'Ya sabes cuál es el problema. Te damos algo sólido desde donde construir tu marca.' },
  { name: 'Estrategia', title: 'Un porqué detrás de cada paso.', text: 'Te orientamos sobre qué hacer y por qué, con recomendaciones adaptadas a tu empresa.' },
  { name: 'Ejecución', title: 'La estrategia se vuelve real.', text: 'Diseño, audiovisual, redes, web: lo construimos nosotros, no solo lo sugerimos.' },
  { name: 'Medición', title: 'Medimos, ajustamos, seguimos.', text: 'No entregamos estrategia y desaparecemos. Medimos, ajustamos y volvemos a empezar.' },
] as const;
export default function OddlyLanding({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const whatsappHref = getWhatsAppHref(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || oddlyWhatsAppNumber, locale);
  return <>
    <LandingMotion />
    <BackgroundTrails />
    <div className="brand-watermark" aria-hidden="true"><Image src="/brand/oddly-light.webp" alt="" width={600} height={420} /></div>
    <a className="skip-link" href="#contenido">{t('Saltar al contenido')}</a>
    <LandingHeader locale={locale} logo={<BrandLogo />} whatsappHref={whatsappHref} />
    <main id="contenido">
      <section className="hero section-shell" id="top" aria-labelledby="hero-title">
        <div className="hero__copy">
          <h1 id="hero-title"><span>{t('Marketing pensado')}</span><span>{t('para ')}<em>{t('vender mejor.')}</em></span></h1>
          <p className="hero__description">{t('Evaluamos tu empresa y recomendamos la estrategia de marketing que mejor responde a tus objetivos de ventas.')}</p>
          <div className="hero__actions"><ContactAction locale={locale} href={whatsappHref} /><a className="text-link" href="#proceso">{t('Conoce nuestro proceso')}<ArrowRight size={19} aria-hidden="true" /></a></div>
        </div>
        <div className="hero__visual"><StrategyVisual locale={locale} /></div>
        <div className="hero__closing"><span>{t('Tu negocio es único.')}</span><span>{t('Tu estrategia también debería serlo.')}</span></div>
      </section>
      <section className="approach section-shell section-space" id="problema" aria-labelledby="approach-title">
        <div className="section-heading"><h2 id="approach-title">{t('Antes de recomendar,')}<br /><span className="muted-heading">{t('hay que entender.')}</span></h2><p>{t('Hay muchas formas de hacer marketing. Elegir la adecuada empieza por conocer lo que tu empresa realmente necesita.')}</p></div>
        <div className="approach__body">
          <div className="approach__statement" data-tilt><CycleVisual locale={locale} /><span className="approach__line" aria-hidden="true" /><p>{t('Una buena estrategia')}<br />{t('empieza por entender')}<br /><strong>{t('tu empresa.')}</strong></p></div>
          <div className="assessment-list">
            <div><h3>{t('Tu negocio y tus objetivos')}</h3><p>{t('Dónde estás hoy y hacia dónde quieres llevar tus ventas.')}</p></div>
            <div><h3>{t('Tus clientes y tu mercado')}</h3><p>{t('A quién necesitas llegar y qué influye en su decisión de compra.')}</p></div>
            <div><h3>{t('Tu propuesta y tus canales')}</h3><p>{t('Cómo comunicas tu valor y cómo conectas con tus clientes.')}</p></div>
            <div><h3>{t('Tus oportunidades de mejora')}</h3><p>{t('Qué puede ayudarte a enfocar mejor tus esfuerzos de marketing.')}</p></div>
          </div>
        </div>
      </section>
      <section className="process section-space" id="proceso" aria-labelledby="process-title"><div className="section-shell">
        <div className="section-heading"><h2 id="process-title">{t('Del diagnóstico')}<br />{t('a una dirección clara.')}</h2><p>{t('Un proceso para transformar la percepción de tu marca en un activo que se puede ver crecer.')}</p></div>
        <ProcessExplorer locale={locale} />
      </div></section>
      <section className="advisory section-shell section-space" id="proyectos" aria-labelledby="advisory-title">
        <div id="asesoria" className="anchor-alias" />
        <div className="advisory__intro"><h2 id="advisory-title">{t('Más claridad.')}<br />{t('Mejores decisiones.')}</h2><p>{t('Asesoría de marketing para saber dónde enfocar tu esfuerzo y qué estrategia tiene sentido para tu empresa.')}</p><ContactAction secondary locale={locale} href={whatsappHref} /></div>
        <div className="advisory__outcomes"><h3>{t('Lo que aporta nuestra asesoría')}</h3>
          <div><Check size={22} aria-hidden="true" /><p><strong>{t('Una lectura de tu situación.')}</strong><span>{t('Entender el punto de partida de tu negocio y sus necesidades de marketing.')}</span></p></div>
          <div><Check size={22} aria-hidden="true" /><p><strong>{t('Prioridades con sentido.')}</strong><span>{t('Identificar las oportunidades que merecen tu atención.')}</span></p></div>
          <div><Check size={22} aria-hidden="true" /><p><strong>{t('Planificación a tu medida.')}</strong><span>{t('Orientación sobre qué hacer y por qué, según los objetivos de tu empresa.')}</span></p></div>
        </div>
      </section>
      <section className="cycle section-shell section-space" id="ciclo" aria-labelledby="cycle-title">
        <div className="section-heading"><h2 id="cycle-title">{t('El Ciclo Oddly.')}</h2><p>{t('Del diagnóstico a la medición, un mismo equipo acompaña cada etapa de tu marca.')}</p></div>
        <ol className="cycle__steps">{cycle.map((step, index) => <li key={step.name}><span className="cycle__number">0{index + 1}</span><h3>{t(step.name)}</h3><p><strong>{t(step.title)}</strong><span>{t(step.text)}</span></p></li>)}</ol>
      </section>
      <div id="estudio" className="section-shell" aria-hidden="true" />
      <section className="faq section-shell section-space" id="faq" aria-labelledby="faq-title"><div className="faq__heading"><h2 id="faq-title">{t('Hablemos')}<br />{t('con claridad.')}</h2><p>{t('Algunas preguntas antes de empezar.')}</p></div><div className="faq__items">{faqs.map(item => <details key={t(item.question)}><summary>{t(item.question)}<span className="faq__toggle" aria-hidden="true"><Plus className="faq__plus" size={16} /><Minus className="faq__minus" size={16} /></span></summary><p>{t(item.answer)}</p></details>)}</div></section>
      <section className="contact section-shell" id="contacto" aria-labelledby="contact-title"><div className="contact__inner"><div><h2 id="contact-title">{t('El siguiente paso empieza')}<br />{t('por conocer tu empresa.')}</h2><p>{t('Cuéntanos qué quieres mejorar. Empecemos una conversación sobre tu negocio y tus objetivos de ventas.')}</p></div><div className="contact__action">{whatsappHref ? <><ContactAction locale={locale} href={whatsappHref} /><span className="contact__channel"><WhatsappLogo size={18} aria-hidden="true" />{t('Conversemos por WhatsApp')}</span></> : <><button className="button" disabled>{t('WhatsApp no disponible')}<WhatsappLogo size={20} aria-hidden="true" /></button><p className="contact__notice">{t('Nuestro canal de contacto estará disponible próximamente.')}</p></>}</div></div></section>
    </main>
    <footer className="footer section-shell"><a href="#top" aria-label={t('Oddly, volver al inicio')}><span className="brand-symbol" aria-hidden="true" /></a><p>{t('Una estrategia pensada para tu negocio.')}</p><a className="text-link" href="#top">{t('Volver arriba')}<ArrowUpRight size={18} aria-hidden="true" /></a><small>© {new Date().getFullYear()} Oddly</small></footer>
  </>;
}
