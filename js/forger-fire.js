// Página Forger Fire. CONFIG viene de config.js (se carga antes que este archivo).

const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/';

const PLANES = {
  fire: 'Forger Fire ($30/mes, 20 días gratis)',
  'fire-bot': 'Fire + Bot ($50/mes)',
};

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHeader();
  initSolicitud();
  initWhatsApp();
  document.getElementById('year').textContent = new Date().getFullYear();
});

// ===== Menú móvil =====
function initMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('menu');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
  });
}

// ===== Header con fondo al bajar =====
function initHeader() {
  const header = document.querySelector('.header');
  const actualizar = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}

// "Pizzería Don José" -> "pizzeria-don-jose"
function aSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// ===== Formulario de solicitud =====
const VALIDACIONES = {
  restaurante: (v) => v.length >= 3 || 'Escribe el nombre del restaurante.',
  plan: (v) => v !== '' || 'Elige un plan.',
  dueno: (v) => v.length >= 3 || 'Escribe tu nombre.',
  telefono: (v) => {
    const digitos = v.replace(/\D/g, '').length;
    return (/^\+?[\d\s-]+$/.test(v) && digitos >= 10 && digitos <= 13) || 'Escribe un número válido, ej. 0424 123 4567.';
  },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Escribe un correo válido.',
  ciudad: (v) => v.length >= 2 || 'Escribe tu ciudad.',
};

function initSolicitud() {
  const form = document.getElementById('form-solicitud');
  const status = form.querySelector('.form__status');
  const submitBtn = form.querySelector('[type="submit"]');
  const textoBoton = submitBtn.textContent;
  const slugPreview = document.getElementById('slug-preview');

  // Vista previa de la URL mientras escribe el nombre
  form.elements.restaurante.addEventListener('input', (e) => {
    slugPreview.textContent = aSlug(e.target.value) || 'tu-restaurante';
  });

  // Los botones de cada plan dejan el plan elegido en el formulario
  document.querySelectorAll('.plan__cta').forEach((boton) => {
    boton.addEventListener('click', () => {
      form.elements.plan.value = boton.dataset.plan;
      clearError(form.elements.plan);
    });
  });

  Object.keys(VALIDACIONES).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearError(field));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus(status, '');

    const invalidos = Object.keys(VALIDACIONES)
      .map((name) => form.elements[name])
      .filter((field) => !validateField(field));
    if (invalidos.length) {
      invalidos[0].focus();
      return;
    }

    const slug = aSlug(form.elements.restaurante.value);
    const exito = `¡Solicitud enviada! En menos de 24 horas te llega por WhatsApp el acceso a fire.forgerdev.com/${slug}.`;

    // Si un bot llenó el campo trampa, fingimos éxito y no enviamos nada
    if (form.elements._honey.value) {
      form.reset();
      setStatus(status, exito, 'success');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      await enviarSolicitud(form, slug);
      form.reset();
      slugPreview.textContent = 'tu-restaurante';
      setStatus(status, exito, 'success');
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      setStatus(status, 'No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = textoBoton;
    }
  });
}

async function enviarSolicitud(form, slug) {
  const v = (name) => form.elements[name].value.trim();
  const plan = PLANES[v('plan')];
  const datos = {
    Restaurante: v('restaurante'),
    URL: `fire.forgerdev.com/${slug}`,
    Plan: plan,
    Dueño: v('dueno'),
    WhatsApp: v('telefono'),
    email: v('email'),
    Ciudad: v('ciudad'),
    _subject: `Solicitud Forger Fire: ${plan} - ${v('restaurante')}`,
    _template: 'table',
    _honey: '',
  };

  const res = await fetch(FORMSUBMIT_URL + CONFIG.correoFormulario, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(datos),
  });
  const json = await res.json();

  if (!res.ok || String(json.success) !== 'true') {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
}

function validateField(field) {
  const resultado = VALIDACIONES[field.name](field.value.trim());
  if (resultado === true) {
    clearError(field);
    return true;
  }
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', `${field.id}-error`);
  document.getElementById(`${field.id}-error`).textContent = resultado;
  return false;
}

function clearError(field) {
  field.removeAttribute('aria-invalid');
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = '';
}

function setStatus(el, mensaje, tipo) {
  el.textContent = mensaje;
  el.classList.toggle('is-success', tipo === 'success');
  el.classList.toggle('is-error', tipo === 'error');
}

// ===== Enlaces de WhatsApp =====
function initWhatsApp() {
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensajeWhatsappFire)}`;
  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => { link.href = url; });
}
