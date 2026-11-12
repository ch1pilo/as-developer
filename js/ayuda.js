// Centro de ayuda de Forger Fire. CONFIG viene de ../js/config.js (se carga antes que este archivo).

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHeader();
  initLogin();
  initWhatsApp();
  initBuscador();
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

// ===== Enlaces a "Iniciar sesión" (solo si hay urlSistema en config.js) =====
function initLogin() {
  const base = CONFIG.urlSistema.replace(/\/+$/, '');
  if (!base) return;
  document.querySelectorAll('[data-login-link]').forEach((link) => {
    link.href = `${base}/login`;
    const item = link.closest('[data-login]');
    if (item) item.hidden = false;
  });
}

// ===== Enlaces de WhatsApp =====
function initWhatsApp() {
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensajeWhatsappAyuda)}`;
  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => { link.href = url; });
}

// ===== Buscador y filtro por rol (solo en la portada) =====
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function initBuscador() {
  const buscar = document.getElementById('buscar');
  if (!buscar) return;

  const botonesRol = document.querySelectorAll('.rol');
  const categorias = document.querySelectorAll('.categoria');
  const sinResultados = document.querySelector('.sin-resultados');
  let rol = 'todos';

  const filtrar = () => {
    const termino = normalizar(buscar.value.trim());
    let visiblesTotal = 0;

    categorias.forEach((categoria) => {
      const titulo = normalizar(categoria.querySelector('.categoria__titulo').textContent);
      let visibles = 0;

      categoria.querySelectorAll('.guias li').forEach((guia) => {
        const coincideRol = rol === 'todos' || guia.dataset.roles.split(' ').includes(rol);
        const coincideTexto = !termino || normalizar(guia.textContent).includes(termino) || titulo.includes(termino);
        const mostrar = coincideRol && coincideTexto;
        guia.hidden = !mostrar;
        if (mostrar) visibles++;
      });

      categoria.hidden = visibles === 0;
      visiblesTotal += visibles;
    });

    sinResultados.hidden = visiblesTotal > 0;
  };

  buscar.addEventListener('input', filtrar);

  botonesRol.forEach((boton) => {
    boton.addEventListener('click', () => {
      rol = boton.dataset.rol;
      botonesRol.forEach((b) => {
        const activo = b === boton;
        b.classList.toggle('is-activo', activo);
        b.setAttribute('aria-pressed', String(activo));
      });
      filtrar();
    });
  });
}
