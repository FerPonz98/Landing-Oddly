# Oddly

Landing de **Oddly**, consultora de marketing: explica cómo Oddly evalúa cada empresa y recomienda la estrategia de marketing que mejor responde a sus objetivos de ventas, y lleva a una primera conversación por WhatsApp. Está disponible en español, inglés y portugués, con tema claro y oscuro.

Sitio: **https://oddly.com.bo**

## Stack

- **Next.js 15** (App Router), renderizado en servidor; la ruta `/` es dinámica porque el idioma se resuelve en el middleware.
- **React 19** y **TypeScript** (modo estricto).
- **Phosphor Icons** (`@phosphor-icons/react`).
- Tipografías **Barlow** (texto) y **Merienda** (palabras de énfasis), cargadas con `next/font/google`: Next.js las descarga durante el build y las sirve desde el propio sitio.
- CSS propio en `src/app/globals.css` con variables para ambos temas; sin frameworks de CSS ni librerías de animación (las animaciones usan canvas, SVG y Web Animations API).

## Desarrollo local

Requisitos: **Node.js 20** (ver `.nvmrc`) y npm.

```bash
npm install
cp .env.example .env.local   # en Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Abrir http://localhost:3000. En desarrollo puede usarse `NEXT_PUBLIC_SITE_URL=http://localhost:3000` en `.env.local`. Después de cambiar una variable, reiniciar `npm run dev`.

## Variables de entorno

| Variable | Obligatoria | Valor en producción | Si no se define | Uso |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | `59167443300` | `59167443300` | Número de WhatsApp (código de país + número, solo dígitos). Si no tiene entre 8 y 15 dígitos, los botones llevan a `#contacto`, que avisa que el canal no está disponible, y el botón flotante no aparece. |
| `NEXT_PUBLIC_SITE_URL` | Sí, en producción | `https://oddly.com.bo` | `http://localhost:3000` | URL pública sin barra final: Open Graph y Twitter, canonical y hreflang, JSON-LD, `robots.txt` y `sitemap.xml`. |
| `PORT` | No | — | `3000` | Puerto de `npm start`. |
| `NIXPACKS_NODE_VERSION` | Solo en Easypanel | `20` | — | Fija la versión de Node del build con Nixpacks. |

Las variables `NEXT_PUBLIC_*` se incrustan en el build: si cambian, hay que volver a compilar y desplegar.

## Estructura de carpetas

```
src/
  app/
    layout.tsx          HTML base: idioma, fuentes, scripts de tema e intro, JSON-LD, canonical y hreflang
    page.tsx            Página única y metadatos traducidos (title, description, Open Graph, Twitter)
    globals.css         Estilos y variables de tema
    robots.ts           /robots.txt
    sitemap.ts          /sitemap.xml (las tres versiones de idioma)
    icon.png, apple-icon.png, opengraph-image.png   Favicon, icono Apple e imagen al compartir
  components/
    OddlyLanding.tsx    Estructura de la página y sus secciones
    LandingHeader.tsx   Cabecera, menú móvil y cambio de tema
    LanguageSelect.tsx  Selector de idioma
    StrategyVisual.tsx  Visual del hero y la intro de carga
    SpiralVisual.tsx    Espiral del Ciclo Oddly
    ProcessExplorer.tsx Proceso fijo en pantalla con sus cuatro etapas
    BackgroundTrails.tsx Estelas del fondo
    LandingMotion.tsx   Entradas al hacer scroll, barra de progreso, inclinación y marca de agua
    FloatingWhatsApp.tsx Botón flotante de WhatsApp
    SocialLinks.tsx     Íconos de redes sociales
  lib/
    i18n.ts             Idiomas y traducciones tipadas
    contact.ts          WhatsApp (número, mensaje, enlace) y redes sociales
    site.ts             URL pública y URL de cada idioma
    isotype.ts          Trazo del isotipo de Oddly
  middleware.ts         Resuelve el idioma (?lang= y cookie)
public/
  brand/                Derivados optimizados del logo y del símbolo (webp) y su origen (ORIGINS.md)
  logo/                 Arte original del logo entregado por Oddly
scripts/
  prepare-brand-assets.mjs  Regenera public/brand, el favicon y el icono Apple desde public/logo
  capture-review.mjs        Utilidad de desarrollo: guarda una captura recibida como JSON (base64) en un archivo
```

`PRODUCT.md` describe el servicio y `DESIGN.md` el sistema visual.

## Secciones y anclas

| Ancla | Sección |
| --- | --- |
| `#top` | Hero: «Marketing pensado para vender mejor», con el visual del isotipo. |
| `#problema` | Enfoque: «Antes de recomendar, hay que entender», con la espiral del Ciclo Oddly y los cuatro puntos que se evalúan. |
| `#proceso` | Proceso: «Del diagnóstico a una dirección clara», cuatro etapas. |
| `#proyectos` (alias `#asesoria`) | Asesoría: «Más claridad. Mejores decisiones.» |
| `#ciclo` | El Ciclo Oddly: Diagnóstico, Marca, Estrategia, Ejecución y Medición. |
| `#faq` | Preguntas frecuentes. |
| `#contacto` | Contacto por WhatsApp. |
| `#estudio` | Ancla vacía que se conserva para enlaces antiguos. |
| `#contenido` | Inicio del contenido principal (destino de «Saltar al contenido»). |

La cabecera enlaza a Enfoque, Proceso, Asesoría y Preguntas.

## Idiomas

- Español (predeterminado), inglés y portugués.
- URLs compartibles: `/?lang=es`, `/?lang=en`, `/?lang=pt`. Al entrar con `?lang=`, la preferencia se guarda en la cookie `oddly-language` durante un año; un `?lang=` explícito siempre tiene prioridad.
- El selector de la cabecera muestra los nombres en su idioma original y se maneja con flechas, Home/End, búsqueda por inicial, Enter/Espacio y Escape. Sin JavaScript siguen funcionando sus enlaces.
- Se traducen el contenido, el atributo `lang`, las etiquetas accesibles, los metadatos (title, description, Open Graph, Twitter) y el mensaje de WhatsApp. Cada idioma tiene su `canonical` y los `hreflang` de las tres versiones.
- Todas las traducciones están en `src/lib/i18n.ts`, en filas `['es', 'en', 'pt']`. El texto en español es la clave tipada: usar un texto que no esté en la lista es un error de TypeScript.

## Contacto, WhatsApp y redes sociales

- **WhatsApp**: número predeterminado en `src/lib/contact.ts` (`oddlyWhatsAppNumber`), reemplazable con `NEXT_PUBLIC_WHATSAPP_NUMBER`. El mensaje preparado (`whatsappMessage`) se traduce según el idioma. Usan este enlace el botón «Hablemos» de la cabecera, los botones «Contáctanos» (hero, asesoría, contacto y menú móvil) y el botón flotante. La landing no envía mensajes por sí sola: solo abre WhatsApp.
- **Botón flotante** (`src/components/FloatingWhatsApp.tsx`): aparece después de que el «Contáctanos» del hero sale por arriba de la pantalla y se oculta mientras `#contacto` o el footer están visibles; en móvil también mientras la tarjeta fija del proceso ocupa la pantalla. No aparece durante la intro, entra con un fundido y una leve subida (sin animación con movimiento reducido), respeta el área segura inferior y queda por debajo de la cabecera, el menú y el selector de idioma.
- **Redes sociales**: se cambian en un solo lugar, el arreglo `socialLinks` de `src/lib/contact.ts` (LinkedIn, Instagram y TikTok). De ahí salen los íconos del footer y del panel del menú móvil, y el `sameAs` del JSON-LD `Organization`. Para agregar una red, sumar su ícono en `src/components/SocialLinks.tsx` y su etiqueta «Oddly en …» en `src/lib/i18n.ts`.

## Diseño y animaciones

- Tema claro al entrar por primera vez; el botón de la cabecera cambia a oscuro y la elección se guarda en el navegador.
- **Intro de carga**: en una visita normal, el isotipo se dibuja a trazo en el centro y vuela hasta el hero. Se omite al entrar con un ancla, con movimiento reducido o después de cambiar de idioma; si no llega a arrancar, la página se muestra a los 6 s.
- **Hero**: el isotipo se conecta con «Tu negocio», «Tus clientes», «Tu mercado» y «Tus canales», y con la estrategia resultante; por cada línea viajan puntos y al llegar se abre un anillo. Se desplaza levemente con el scroll. Se detiene fuera de pantalla, con la pestaña oculta o con movimiento reducido.
- **Espiral del Ciclo Oddly** (`#problema`): tres ciclos con las etapas Datos, Estrategia y Crecimiento. Un punto naranja la recorre del Ciclo 1 (arriba) al Ciclo 3 (abajo) con una etiqueta de etapa y ciclo («Datos · ciclo 1»). Se detiene fuera de pantalla o con la pestaña oculta; con movimiento reducido el punto queda quieto al final del Ciclo 3.
- **Proceso** (`#proceso`): la sección queda fija mientras se hace scroll y avanza por sus cuatro etapas; en cada una, círculos salen de su tarjeta y forman una parte del isotipo, que se completa en la última. Las etapas se pueden elegir con clic, toque o teclado.
- **Scroll**: los bloques entran y salen con una animación al cruzar la pantalla; una barra de progreso recorre la parte superior; el fondo cambia poco a poco hacia melocotón (claro) o ciruela (oscuro) y, cerca del final, aparece una marca de agua del logo.
- **Fondo**: estelas curvas que ganan presencia con el scroll (hasta 72 en escritorio y 20 en móvil); se detienen con la pestaña oculta y quedan estáticas con movimiento reducido.
- Inclinación al pasar el mouse sobre la tarjeta de la espiral y barrido de color en los botones.
- Con `prefers-reduced-motion`, se desactivan la intro, las entradas, los desplazamientos y la inclinación; los canvas muestran un estado quieto.

## Seguridad

`next.config.mjs` desactiva `X-Powered-By` (`poweredByHeader: false`) y envía en todas las rutas:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
- `Content-Security-Policy`: `default-src 'self'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`. `'unsafe-inline'` cubre los scripts en línea de `src/app/layout.tsx` (tema, intro y JSON-LD); en `next dev` se agrega `'unsafe-eval'` para la recarga en caliente.

> **Importante:** si se agrega un script o servicio externo (Google Analytics, Google Tag Manager, Meta Pixel, un chat, un video embebido, fuentes externas, Cloudflare Web Analytics…), hay que permitir su dominio en la directiva correspondiente de la CSP (`script-src`, `connect-src`, `img-src`, `frame-src`…) en `next.config.mjs`. Si no, el navegador lo bloqueará.

## Despliegue

Producción corre en un VPS de Hostinger con **Easypanel** (build Nixpacks, Node 20, puerto 3000, `npm start` escucha en `0.0.0.0`). El dominio `oddly.com.bo` está registrado en NIC Bolivia y su DNS se administra en **Cloudflare** (registros A de `@` y `www` en *DNS only*). Cada push a `main` se publica con Auto Deploy.

Guía completa (DNS, Easypanel, HTTPS, proxy de Cloudflare, correo y checklist): **[DEPLOY.md](DEPLOY.md)**. `amplify.yml` es opcional y solo serviría para AWS Amplify.

## Comprobaciones

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm start                      # http://localhost:3000
curl -I http://localhost:3000  # cabeceras de seguridad, sin X-Powered-By
```

## Equipo y créditos

Landing de **Oddly**.

<!-- Completar con los nombres del equipo -->
- Dirección y estrategia: _[completar]_
- Diseño: _[completar]_
- Desarrollo: _[completar]_
- Contenido: _[completar]_
