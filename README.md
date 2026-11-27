# AMIGUITO PELUDITO 🐾

Sitio web responsive para un proyecto escolar de servicios para perros y gatos. Incluye catálogo, precios referenciales, perfiles ilustrativos, formulario de reservaciones, preguntas frecuentes y chatbot conectado a una API real de OpenAI mediante Cloudflare Pages Functions.

## Contenido

- `public/`: sitio web estático (HTML, CSS, JavaScript y recursos).
- `functions/api/chat.js`: endpoint privado del chatbot (`POST /api/chat`).
- `functions/api/reservations.js`: validación y recepción de solicitudes (`POST /api/reservations`).
- `migrations/0001_create_reservations.sql`: estructura de la base de datos D1.
- `wrangler.toml`: configuración de Cloudflare Pages.

## Requisitos

- Cuenta de Cloudflare.
- Node.js LTS y npm (solo para probar/publicar desde terminal).
- Una clave de API de OpenAI para activar el chatbot. La API puede generar costos según su uso y facturación.

## Probar localmente

1. Instala Node.js desde https://nodejs.org/.
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta:

   ```bash
   npm install -D wrangler
   npx wrangler pages dev public
   ```

4. Abre la dirección local que indique Wrangler.

Para probar el chatbot localmente, crea un archivo `.dev.vars` (no lo subas a GitHub) con:

```env
OPENAI_API_KEY=tu_clave_secreta
OPENAI_MODEL=gpt-4o-mini
```

El archivo `.dev.vars.example` es solo una plantilla. No pegues tu clave en `public/app.js`, `index.html`, ni en ningún archivo que se descargue al navegador.

## Publicar en Cloudflare Pages (recomendado: conexión con Git)

1. Crea una cuenta en https://dash.cloudflare.com/.
2. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
3. En Cloudflare, entra a **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
4. Selecciona el repositorio.
5. Configura:
   - Framework preset: `None`
   - Build command: déjalo vacío
   - Build output directory: `public`
   - Root directory: `/` (raíz del repositorio)
6. Pulsa **Save and Deploy**. Cloudflare generará una dirección pública `*.pages.dev`.

### Activar el chatbot con IA

1. En Cloudflare abre tu proyecto Pages.
2. En **Settings** → **Variables and Secrets** (o **Environment variables**, según la interfaz).
3. Añade `OPENAI_API_KEY` como **Secret**, con tu clave privada de OpenAI.
4. Opcionalmente añade `OPENAI_MODEL` como variable de texto con valor `gpt-4o-mini`.
5. Guarda y vuelve a desplegar el proyecto.
6. Prueba el chat desde la página pública.

La clave se lee exclusivamente desde `env.OPENAI_API_KEY` en `functions/api/chat.js`; no se envía al navegador.

### Guardar reservaciones permanentemente con Cloudflare D1

Sin D1, el formulario valida y recibe la solicitud, pero **no la almacena de forma permanente**. Para guardarla:

1. En la terminal ejecuta `npx wrangler d1 create amiguito-peludito-db`.
2. Copia el `database_id` que devuelve Cloudflare.
3. Edita `wrangler.toml`: descomenta el bloque `[[d1_databases]]` y reemplaza `PEGA_AQUI_TU_DATABASE_ID`.
4. Crea la tabla en la base remota:

   ```bash
   npx wrangler d1 execute amiguito-peludito-db --remote --file=migrations/0001_create_reservations.sql
   ```

5. En Cloudflare Pages → Settings → Functions → D1 database bindings, agrega:
   - Variable name / Binding: `DB`
   - Database: `amiguito-peludito-db`
6. Guarda y vuelve a desplegar.

Las solicitudes se guardarán en la tabla `reservations`. Para consultarlas desde la terminal:

```bash
npx wrangler d1 execute amiguito-peludito-db --remote --command="SELECT id, name, pet_name, service, preferred_date, created_at FROM reservations ORDER BY created_at DESC"
```

Protege los datos de contacto: limita el acceso a la base y no publiques capturas con teléfonos o información de clientes.

## Personalizar antes de entregar

Busca y reemplaza en `public/index.html` el número de WhatsApp de ejemplo `51900000000` por el número real en formato internacional, sin `+`, espacios ni guiones. Actualiza también el texto visible `+51 900 000 000`.

Los precios, testimonios y perfiles son **referenciales/ilustrativos** para la presentación escolar. Modifícalos si tu proyecto tiene datos reales. Las fotografías remotas se cargan desde Unsplash y requieren conexión a Internet.

## Importante sobre las reservaciones

El formulario es una solicitud, no una reserva confirmada automáticamente. La función no envía correos ni mensajes SMS. Con D1 configurado, conserva los datos para que el responsable pueda revisarlos y contactar al solicitante. Sin D1, muestra una advertencia y recomienda confirmar por WhatsApp.

## Seguridad y límites

- No introduzcas datos sensibles de menores ni información médica privada en el chat.
- Nunca compartas la clave de OpenAI en el navegador ni en un repositorio público.
- Configura límites de uso y facturación en el proveedor de IA.
- Para uso comercial real, añade protección anti-spam/rate limiting, aviso de privacidad, consentimiento y controles de acceso a las reservas.
