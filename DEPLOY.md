# Despliegue de Oddly: Hostinger VPS + Easypanel + Cloudflare + NIC.bo

Guía para publicar y mantener la landing en **https://oddly.com.bo**. Donde dice **IP del VPS**, usa la IP pública de tu VPS de Hostinger (no la escribas en el repositorio).

## 1. Arquitectura

```
Visitante
   │  https://oddly.com.bo
   ▼
Cloudflare DNS  (registros A en "DNS only": Cloudflare solo resuelve el nombre, no hace de proxy)
   │  IP del VPS
   ▼
VPS Hostinger → Easypanel (proxy Traefik con certificado HTTPS de Let's Encrypt)
   │  puerto interno 3000
   ▼
Contenedor de la app (build Nixpacks, Node 20): npm run build → npm start (next start -H 0.0.0.0)

GitHub FerPonz98/Landing-Oddly, rama main ──(Auto Deploy)──▶ Easypanel vuelve a construir y desplegar
```

- **NIC Bolivia** es el registrador de `oddly.com.bo`: ahí solo se configuran los nameservers.
- **Cloudflare** administra la zona DNS (registros A, MX, TXT, etc.).
- **Easypanel** construye la imagen con Nixpacks, ejecuta el contenedor, emite el certificado HTTPS y redirige HTTP → HTTPS.
- La ruta `/` es dinámica (el middleware lee el idioma de `?lang=` y de la cookie), así que la app corre como servidor Node; no es un sitio estático.

## 2. Dominio en NIC.bo → nameservers de Cloudflare

1. En Cloudflare: **Add a domain** → `oddly.com.bo` → plan Free. Cloudflare asigna dos nameservers.
2. En el panel de NIC Bolivia, en la gestión de `oddly.com.bo`, reemplazar los nameservers por:
   - `anna.ns.cloudflare.com`
   - `mitch.ns.cloudflare.com`
3. Esperar la propagación (de minutos a 24–48 h). Cloudflare marca la zona como **Active** y envía un correo.
4. Comprobar desde una terminal:

   ```bash
   nslookup -type=NS oddly.com.bo
   ```

   Deben aparecer los dos nameservers de Cloudflare.

## 3. Registros DNS en Cloudflare

En **DNS → Records**:

| Tipo | Nombre | Contenido | Proxy | TTL |
| --- | --- | --- | --- | --- |
| A | `@` | IP del VPS | **DNS only** (nube gris) | Auto |
| A | `www` | IP del VPS | **DNS only** (nube gris) | Auto |

- Con **DNS only**, Easypanel puede emitir y renovar el certificado de Let's Encrypt sin intermediarios.
- Comprobar: `nslookup oddly.com.bo` y `nslookup www.oddly.com.bo` deben devolver la IP del VPS.

## 4. Easypanel

### 4.1 Crear el servicio

1. Entrar a Easypanel (en el VPS) → **Create project** (por ejemplo `oddly`).
2. Dentro del proyecto → **+ Service → App**, nombre por ejemplo `landing`.
3. **Source → GitHub**: repositorio `FerPonz98/Landing-Oddly`, rama **`main`**, ruta `/`.
4. **Build**: método **Nixpacks**. Nixpacks detecta Node, ejecuta `npm ci` y `npm run build`, y arranca con `npm start` (que corre `next start -H 0.0.0.0`). No hace falta Dockerfile ni comando personalizado.

### 4.2 Variables de entorno

En **Environment** del servicio:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=59167443300
NEXT_PUBLIC_SITE_URL=https://oddly.com.bo
NIXPACKS_NODE_VERSION=20
```

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp (código de país + número, solo dígitos). |
| `NEXT_PUBLIC_SITE_URL` | URL pública con `https` y sin barra final: Open Graph, canonical/hreflang, JSON-LD, `robots.txt` y `sitemap.xml`. |
| `NIXPACKS_NODE_VERSION` | Fija Node 20 en el build. Sin ella, Nixpacks podría elegir otra versión que cumpla `"node": ">=20"`. |

- Las variables `NEXT_PUBLIC_*` **se incrustan en el build**. Si cambias una, hay que volver a hacer **Deploy** (reiniciar el contenedor no basta).
- No definas `PORT` salvo que quieras otro puerto: `next start` usa `PORT` y, si no existe, el 3000. Si la defines, el puerto del dominio (4.3) debe coincidir.

### 4.3 Dominios y HTTPS

En **Domains** del servicio, agregar:

| Host | HTTPS | Puerto interno | Ruta |
| --- | --- | --- | --- |
| `oddly.com.bo` | Activado | `3000` | `/` |
| `www.oddly.com.bo` | Activado | `3000` | `/` |

- Easypanel pide el certificado a Let's Encrypt cuando el DNS ya apunta al VPS. Si falla, revisar que los registros A estén en **DNS only** y que los puertos 80 y 443 del VPS estén abiertos.
- Dominio principal: `oddly.com.bo`. Si tu versión de Easypanel permite redirigir un dominio, redirige `www.oddly.com.bo` → `https://oddly.com.bo`. Si no, ambos sirven la página y el `canonical` de cada idioma ya apunta a `https://oddly.com.bo/?lang=…`.

### 4.4 Primer deploy y Auto Deploy

1. **Deploy** y seguir los logs: debe terminar el build y aparecer `Ready` de Next.js.
2. Activar **Auto Deploy** en el servicio (Easypanel crea el webhook en GitHub). Desde entonces, cada push a `main` construye y publica.
3. Trabajar en ramas y abrir PR hacia `main`: lo que se mergea a `main` sale a producción.

## 5. Más adelante: activar el proxy de Cloudflare

Opcional, para tener CDN, caché y protección de Cloudflare:

1. **SSL/TLS → Overview**: modo **Full (strict)** *antes* de activar el proxy. El VPS ya tiene un certificado válido de Let's Encrypt, así que Full (strict) funciona y nunca uses "Flexible" (provoca bucles de redirección y tráfico sin cifrar hasta el VPS).
2. **DNS → Records**: cambiar `@` y `www` a **Proxied** (nube naranja).
3. **SSL/TLS → Edge Certificates**: activar *Always Use HTTPS*.
4. Si la renovación de Let's Encrypt fallara con el proxy activo, usar un **Origin Certificate** de Cloudflare en Easypanel o volver temporalmente a DNS only para renovar.
5. **CSP**: la página solo permite recursos de su propio dominio. Funciones de Cloudflare que inyectan scripts de otro dominio (por ejemplo *Web Analytics* con `static.cloudflareinsights.com`) se bloquearán hasta agregarlas a la CSP en `next.config.mjs`. *Rocket Loader* conviene dejarlo desactivado.

## 6. Correo (pendiente)

Cuando se contrate el correo (Google Workspace, Zoho, Hostinger Mail, etc.), agregar en **Cloudflare → DNS** los registros que indique el proveedor. Los registros de correo siempre van en **DNS only**.

| Tipo | Nombre | Contenido (ejemplo) | Notas |
| --- | --- | --- | --- |
| MX | `@` | servidores del proveedor, con su prioridad | Sin esto no llega el correo. |
| TXT | `@` | `v=spf1 include:<dominio-spf-del-proveedor> ~all` | **SPF**: un solo registro SPF por dominio. |
| TXT | `<selector>._domainkey` | clave pública que entrega el proveedor | **DKIM**: firma los correos enviados. |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:<correo-de-reportes>` | **DMARC**: empezar en `p=none`, luego `quarantine` o `reject`. |

Mientras no haya correo, se puede evitar que suplanten el dominio con `v=spf1 -all` (TXT en `@`) y `v=DMARC1; p=reject;` (TXT en `_dmarc`). Reemplazarlos al configurar el proveedor.

La app envía `Strict-Transport-Security` con `includeSubDomains`: cualquier subdominio que se publique (por ejemplo `mail.` o `webmail.`) debe funcionar con HTTPS. Solo inscribir el dominio en hstspreload.org cuando se esté seguro, porque salir de esa lista tarda meses.

## 7. Checklist después de publicar

- [ ] `https://oddly.com.bo` carga en español con candado válido; `http://` redirige a `https://`.
- [ ] `https://www.oddly.com.bo` carga o redirige al dominio principal.
- [ ] `/?lang=en` y `/?lang=pt` muestran la página en inglés y portugués; el selector de idioma funciona.
- [ ] Cambio de tema claro/oscuro, intro de carga, animaciones y botón flotante de WhatsApp funcionan; la consola del navegador no muestra errores de CSP.
- [ ] Los botones de WhatsApp abren el chat con +591 67443300 y el mensaje en el idioma de la página.
- [ ] Los íconos de LinkedIn, Instagram y TikTok (footer y menú móvil) abren los perfiles en otra pestaña.
- [ ] Cabeceras de seguridad presentes y sin `X-Powered-By`:

  ```bash
  curl -I https://oddly.com.bo
  ```

- [ ] `https://oddly.com.bo/robots.txt` y `https://oddly.com.bo/sitemap.xml` usan el dominio real (no `localhost`). Si muestran `localhost`, falta `NEXT_PUBLIC_SITE_URL` en el build: corregir y volver a desplegar.
- [ ] Vista previa al compartir correcta en <https://www.opengraph.xyz> (imagen y URL con el dominio real).
- [ ] Google Search Console: agregar la propiedad de dominio (verificación TXT en Cloudflare) y enviar `https://oddly.com.bo/sitemap.xml`.
- [ ] Revisar <https://securityheaders.com> y <https://pagespeed.web.dev>.

## 8. Qué NO subir al repositorio

- Archivos `.env`, `.env.local`, `.env.production` u otros `.env.*` (solo `.env.example`, sin secretos).
- La IP del VPS, usuarios o contraseñas de Hostinger, Easypanel, Cloudflare, NIC.bo o GitHub.
- Claves SSH, tokens de API o de webhooks, certificados privados.
- Copias de seguridad, volcados de base de datos o capturas con datos privados.
- Carpetas generadas: `node_modules/`, `.next/`.
- Herramientas locales de diseño con IA: `.agents/`, `.impeccable/`, `skills-lock.json` (ya están en `.gitignore`).

`amplify.yml` queda en el repositorio solo como referencia opcional para AWS Amplify; Easypanel no lo usa.
