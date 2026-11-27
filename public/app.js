const $ = (selector) => document.querySelector(selector);

const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menuToggle.textContent = open ? "×" : "☰";
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      menuToggle.textContent = "☰";
    });
  });
}

const dateInput = $("#bookingDate");
if (dateInput) {
  const today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const serviceSelect = $("#serviceSelect");
    const service = link.dataset.service;
    if (serviceSelect && service) serviceSelect.value = service;
  });
});

// Netlify Forms detecta este formulario durante el despliegue.
// La clave de OpenAI nunca se incluye en este JavaScript del navegador.
const bookingForm = $("#bookingForm");
const formStatus = $("#formStatus");

if (bookingForm && formStatus) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;

    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalMarkup = submitButton?.innerHTML || "Enviar solicitud";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando solicitud...";
    }

    formStatus.className = "form-status";
    formStatus.textContent = "Estamos enviando tu solicitud...";

    try {
      const formData = new FormData(bookingForm);
      // Netlify espera el nombre del formulario junto con los campos URL-encoded.
      formData.set("form-name", bookingForm.getAttribute("name") || "booking");

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar la solicitud. Inténtalo nuevamente.");
      }

      formStatus.className = "form-status success";
      formStatus.textContent =
        "¡Solicitud enviada correctamente! Nos pondremos en contacto contigo para confirmar los detalles.";
      bookingForm.reset();
      if (dateInput) {
        const today = new Date();
        dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
      }
    } catch (error) {
      formStatus.className = "form-status error";
      formStatus.textContent =
        error.message || "No se pudo conectar. Intenta nuevamente o escríbenos por WhatsApp.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalMarkup;
      }
    }
  });
}

const chatPanel = $("#chatPanel");
const chatLauncher = $("#chatLauncher");
const chatClose = $("#chatClose");
const messages = $("#chatMessages");

function toggleChat(open) {
  if (!chatPanel || !chatLauncher) return;
  chatPanel.hidden = !open;
  chatLauncher.setAttribute("aria-expanded", String(open));
  if (open) $("#chatInput")?.focus();
}

chatLauncher?.addEventListener("click", () => toggleChat(chatPanel.hidden));
chatClose?.addEventListener("click", () => toggleChat(false));

function addMessage(message, who) {
  if (!messages) return null;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${who}`;
  bubble.textContent = message;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

async function sendChat(text) {
  const question = text.trim();
  if (!question || !messages) return;

  document.querySelector(".quick-questions")?.remove();
  addMessage(question, "user");
  const loading = addMessage("Estoy pensando...", "bot");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "No pude responder en este momento.");
    }
    if (loading) loading.textContent = data.reply || "No pude preparar una respuesta.";
  } catch (error) {
    if (loading) {
      loading.textContent =
        `${error.message} Puedes escribirnos por WhatsApp para recibir ayuda.`;
    }
    const whatsapp = document.createElement("a");
    whatsapp.href =
      "https://wa.me/51900000000?text=" +
      encodeURIComponent("Hola, necesito ayuda con Amiguito Peludito.");
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener noreferrer";
    whatsapp.className = "chat-bubble bot";
    whatsapp.textContent = "Abrir WhatsApp ↗";
    messages.appendChild(whatsapp);
  }

  messages.scrollTop = messages.scrollHeight;
}

$("#chatForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#chatInput");
  if (!input) return;
  const value = input.value;
  input.value = "";
  sendChat(value);
});

document.querySelectorAll(".quick-questions button").forEach((button) => {
  button.addEventListener("click", () => sendChat(button.dataset.question || ""));
});


// Animaciones progresivas al entrar en pantalla (sin bloquear contenido).
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(
    ".trust-strip > div, .section-heading, .service-card, .extra-service, .care-photo, .care-copy, .center-heading, .price-card, .booking-intro, .booking-form, .review-card, .faq-list details, .final-cta > *"
  );
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  targets.forEach((el, index) => {
    el.classList.add("js-reveal");
    if (el.matches(".service-card, .price-card, .review-card, .trust-strip > div")) {
      el.style.transitionDelay = `${(index % 4) * 90}ms`;
    }
  });
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  targets.forEach((el) => observer.observe(el));
})();
