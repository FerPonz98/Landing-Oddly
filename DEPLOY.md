# Checklist de despliegue en AWS Amplify

Guía paso a paso para publicar la landing de Oddly por primera vez. No hace falta experiencia previa con Amplify.

## 1. Antes de empezar: alerta de presupuesto

- [ ] Entrar a la consola de AWS → **Billing and Cost Management → Budgets**.
- [ ] **Create budget** → plantilla *Monthly cost budget* (o *Zero spend budget*).
- [ ] Monto: **5 USD**. Poner tu email para recibir avisos.
- [ ] Guardar. Así te enteras si algo empieza a cobrar durante la prueba gratuita.

## 2. Crear la app en Amplify

- [ ] Abrir **AWS Amplify** → **Create new app**.
- [ ] Elegir **GitHub** y autorizar el acceso a AWS Amplify.
- [ ] Seleccionar el repositorio `FerPonz98/Landing-Oddly` y la rama **`main`**.
- [ ] En *App settings / Build settings*, confirmar que aparece el `amplify.yml` del repositorio (Node 20, `npm ci`, `npm run build`). No editarlo ahí.

## 3. Variables de entorno (antes del primer build)

En **Advanced settings → Environment variables** (o luego en *Hosting → Environment variables*):

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `59167443300` |
| `NEXT_PUBLIC_SITE_URL` | URL pública con `https` y **sin barra final**, ej. `https://oddly.com.bo` |

- [ ] Si aún no tienes dominio propio, usa temporalmente la URL que da Amplify (`https://main.xxxxxx.amplifyapp.com`) y cámbiala cuando conectes el dominio.
- [ ] Recuerda: estas variables se incrustan en el build. **Si cambias alguna, haz Redeploy.**

## 4. Desplegar

- [ ] **Save and deploy**. Esperar a que las fases *Provision → Build → Deploy* queden en verde.
- [ ] A partir de ahora, cada push a `main` despliega automáticamente.

## 5. Dominio propio

- [ ] *Hosting → Custom domains → Add domain*.
- [ ] Seguir las instrucciones de DNS (registros CNAME). El certificado SSL es gratis y automático.
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` al dominio final y hacer **Redeploy this version**.

## 6. Verificar después del deploy

- [ ] Abrir la URL y comprobar que carga en español.
- [ ] Abrir `/?lang=en` → la página debe verse en inglés.
- [ ] Abrir `/?lang=pt` → la página debe verse en portugués.
- [ ] Pulsar el botón de **WhatsApp**: debe abrir el chat con +591 67443300 y el mensaje preparado.
- [ ] Pegar la URL en <https://www.opengraph.xyz> y confirmar que la imagen de vista previa carga y que su URL usa el dominio real, **no `localhost`**. Si sale `localhost`, revisar `NEXT_PUBLIC_SITE_URL` y redeployar.
