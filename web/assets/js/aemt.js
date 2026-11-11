/* AEMT · comportamiento de la web (sin dependencias ni llamadas a terceros) */
(function () {
  'use strict';
  var raiz = document.documentElement;
  raiz.classList.remove('sin-js');

  // Cabecera sólida al bajar
  var cabecera = document.getElementById('cabecera');
  var siempreSolida = cabecera && cabecera.hasAttribute('data-solida');
  function alDesplazar() {
    if (!cabecera) return;
    cabecera.classList.toggle('solida', siempreSolida || window.scrollY > 40);
  }
  alDesplazar();
  window.addEventListener('scroll', alDesplazar, { passive: true });

  // Menú en el móvil
  var boton = document.getElementById('hamburguesa');
  var menu = document.getElementById('menu');
  function cerrarMenu() {
    if (!menu || !boton) return;
    menu.classList.remove('abierto');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-label', 'Abrir el menú');
  }
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
      if (abierto && cabecera) cabecera.classList.add('solida');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) cerrarMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  }

  // Aparición suave al llegar a cada bloque
  var revelar = document.querySelectorAll('.revelar');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revelar.forEach(function (el) { obs.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add('visible'); });
  }

  // Sección activa en el menú
  var enlaces = menu ? menu.querySelectorAll('a[href^="#"]:not(.boton)') : [];
  if ('IntersectionObserver' in window && enlaces.length) {
    var porId = {};
    enlaces.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var obsSec = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var a = porId[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          enlaces.forEach(function (x) { x.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(porId).forEach(function (id) { var s = document.getElementById(id); if (s) obsSec.observe(s); });
  }

  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());
})();
