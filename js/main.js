// CONFIG viene de config.js (se carga antes que este archivo)
window.landingLista = true;

const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/';

const SERVICIOS = {
  landing: 'Landing page',
  web: 'Página web informativa',
  software: 'Sistema o aplicación',
  otro: 'Asesoría para elegir',
};

const PLAZOS = {
  'lo antes posible': 'Lo antes posible',
  'este mes': 'Para este mes',
  'sin apuro': 'Sin apuro',
};

const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tienePunteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initScrollEffects();
  initReveal();
  initHeroParallax();
  initFilters();
  initProjectModal();
  initBuilder();
  initContactForm();
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

// ===== Header con fondo y barra de progreso =====
function initScrollEffects() {
  const header = document.querySelector('.header');
  const progress = document.querySelector('.scroll-progress');
  let pendiente = false;

  const actualizar = () => {
    const scrollY = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', scrollY > 20);
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    pendiente = false;
  };

  window.addEventListener('scroll', () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  }, { passive: true });
  actualizar();
}

// ===== Aparición al hacer scroll (una sola vez) =====
function initReveal() {
  const elementos = document.querySelectorAll('.reveal');

  // Escalonado entre hermanos: 70ms entre cada uno, máximo 5 pasos
  elementos.forEach((el) => {
    const hermanos = [...el.parentElement.children].filter((h) => h.classList.contains('reveal'));
    const i = hermanos.indexOf(el);
    if (i > 0) el.style.setProperty('--delay', `${Math.min(i, 5) * 70}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  elementos.forEach((el) => observer.observe(el));
}

// ===== Dispositivos del hero siguen al mouse (solo escritorio) =====
function initHeroParallax() {
  if (!tienePunteroFino || prefiereMenosMovimiento) return;

  const hero = document.querySelector('.hero');
  const capas = hero.querySelectorAll('[data-depth]');

  hero.addEventListener('pointermove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    capas.forEach((capa) => {
      const d = Number(capa.dataset.depth);
      capa.style.transform = `translate(${x * -d}px, ${y * -d}px)`;
    });
  });

  hero.addEventListener('pointerleave', () => {
    capas.forEach((capa) => { capa.style.transform = ''; });
  });
}

// ===== Filtro de proyectos =====
function initFilters() {
  const botones = document.querySelectorAll('.filter');
  const proyectos = document.querySelectorAll('.project');

  botones.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filtro = btn.dataset.filter;

      botones.forEach((b) => {
        const activo = b === btn;
        b.classList.toggle('is-active', activo);
        b.setAttribute('aria-pressed', String(activo));
      });

      let visibles = 0;
      proyectos.forEach((p) => {
        const mostrar = filtro === 'todos' || p.dataset.category === filtro;
        p.hidden = !mostrar;
        if (mostrar && !prefiereMenosMovimiento) {
          p.animate(
            [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
            { duration: 350, delay: visibles * 50, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' },
          );
        }
        if (mostrar) visibles++;
      });
    });
  });
}

// ===== Detalle de proyecto =====
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const img = modal.querySelector('.modal__img');
  const tipo = modal.querySelector('[data-modal-type]');
  const titulo = modal.querySelector('.modal__title');
  const contenido = modal.querySelector('[data-modal-content]');

  document.querySelectorAll('.project').forEach((proyecto) => {
    proyecto.addEventListener('click', () => {
      const imagen = proyecto.querySelector('img');
      img.src = imagen.src;
      img.alt = imagen.alt;
      tipo.textContent = proyecto.querySelector('.project__type').textContent;
      titulo.textContent = proyecto.querySelector('.project__name').textContent;
      contenido.replaceChildren(proyecto.querySelector('template').content.cloneNode(true));
      modal.showModal();
      modal.scrollTop = 0;
    });
  });

  modal.querySelector('.modal__close').addEventListener('click', () => modal.close());
  // Clic fuera del contenido (en el fondo) cierra
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

// ===== Cotizador =====
function initBuilder() {
  const builder = document.querySelector('.builder');
  const titulo = document.querySelector('[data-summary-title]');
  const lista = document.querySelector('[data-summary-list]');
  const tiempo = document.querySelector('[data-summary-time]');

  const leer = () => ({
    tipo: builder.querySelector('input[name="tipo"]:checked').value,
    extras: [...builder.querySelectorAll('input[name="extras"]:checked')].map((i) => i.value),
    plazo: builder.querySelector('input[name="plazo"]:checked').value,
  });

  const actualizar = () => {
    const { tipo, extras, plazo } = leer();
    titulo.textContent = SERVICIOS[tipo];
    const items = extras.length ? extras : ['Sin extras por ahora'];
    lista.replaceChildren(...items.map((texto) => {
      const li = document.createElement('li');
      li.textContent = texto;
      return li;
    }));
    tiempo.textContent = PLAZOS[plazo];
  };

  builder.addEventListener('change', actualizar);
  actualizar();

  // Los botones de cada servicio preseleccionan el tipo en el cotizador
  document.querySelectorAll('[data-tipo]').forEach((link) => {
    link.addEventListener('click', () => {
      builder.querySelector(`input[name="tipo"][value="${link.dataset.tipo}"]`).checked = true;
      actualizar();
    });
  });

  // Pasa lo elegido al formulario de contacto
  document.querySelector('[data-builder-send]').addEventListener('click', () => {
    const { tipo, extras, plazo } = leer();
    const form = document.getElementById('contact-form');
    form.elements.servicio.value = tipo;
    clearError(form.elements.servicio);
    form.elements.mensaje.value = [
      `Quiero cotizar: ${SERVICIOS[tipo]}.`,
      extras.length ? `Debe tener: ${extras.join(', ')}.` : '',
      `Plazo: ${plazo}.`,
    ].filter(Boolean).join('\n');

    document.getElementById('contacto').scrollIntoView({ behavior: prefiereMenosMovimiento ? 'auto' : 'smooth' });
    form.elements.nombre.focus({ preventScroll: true });
  });
}

// ===== Formulario de contacto =====
const VALIDACIONES = {
  nombre: (v) => v.length >= 2 || 'Escribe tu nombre.',
  telefono: (v) => {
    const digitos = v.replace(/\D/g, '').length;
    return (/^\+?[\d\s-]+$/.test(v) && digitos >= 10 && digitos <= 13) || 'Escribe un número válido, ej. 0424 123 4567.';
  },
  email: (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Escribe un correo válido.',
  servicio: (v) => v !== '' || 'Elige una opción.',
};

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = form.querySelector('.form__status');
  const submitBtn = form.querySelector('[type="submit"]');
  const textoBoton = submitBtn.textContent;

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

    // Si un bot llenó el campo trampa, fingimos éxito y no enviamos nada
    if (form.elements._honey.value) {
      form.reset();
      setStatus(status, '¡Gracias! Te escribiré pronto.', 'success');
      return;
    }

    if (CONFIG.correoFormulario.includes('TU_CORREO')) {
      console.warn('Configura correoFormulario en js/config.js');
      setStatus(status, 'El formulario aún no está configurado. Escríbeme por WhatsApp.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      await enviarFormulario(form);
      form.reset();
      setStatus(status, '¡Listo! Te escribiré en menos de 24 horas.', 'success');
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setStatus(status, 'No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = textoBoton;
    }
  });
}

async function enviarFormulario(form) {
  const v = (name) => form.elements[name].value.trim();
  const servicio = SERVICIOS[v('servicio')];
  const datos = {
    Nombre: v('nombre'),
    Negocio: v('negocio') || 'No indicado',
    WhatsApp: v('telefono'),
    email: v('email'),
    Servicio: servicio,
    Mensaje: v('mensaje'),
    _subject: `Nueva cotización: ${servicio} - ${v('nombre')}`,
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
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensajeWhatsapp)}`;
  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => { link.href = url; });
}
