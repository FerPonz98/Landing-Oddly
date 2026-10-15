import { getTranslator, type Locale } from '@/lib/i18n';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Check, Minus, Plus, Target, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import LandingHeader from './LandingHeader';
import StrategyVisual from './StrategyVisual';
import { getWhatsAppHref, oddlyWhatsAppNumber } from '@/lib/contact';
import LandingMotion from './LandingMotion';
import ProcessExplorer from './ProcessExplorer';
import BackgroundTrails from './BackgroundTrails';


export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return <span className={`brand-logo${footer ? ' brand-logo--footer' : ''}`}>
    <Image className="brand-logo__dark" src="/brand/oddly-dark.webp" alt="Oddly" width={600} height={420} priority={!footer} />
    <Image className="brand-logo__light" src="/brand/oddly-light.webp" alt="Oddly" width={600} height={420} priority={!footer} />
  </span>;
}
function ContactAction({ secondary = false, locale, href: whatsappHref }: { secondary?: boolean; locale: Locale; href?: string }) {
  const t = getTranslator(locale);
  return <a className={`button${secondary ? ' button--outline' : ''}`} href={whatsappHref || '#contacto'} target={whatsappHref ? '_blank' : undefined} rel={whatsappHref ? 'noopener noreferrer' : undefined}><span>{t('Hablemos de tu empresa')}</span><ArrowUpRight size={20} aria-hidden="true" /></a>;
}
const faqs = [
  { question: '¿Trabajan con empresas de cualquier sector?', answer: 'Sí. Evaluamos cada empresa en su propio contexto. El sector, los clientes, la situación actual y los objetivos influyen en la estrategia que recomendamos.' },
  { question: '¿Qué pasa si todavía no sé qué necesita mi empresa?', answer: 'Ese es un buen punto de partida. La evaluación nos ayuda a entender tu situación, identificar oportunidades y orientar las decisiones de marketing.' },
  { question: '¿Oddly también ejecuta las campañas?', answer: 'Nuestro servicio se centra en la asesoría: evaluamos tu empresa y recomendamos una estrategia de marketing. La ejecución de campañas no forma parte de este servicio.' },
  { question: '¿Todas las empresas reciben la misma estrategia?', answer: 'No. Una estrategia útil depende de tu negocio. Las recomendaciones se adaptan a tus objetivos, tus clientes y las oportunidades que encontramos al evaluar tu empresa.' },
  { question: '¿Pueden garantizar un aumento de ventas?', answer: 'El objetivo es ayudarte a tomar mejores decisiones de marketing para mejorar tus ventas. Los resultados también dependen de la implementación, el mercado y otros factores del negocio; no prometemos resultados garantizados.' },
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
          <div className="approach__statement" data-tilt><div className="approach-map" aria-hidden="true"><svg viewBox="0 0 320 190"><ellipse cx="160" cy="95" rx="118" ry="64" /><ellipse cx="160" cy="95" rx="74" ry="40" /><path d="M42 95H278M160 31V159" /></svg><span className="approach-map__center"><Target size={34} weight="light" />{t('Tu empresa')}</span><span className="approach-map__label approach-map__label--top">{t('Objetivos')}</span><span className="approach-map__label approach-map__label--left">{t('Negocio')}</span><span className="approach-map__label approach-map__label--right">{t('Clientes')}</span><span className="approach-map__label approach-map__label--bottom">{t('Canales')}</span></div><span className="approach__line" aria-hidden="true" /><p>{t('Una buena estrategia')}<br />{t('empieza por entender')}<br /><strong>{t('tu empresa.')}</strong></p></div>
          <div className="assessment-list">
            <div><h3>{t('Tu negocio y tus objetivos')}</h3><p>{t('Dónde estás hoy y hacia dónde quieres llevar tus ventas.')}</p></div>
            <div><h3>{t('Tus clientes y tu mercado')}</h3><p>{t('A quién necesitas llegar y qué influye en su decisión de compra.')}</p></div>
            <div><h3>{t('Tu propuesta y tus canales')}</h3><p>{t('Cómo comunicas tu valor y cómo conectas con tus clientes.')}</p></div>
            <div><h3>{t('Tus oportunidades de mejora')}</h3><p>{t('Qué puede ayudarte a enfocar mejor tus esfuerzos de marketing.')}</p></div>
          </div>
        </div>
      </section>
      <section className="process section-space" id="proceso" aria-labelledby="process-title"><div className="section-shell">
        <div className="section-heading"><h2 id="process-title">{t('Del diagnóstico')}<br />{t('a una dirección clara.')}</h2><p>{t('Un proceso para transformar preguntas sobre tu negocio en decisiones de marketing con fundamento.')}</p></div>
        <ProcessExplorer locale={locale} />
      </div></section>
      <section className="advisory section-shell section-space" id="proyectos" aria-labelledby="advisory-title">
        <div id="asesoria" className="anchor-alias" />
        <div className="advisory__intro"><h2 id="advisory-title">{t('Más claridad.')}<br />{t('Mejores decisiones.')}</h2><p>{t('Asesoría de marketing para saber dónde enfocar tu esfuerzo y qué estrategia tiene sentido para tu empresa.')}</p><ContactAction secondary locale={locale} href={whatsappHref} /></div>
        <div className="advisory__outcomes"><h3>{t('Lo que aporta nuestra asesoría')}</h3>
          <div><Check size={22} aria-hidden="true" /><p><strong>{t('Una lectura de tu situación.')}</strong><span>{t('Entender el punto de partida de tu negocio y sus necesidades de marketing.')}</span></p></div>
          <div><Check size={22} aria-hidden="true" /><p><strong>{t('Prioridades con sentido.')}</strong><span>{t('Identificar las oportunidades que merecen tu atención.')}</span></p></div>
          <div><Check size={22} aria-hidden="true" /><p><strong>{t('Recomendaciones a tu medida.')}</strong><span>{t('Orientación sobre qué hacer y por qué, según los objetivos de tu empresa.')}</span></p></div>
        </div>
      </section>
      <div id="estudio" className="section-shell" aria-hidden="true" />
      <section className="faq section-shell section-space" id="faq" aria-labelledby="faq-title"><div className="faq__heading"><h2 id="faq-title">{t('Hablemos')}<br />{t('con claridad.')}</h2><p>{t('Algunas preguntas antes de empezar.')}</p></div><div className="faq__items">{faqs.map(item => <details key={t(item.question)}><summary>{t(item.question)}<span className="faq__toggle" aria-hidden="true"><Plus className="faq__plus" size={16} /><Minus className="faq__minus" size={16} /></span></summary><p>{t(item.answer)}</p></details>)}</div></section>
      <section className="contact section-shell" id="contacto" aria-labelledby="contact-title"><div className="contact__inner"><div><h2 id="contact-title">{t('El siguiente paso empieza')}<br />{t('por conocer tu empresa.')}</h2><p>{t('Cuéntanos qué quieres mejorar. Empecemos una conversación sobre tu negocio y tus objetivos de ventas.')}</p></div><div className="contact__action">{whatsappHref ? <><ContactAction locale={locale} href={whatsappHref} /><span className="contact__channel"><WhatsappLogo size={18} aria-hidden="true" />{t('Conversemos por WhatsApp')}</span></> : <><button className="button" disabled>{t('WhatsApp no disponible')}<WhatsappLogo size={20} aria-hidden="true" /></button><p className="contact__notice">{t('Nuestro canal de contacto estará disponible próximamente.')}</p></>}</div></div></section>
    </main>
    <footer className="footer section-shell"><a href="#top" aria-label={t('Oddly, volver al inicio')}><BrandLogo footer /></a><p>{t('Una estrategia pensada para tu negocio.')}</p><a className="text-link" href="#top">{t('Volver arriba')}<ArrowUpRight size={18} aria-hidden="true" /></a><small>© {new Date().getFullYear()} Oddly</small></footer>
  </>;
}
