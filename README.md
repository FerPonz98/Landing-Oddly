# Oddly Frontend

Landing de Oddly portada 1:1 desde la maqueta aprobada. Mismo diseño, mismos textos,
mismas animaciones: sistema de nodos en Canvas 2D, narrativa de scroll (caos → señales →
relaciones → patrón → sistema → adaptación → acción), sección de proceso sticky, cursor
personalizado en desktop y formulario de contacto con validación.

## Requisitos

- Node.js 20 o superior
- npm
- Git

## Clonar el repositorio

```bash
git clone https://github.com/FerPonz98/Landing-Oddly.git
cd Landing-Oddly
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

## Build

```bash
npm run build
```

## Producción local

```bash
npm run start
```

## Lint

```bash
npm run lint
```

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base del backend. Si está definida, el formulario hace `POST {API_URL}/api/contact`. |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Endpoint completo alternativo. Tiene prioridad sobre `NEXT_PUBLIC_API_URL`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número para el CTA de contacto (solo dígitos, sin `+`). Vacío: el CTA apunta a `#contacto`. |
| `NEXT_PUBLIC_PRIVACY_URL` | Ruta o URL de la política de privacidad usada por el checkbox. |

Sin ninguna de las dos primeras variables, el formulario valida y confirma en local sin
llamada de red. No hay secretos en el repositorio.

## Estructura

```
oddly-frontend/
├── public/
│   └── logo/                   # variantes del logo (por fondo/uso)
├── src/
│   ├── app/
│   │   ├── globals.css         # resets del diseño + reglas :hover portadas
│   │   ├── layout.tsx          # metadata y carga de tipografías
│   │   └── page.tsx            # renderiza <OddlyLanding />
│   └── components/
│       └── OddlyLanding.tsx    # la landing completa (markup + sistema de nodos)
├── .env.example
├── .eslintrc.json
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Notas técnicas

- `OddlyLanding.tsx` es un componente de cliente (`"use client"`). Su clase conserva el
  sistema imperativo original (canvas, scroll, refs), por eso declara un index signature.
- Las fuentes se cargan con `<link>` a Google Fonts en `layout.tsx` porque los estilos
  inline referencian las familias por nombre literal.
- Los estados `:hover` viven en `globals.css` como reglas `[data-h="..."]`, una por
  tratamiento, generadas desde la maqueta.
- Las áreas de proyectos y equipo son placeholders CSS a la espera de imágenes reales.
- No se incluye `package-lock.json`; se generará con el primer `npm install`.

## Qué se puede mejorar

- **Favicon:** actualmente muestra el placeholder por defecto de Next.js. Reemplazar
  `src/app/favicon.ico` por un ícono propio de Oddly (32x32 o 48x48 px).
- **Organizar `public/logo`:** los archivos tienen nombres inconsistentes (mayúsculas,
  espacios). Conviene renombrarlos a formato `logo-[variante].png` en minúsculas y
  guiones, y dejar claro cuál se usa según el fondo (claro/oscuro/color).
- **Tipografía:** revisar si conviene reemplazar la fuente actual por una con más
  personalidad, manteniendo buena legibilidad en párrafos largos y compatibilidad con
  IBM Plex Mono, que ya se usa para acentos.
- **Migrar fuentes a `next/font/google`:** mejora performance y evita salto de layout
  al cargar la página.
- **Reemplazar placeholders CSS** de proyectos y equipo por imágenes reales.
- **Meta tags de Open Graph / Twitter Card:** para que el link se vea bien al
  compartirse (título, descripción, imagen de preview).
- **Accesibilidad:** revisar contraste de color, tamaño mínimo de texto y navegación
  por teclado en el formulario.
- **Responsive:** confirmar que el sistema de nodos y el cursor personalizado (que solo
  aplica en desktop) tengan un buen comportamiento en mobile.
- **Estados de error y carga del formulario:** que el usuario reciba feedback claro
  tanto si el envío fue exitoso como si falló.
- **`.gitignore`:** confirmar que excluye `node_modules/`, `.next/` y `.env.local`.

## Ideas creativas

- **Modo oscuro/claro:** ya existen variantes de logo en distintos colores — se podría
  explorar un tema alternable que cambie el aspecto del sistema de nodos.
- **Micro-interacciones en el CTA de contacto:** una animación sutil de hover puede
  reforzar la sensación de "sistema vivo" que ya sugiere el canvas de nodos.
- **Variación de velocidad del scroll narrativo** según el tamaño de pantalla, para que
  la secuencia caos → señales → relaciones → patrón → sistema → adaptación → acción no
  se sienta larga en mobile.
- **Sonido/feedback háptico opcional** en interacciones clave, muy sutil, coherente con
  el concepto de "sistema" que conecta nodos.
- **Página 404 personalizada** que continúe la estética del sistema de nodos.
