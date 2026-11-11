/* AEMT · comportamiento de la web (sin dependencias ni llamadas a terceros).
   Sirve para las dos versiones: español (/) e inglés (/en/). */
(function () {
  'use strict';
  var raiz = document.documentElement;
  raiz.classList.remove('sin-js');
  var ingles = (raiz.getAttribute('lang') || '').indexOf('en') === 0;
  var txt = ingles
    ? { abrir: 'Open the menu', cerrar: 'Close the menu' }
    : { abrir: 'Abrir el menú', cerrar: 'Cerrar el menú' };
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var punteroFino = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var cabecera = document.getElementById('cabecera');
  var siempreSolida = cabecera && cabecera.hasAttribute('data-solida');
  var subir = document.getElementById('subir');
  var fotoPortada = document.querySelector('.portada__foto');
  var textoPortada = document.querySelector('.portada__in');

  // Al desplazar: cabecera sólida, barra de lectura, botón de subir y paralaje de la portada
  var pendiente = false;
  function alDesplazar() {
    pendiente = false;
    var y = window.scrollY || window.pageYOffset;
    var alto = window.innerHeight;
    if (cabecera) cabecera.classList.toggle('solida', siempreSolida || y > 40);
    var total = document.documentElement.scrollHeight - alto;
    raiz.style.setProperty('--progreso', total > 0 ? Math.min(1, y / total).toFixed(4) : '0');
    if (subir) subir.classList.toggle('visible', y > alto * 1.2);
    if (!reducir && fotoPortada && textoPortada && y < alto * 1.3) {
      fotoPortada.style.transform = 'translate3d(0,' + (y * 0.32).toFixed(1) + 'px,0)';
      textoPortada.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
      textoPortada.style.opacity = String(Math.max(0, 1 - y / (alto * 0.9)).toFixed(3));
    }
  }
  function pedirFotograma() { if (!pendiente) { pendiente = true; window.requestAnimationFrame(alDesplazar); } }
  alDesplazar();
  window.addEventListener('scroll', pedirFotograma, { passive: true });
  window.addEventListener('resize', pedirFotograma, { passive: true });

  // Menú en el móvil
  var boton = document.getElementById('hamburguesa');
  var menu = document.getElementById('menu');
  function cerrarMenu() {
    if (!menu || !boton) return;
    menu.classList.remove('abierto');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-label', txt.abrir);
  }
  if (boton && menu) {
    boton.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? txt.cerrar : txt.abrir);
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

  // El cambio de idioma lleva a la misma sección en la otra versión
  var EQUIVALENCIAS = { inicio: 'home', asociacion: 'association', vision: 'vision', actividad: 'activities', categorias: 'categories', abonate: 'join', contacto: 'contact' };
  var otroIdioma = document.querySelector('[data-otro-idioma]');
  var baseOtro = otroIdioma ? otroIdioma.getAttribute('href').split('#')[0] : '';
  function equivalente(id) {
    if (ingles) { for (var k in EQUIVALENCIAS) { if (EQUIVALENCIAS[k] === id) return k; } return ''; }
    return EQUIVALENCIAS[id] || '';
  }
  function apuntarOtroIdioma(id) {
    if (!otroIdioma) return;
    var destino = id ? equivalente(id) : '';
    otroIdioma.setAttribute('href', baseOtro + (destino && destino !== 'inicio' && destino !== 'home' ? '#' + destino : ''));
  }

  // Sección activa en el menú
  var enlaces = menu ? menu.querySelectorAll('a[href^="#"]:not(.boton)') : [];
  var secciones = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window && secciones.length) {
    var porId = {};
    enlaces.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var obsSec = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        apuntarOtroIdioma(e.target.id);
        var a = porId[e.target.id];
        enlaces.forEach(function (x) { x.removeAttribute('aria-current'); });
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach(function (s) { obsSec.observe(s); });
  }

  // Foco de luz que sigue al ratón en las tarjetas
  if (punteroFino && !reducir) {
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('.tarjeta, .cuota, .categoria, .lista-vision li');
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
    }, { passive: true });

    // La muestra del diploma se inclina hacia el ratón
    document.querySelectorAll('[data-inclinar]').forEach(function (el) {
      var zona = el.parentElement || el;
      zona.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        var y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        el.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      zona.addEventListener('pointerleave', function () {
        ['--rx', '--ry', '--mx', '--my'].forEach(function (p) { el.style.removeProperty(p); });
      });
    });
  }

  // Cifras que cuentan hasta su valor al aparecer (por ejemplo, +30)
  var contadores = document.querySelectorAll('[data-contar]');
  if (!reducir && 'IntersectionObserver' in window && contadores.length) {
    var obsCifra = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        obsCifra.unobserve(e.target);
        var el = e.target;
        var final = parseInt(el.getAttribute('data-contar'), 10) || 0;
        var prefijo = el.getAttribute('data-prefijo') || '';
        var inicio = null;
        var duracion = 1400;
        function paso(t) {
          if (inicio === null) inicio = t;
          var p = Math.min(1, (t - inicio) / duracion);
          var suave = 1 - Math.pow(1 - p, 3);
          el.textContent = prefijo + Math.round(final * suave);
          if (p < 1) window.requestAnimationFrame(paso);
        }
        el.textContent = prefijo + '0';
        window.requestAnimationFrame(paso);
      });
    }, { threshold: 0.6 });
    contadores.forEach(function (c) { obsCifra.observe(c); });
  }

  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());
})();
