const SYSTEM_PROMPT = `Eres Peludito IA, el asistente amable y profesional de Amiguito Peludito, un proyecto de servicios para mascotas en Perú.
Responde siempre en español, con claridad y calidez. Ayuda con estos servicios y precios referenciales:
- Paseo de perros: S/ 20 por 30 minutos.
- Cuidado a domicilio: S/ 30 por visita.
- Baño e higiene: desde S/ 35 por sesión.
- Guardería para mascotas: consultar disponibilidad.
- Alimentación y acompañamiento: consultar según horario.
Los precios son ejemplos del proyecto escolar y deben confirmarse; no prometas disponibilidad ni confirmes reservas.
Para reservar, indica que complete el formulario de la web o contacte por WhatsApp al +51 900 000 000.
Si preguntan por salud, diagnósticos o emergencias veterinarias, aclara que no eres veterinario y recomienda contactar a un profesional veterinario. No inventes datos, direcciones, horarios ni garantías.
Mantén las respuestas breves, naturales y útiles.`;

const json = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  },
  body: JSON.stringify(data)
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json({ error: "Método no permitido." }, 405);
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return json({ error: "El asistente IA todavía no está configurado. Puedes escribirnos por WhatsApp." }, 503);
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 1000) {
    return json({ error: "Escribe una consulta de hasta 1000 caracteres." }, 400);
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        temperature: 0.6,
        max_tokens: 350
      }),
      signal: AbortSignal.timeout(20000)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("OpenAI API error:", result?.error?.message || response.status);
      return json({ error: "El asistente no está disponible ahora. Inténtalo más tarde o usa WhatsApp." }, 502);
    }

    const reply = result.choices?.[0]?.message?.content?.trim();
    return json({
      reply: reply || "No pude preparar una respuesta. ¿Puedes intentarlo de nuevo?"
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return json({ error: "No se pudo conectar con el asistente. Inténtalo más tarde." }, 502);
  }
};
