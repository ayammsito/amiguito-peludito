const json = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  },
  body: JSON.stringify(data)
});

const required = ["name", "phone", "petName", "petType", "service", "date", "time"];
const allowedPetTypes = ["Perro", "Gato", "Otro"];
const allowedServices = [
  "Paseo de perros",
  "Cuidado a domicilio",
  "Alimentación y acompañamiento",
  "Baño e higiene",
  "Guardería para mascotas"
];
const allowedTimes = [
  "Mañana (8 a. m. – 12 p. m.)",
  "Tarde (12 p. m. – 5 p. m.)",
  "Noche (5 p. m. – 8 p. m.)"
];

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json({ error: "Método no permitido." }, 405);
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }

  for (const field of required) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      return json({ error: "Completa todos los campos obligatorios." }, 400);
    }
  }

  const name = data.name.trim();
  const phone = data.phone.trim();
  const petName = data.petName.trim();
  const notes = typeof data.notes === "string" ? data.notes.trim() : "";

  if (name.length < 2 || name.length > 90 || phone.length > 25 ||
      petName.length > 70 || notes.length > 1000) {
    return json({ error: "Revisa la longitud de los campos e inténtalo nuevamente." }, 400);
  }
  if (!/^[0-9+() -]{7,20}$/.test(phone)) {
    return json({ error: "Ingresa un número de WhatsApp válido." }, 400);
  }
  if (!allowedPetTypes.includes(data.petType) ||
      !allowedServices.includes(data.service) ||
      !allowedTimes.includes(data.time)) {
    return json({ error: "Selecciona opciones válidas para tu solicitud." }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    return json({ error: "Selecciona una fecha válida." }, 400);
  }

  const selectedDate = new Date(`${data.date}T12:00:00-05:00`);
  const todayInPeru = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  if (Number.isNaN(selectedDate.getTime()) || selectedDate.toISOString().slice(0, 10) !== data.date || data.date < todayInPeru) {
    return json({ error: "Selecciona una fecha válida." }, 400);
  }

  // Netlify Forms es el mecanismo principal de recepción y almacenamiento.
  // Este endpoint JSON alternativo valida los datos y responde para integraciones.
  return json({
    ok: true,
    message: "Solicitud validada. El formulario principal del sitio se registra mediante Netlify Forms."
  }, 200);
};
