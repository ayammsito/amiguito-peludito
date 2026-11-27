# AMIGUITO PELUDITO 🐾

Plataforma web responsive para un proyecto escolar de servicios para perros y gatos. Esta versión está preparada exclusivamente para publicarse en **Netlify** e incluye catálogo de servicios, precios referenciales, formulario de solicitudes con Netlify Forms y chatbot conectado a OpenAI mediante Netlify Functions.

## Contenido del proyecto

- `public/`: sitio web estático (HTML, CSS, JavaScript e icono).
- `netlify/functions/chat.js`: función del chatbot (`POST /.netlify/functions/chat`, también disponible en `/api/chat`).
- `netlify/functions/reservations.js`: endpoint JSON alternativo para validar solicitudes (`POST /api/reservations`).
- `netlify.toml`: configuración de publicación, funciones, redirecciones y encabezados.
- `.env.example`: plantilla de variables para desarrollo local.

## Requisitos

- Cuenta gratuita de Netlify.
- Node.js 20 o superior y npm para probar desde la terminal.
- Una clave de API de OpenAI para activar el chatbot. Su uso puede generar costos según el consumo y la facturación de tu cuenta.

## Publicar en Netlify (sin instalar nada)

1. Descomprime el ZIP.
2. Entra a [Netlify](https://app.netlify.com/) e inicia sesión.
3. Selecciona **Add new site** → **Deploy manually**.
4. Arrastra la carpeta `amiguito_peludito` completa al área de despliegue de Netlify.

   **Importante:** para que Netlify compile y detecte las funciones y el formulario, es preferible conectar el proyecto a un repositorio Git o desplegarlo mediante Netlify CLI. El método manual de arrastrar una carpeta estática puede no procesar las funciones ni el formulario de la misma manera.

## Publicación recomendada con GitHub

1. Crea un repositorio en GitHub y sube el contenido de la carpeta `amiguito_peludito` (no la carpeta contenedora exterior).
2. En Netlify, elige **Add new site** → **Import an existing project** y conecta GitHub.
3. Selecciona el repositorio.
4. Configura:
   - **Base directory:** vacío (raíz del repositorio).
   - **Build command:** `npm run build`.
   - **Publish directory:** `public`.
   - **Functions directory:** `netlify/functions` (también está definido en `netlify.toml`).
5. Pulsa **Deploy**.

Netlify detectará `netlify.toml`, publicará el contenido de `public/` y compilará las funciones de `netlify/functions/`.

## Activar el chatbot con OpenAI

1. En Netlify, abre el sitio.
2. Ve a **Site configuration** → **Environment variables**.
3. Añade `OPENAI_API_KEY` con tu clave privada de OpenAI.
4. Opcionalmente añade `OPENAI_MODEL` con el valor `gpt-4o-mini`.
5. Guarda los cambios y vuelve a desplegar el sitio.

La clave se lee únicamente en el servidor desde `process.env.OPENAI_API_KEY`, dentro de `netlify/functions/chat.js`. **No pegues la clave en `public/app.js`, `index.html` ni en ningún archivo público.** Si no configuras la clave, el chatbot mostrará un mensaje de que aún no está configurado, sin exponer secretos.

### Probar el chatbot localmente

1. Instala Node.js 20 o superior.
2. Abre una terminal en la carpeta del proyecto.
3. Ejecuta:

   ```bash
   npm install
   cp .env.example .env
   ```

4. Edita `.env` y coloca tu clave real.
5. Ejecuta:

   ```bash
   npm run dev
   ```

6. Abre la dirección local que indique Netlify CLI.

No compartas ni subas el archivo `.env`. Netlify CLI utiliza las variables locales para las funciones durante el desarrollo.

## Formulario de reservaciones con Netlify Forms

El formulario principal tiene `data-netlify="true"`, un nombre de formulario estable (`booking`) y un campo honeypot anti-spam. Al desplegar el sitio, Netlify detectará el formulario y registrará las solicitudes en **Forms** dentro del panel del sitio.

Para comprobarlo:

1. Publica el sitio mediante Git o Netlify CLI.
2. Abre la web pública y envía una solicitud de prueba.
3. En el panel de Netlify, entra a **Forms** y revisa el formulario `booking`.

El formulario es una **solicitud**, no una reserva confirmada automáticamente. El responsable debe revisar la solicitud y contactar a la persona para confirmar disponibilidad y detalles.

El endpoint `POST /api/reservations` se conserva como función JSON alternativa para futuras integraciones; el formulario visible utiliza Netlify Forms para que las solicitudes queden registradas en el panel.

## Rutas disponibles

| Ruta | Método | Uso |
|---|---|---|
| `/api/chat` | POST | Chatbot Peludito IA (redirige a Netlify Function) |
| `/.netlify/functions/chat` | POST | Endpoint directo del chatbot |
| `/api/reservations` | POST | Validación JSON alternativa de solicitudes |

## Personalizar antes de entregar

En `public/index.html` busca el número de WhatsApp de ejemplo `51900000000` y reemplázalo por el número real en formato internacional, sin `+`, espacios ni guiones. Actualiza también el texto visible `+51 900 000 000`.

Los precios, testimonios y perfiles son **referenciales/ilustrativos** para la presentación escolar. Modifícalos si el proyecto tiene datos reales. Las fotografías remotas se cargan desde Unsplash y las fuentes desde Google Fonts; requieren conexión a Internet.

## Seguridad y consideraciones

- La clave de OpenAI permanece en variables de entorno del servidor.
- La función del chatbot valida el método HTTP y limita el mensaje a 1000 caracteres.
- El formulario incluye validaciones del navegador y un campo honeypot de Netlify.
- Configura límites de uso y facturación en OpenAI para evitar consumos inesperados.
- No introduzcas datos sensibles ni información médica privada en el chat.
- Para uso comercial real, añade un aviso de privacidad y controles adecuados para los datos personales recibidos.
- Netlify Forms puede requerir que la detección de formularios esté habilitada en la configuración del sitio.

