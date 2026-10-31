# Oddly

Landing de la consultora de marketing Oddly: evaluación del negocio y recomendaciones personalizadas para mejorar ventas. Incluye tema claro inicial, selector de tema oscuro, preguntas frecuentes y contacto por WhatsApp.

## Desarrollo

Node.js 20 o superior y npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir http://localhost:3000.

## Contacto

El contacto predeterminado es **+591 67443300**. Para cambiarlo, configurar `NEXT_PUBLIC_WHATSAPP_NUMBER` con el código de país y número completo, sin espacios ni `+`. Los botones abrirán WhatsApp con un mensaje preparado. La landing no envía mensajes automáticamente.

Si se configura un número que no tiene entre 8 y 15 dígitos, los botones llevan a la sección de contacto, donde se indica que el canal aún no está disponible. No se simula ningún envío. Reiniciar desarrollo o recompilar producción después de cambiar el número.

Al desplegar, configurar también `NEXT_PUBLIC_SITE_URL` con la URL pública para que las imágenes de Open Graph y Twitter apunten al dominio correcto. En desarrollo se usa `http://localhost:3000`.

## Comprobaciones y producción

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

## Despliegue en AWS Amplify

La landing se despliega con SSR en AWS Amplify Hosting (la ruta `/` es dinámica porque el middleware lee el idioma desde la cookie y los headers). La configuración de build está en `amplify.yml` (Node 20, `npm ci`, `npm run build`).

1. En la consola de AWS Amplify, crear una app nueva y conectar el repositorio de GitHub `FerPonz98/Landing-Oddly`.
2. Elegir la rama `main`.
3. En la configuración de build, confirmar que Amplify detecta y usa el `amplify.yml` del repositorio.
4. **Antes del primer build**, configurar las variables de entorno en *Hosting → Environment variables*:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = `59167443300`
   - `NEXT_PUBLIC_SITE_URL` = URL pública con `https` y sin barra final (ej. `https://oddly.com.bo`)

   Se incrustan en el build: si cambian, hay que volver a desplegar.
5. Guardar y desplegar. Desde entonces, cada push a `main` dispara un deploy automático.
6. Conectar el dominio propio en *Hosting → Custom domains*. Amplify emite y renueva el certificado SSL gratis. Después, actualizar `NEXT_PUBLIC_SITE_URL` con ese dominio y redeployar.

Checklist detallado en [DEPLOY.md](DEPLOY.md).

## Diseño y assets

- Next.js App Router y React; contenido renderizado en servidor, interacción de menú, tema y canvas en componentes de cliente.
- Variables CSS para ambos temas. La preferencia se conserva localmente; una visita sin preferencia comienza en claro.
- Tipografías Barlow (texto) y Merienda (acentos) cargadas con `next/font/google` en `src/app/layout.tsx`; Next.js las descarga en el build y las sirve desde el propio sitio.
- Iconos de Phosphor. Logos suministrados en `public/logo`; sus derivados optimizados están en `public/brand`.
- Favicon, icono Apple y preview al compartir generados del arte de marca original. Para regenerar derivados, ejecutar `node scripts/prepare-brand-assets.mjs`.
- El visual del hero conecta el isotipo de Oddly con tu negocio, tus clientes, tu mercado y tus canales, y con la estrategia resultante; por cada línea viajan puntos de forma continua y al llegar se abre un anillo. Se desplaza levemente con el scroll y no tiene control de pausa. Se detiene fuera del viewport, con la pestaña oculta o con movimiento reducido (los puntos quedan quietos a lo largo de cada línea). En una visita normal, una pantalla de carga dibuja el isotipo a trazo y lo lleva hasta el hero; se omite al entrar con un ancla, con movimiento reducido o tras cambiar de idioma. Los bloques entran y salen con una animación cada vez que cruzan el viewport, en ambas direcciones; el contenido sigue visible si falla JavaScript (si la pantalla de carga no llega a arrancar, la página se muestra a los 6 s).
- El proceso permite seleccionar cuatro etapas mediante clic, toque o teclado. La sección sigue el mismo fondo progresivo del resto de la página. El fondo evoluciona gradualmente hacia melocotón en claro y ciruela en oscuro; el logo blanco completo aparece sutilmente como marca de agua de fondo de la landing al acercarse al final.
- Las superficies con inclinación y los botones con barrido de color responden al hover; el movimiento espacial se desactiva cuando se solicita movimiento reducido.
- Estelas curvas decoran el fondo: al final alcanzan 72 trayectorias en escritorio y 20 en móvil, con rutas curvas precalculadas. No tienen control de pausa; se detienen al ocultar la pestaña y muestran curvas estáticas con movimiento reducido.
- PRODUCT.md registra el servicio confirmado; DESIGN.md documenta el sistema visual.

La ruta principal y las anclas `#top`, `#problema`, `#proceso`, `#proyectos`, `#estudio`, `#faq` y `#contacto` se conservan. `#proyectos` ahora corresponde a asesoría; `#asesoria` es un destino alternativo.

## Idiomas

Español, inglés y portugués mediante un menú de idiomas en la cabecera. Muestra los nombres originales, marca el idioma activo y funciona con flechas, Home/End, búsqueda por inicial, Enter/Espacio y Escape. En móvil usa un botón compacto y un panel amplio. Sin JavaScript conserva los enlaces de idioma. URLs compartibles: `/?lang=es`, `/?lang=en`, `/?lang=pt`. La preferencia se conserva en la cookie `oddly-language` durante un año; una URL con idioma explícito tiene prioridad. Sin preferencia se usa español. Contenido renderizado en servidor, atributo `lang`, etiquetas accesibles, metadatos y mensajes de WhatsApp traducidos. Las traducciones tipadas están en `src/lib/i18n.ts`.
