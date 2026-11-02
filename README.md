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

Los enlaces a redes sociales (LinkedIn, Instagram y TikTok) se cambian en un solo lugar: el arreglo `socialLinks` de `src/lib/contact.ts`. Desde ahí se alimentan los íconos del footer (el único lugar de la página donde aparecen) y el campo `sameAs` del JSON-LD `Organization` en `src/app/layout.tsx`. Si se agrega una red nueva, asignarle su ícono en `socialIcons` (`src/components/OddlyLanding.tsx`) y su etiqueta accesible «Oddly en …» en `src/lib/i18n.ts`.

El botón flotante de WhatsApp (`src/components/FloatingWhatsApp.tsx`) usa el mismo enlace y mensaje traducido que los demás botones. No se muestra si el número no es válido. Aparece cuando el botón «Contáctanos» del hero sale por arriba de la pantalla y se oculta mientras la sección `#contacto` o el footer están visibles, porque ahí ya hay un CTA. En móvil también se oculta mientras la tarjeta fija del proceso ocupa la pantalla, para no tapar su texto. Tampoco aparece durante la intro de carga. Entra con un fundido y una leve subida (sin animación con movimiento reducido). Mide 56 px en móvil y 52 px en escritorio, respeta el área segura inferior y queda por debajo del header, el menú móvil y el selector de idioma.

Al desplegar, configurar también `NEXT_PUBLIC_SITE_URL` con la URL pública para que las imágenes de Open Graph y Twitter apunten al dominio correcto. En desarrollo se usa `http://localhost:3000`.

## Comprobaciones y producción

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

## Diseño y assets

- Next.js App Router y React; contenido renderizado en servidor, interacción de menú, tema y canvas en componentes de cliente.
- Variables CSS para ambos temas. La preferencia se conserva localmente; una visita sin preferencia comienza en claro.
- Manrope alojada localmente con `next/font/local`. Su licencia OFL está en `src/app/fonts/OFL.txt`.
- Iconos de Phosphor. Logos suministrados en `public/logo`; sus derivados optimizados están en `public/brand`.
- Favicon, icono Apple y preview al compartir generados del arte de marca original. Para regenerar derivados, ejecutar `node scripts/prepare-brand-assets.mjs`.
- La escena orbital 3D proyecta anillos y satélites alrededor de la evaluación; responde al cursor y al scroll, con control de pausa que conserva su posición. Se detiene fuera del viewport, con la pestaña oculta o con movimiento reducido. Las entradas al recorrer la página ocurren una sola vez; el contenido sigue visible si falla JavaScript.
- El proceso permite seleccionar cuatro etapas mediante clic, toque o teclado. La sección sigue el mismo fondo progresivo del resto de la página. El fondo evoluciona gradualmente hacia melocotón en claro y ciruela en oscuro; el logo blanco completo aparece sutilmente como marca de agua de fondo de la landing al acercarse al final.
- Las superficies con inclinación y los botones con barrido de color responden al hover; el movimiento espacial se desactiva cuando se solicita movimiento reducido.
- Estelas curvas decoran el fondo: al final alcanzan 72 trayectorias en escritorio y 40 en móvil, con rutas curvas precalculadas. No tienen control de pausa; se detienen al ocultar la pestaña y muestran curvas estáticas con movimiento reducido.
- PRODUCT.md registra el servicio confirmado; DESIGN.md documenta el sistema visual.

La ruta principal y las anclas `#top`, `#problema`, `#proceso`, `#proyectos`, `#estudio`, `#faq` y `#contacto` se conservan. `#proyectos` ahora corresponde a asesoría; `#asesoria` es un destino alternativo.

## Idiomas

Español, inglés y portugués mediante un menú de idiomas en la cabecera. Muestra los nombres originales, marca el idioma activo y funciona con flechas, Home/End, búsqueda por inicial, Enter/Espacio y Escape. En móvil usa un botón compacto y un panel amplio. Sin JavaScript conserva los enlaces de idioma. URLs compartibles: `/?lang=es`, `/?lang=en`, `/?lang=pt`. La preferencia se conserva en la cookie `oddly-language` durante un año; una URL con idioma explícito tiene prioridad. Sin preferencia se usa español. Contenido renderizado en servidor, atributo `lang`, etiquetas accesibles, metadatos y mensajes de WhatsApp traducidos. Las traducciones tipadas están en `src/lib/i18n.ts`.
