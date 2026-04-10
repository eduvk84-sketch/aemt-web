// ============================================================
// AEMT — js/main.js
// Public site logic: render, scroll, interactions
// ============================================================
'use strict';

// ── UTILS ──────────────────────────────────────────────────
function q(sel, ctx = document) { return ctx.querySelector(sel); }
function qq(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function toast(msg, duration = 4000) {
  const t = q('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function formatDate(iso) {
  const d = new Date(iso);
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  return {
    day:   String(d.getDate()).padStart(2,'0'),
    month: months[d.getMonth()],
    full:  d.toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' }),
  };
}

// ── COUNTER ANIMATION ─────────────────────────────────────
function animCounter(el, target, dur = 1800) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

// ── RIPPLE EFFECT ─────────────────────────────────────────
function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top  - size / 2;
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}
// Ripple listeners attached after DOM render (see init())

// ── CUSTOM CURSOR ─────────────────────────────────────────
const cur  = q('#cur');
const curR = q('#curR');
if (cur && curR) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    curR.style.left = rx + 'px';
    curR.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

// ── NAVIGATION ────────────────────────────────────────────
const nav = q('#nav');
const SECTIONS = ['hero','about','events','ranking','membership','news','contact'];

function updateNav() {
  const scrolled = window.scrollY > 55;
  nav.className = scrolled ? 'scrolled' : 'top';
  let current = 'hero';
  SECTIONS.forEach(id => {
    const el = q('#' + id);
    if (el && window.scrollY >= el.offsetTop - 80) current = id;
  });
  qq('.nav-c a').forEach(a => a.classList.toggle('act', a.dataset.sec === current));
}

window.addEventListener('scroll', updateNav, { passive: true });

function scrollTo(id) {
  const el = q('#' + id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.ss = scrollTo; // alias used in HTML

function togMob() {
  const mob = q('#mob');
  mob.style.display = mob.style.display === 'flex' ? 'none' : 'flex';
}
window.togMob = togMob;

// ── SCROLL REVEAL ─────────────────────────────────────────
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .07 });

function observeReveal() {
  qq('.rev, .rev-l, .rev-r').forEach(el => revObs.observe(el));
}

// ── PORTADA CONFIG ────────────────────────────────────────
const LS_PORTADA = 'aemt_portada';
const DEFAULT_PORTADA = {
  hero_titulo:    'ASOCIACIÓN ESPAÑOLA DE TAEKWONDO MASTERS',
  hero_subtitulo: 'La élite del Taekwondo por encima de los 35 años. Competición, hermandad y excelencia.',
  hero_badge:     'Fundada en Madrid · 2026',
  ticker:         ['AEMTKD Open Madrid · 15 Marzo','USA Master Cup · Junio','European Masters · Septiembre','Summer Camp · Agosto','Liga AEMTKD · 7 Jornadas','Gran Final · Diciembre','Únete · aemtkd.es'],
  about_titulo:   'Somos la nueva referencia del Taekwondo Master en España',
  about_texto:    'Nace para dar estructura, visibilidad y oportunidades a los practicantes de taekwondo mayores de 35 años. Un espacio donde la experiencia y la competición se fusionan.',
  stat1_num: 47,  stat1_lbl: 'Abonados',
  stat2_num: 7,   stat2_lbl: 'Eventos 2026',
  stat3_num: 5,   stat3_lbl: 'CC.AA.',
  stat4_num: 108, stat4_lbl: 'Países en IMGA',
  contacto_email: 'info@aemtkd.es',
  contacto_tel:   '+34 625 59 39 98',
  contacto_dir:   'Madrid, España',
  footer_texto:   '© 2026 Asociación Española de Taekwondo Masters (AEMT). Todos los derechos reservados.',
};

function loadPortada() {
  try {
    const raw = localStorage.getItem(LS_PORTADA);
    return raw ? { ...DEFAULT_PORTADA, ...JSON.parse(raw) } : { ...DEFAULT_PORTADA };
  } catch { return { ...DEFAULT_PORTADA }; }
}

async function applyPortada() {
  let p;
  try {
    const remote = await fetchConfig('portada');
    if (remote !== null) {
      p = { ...DEFAULT_PORTADA, ...remote };
      try { localStorage.setItem(LS_PORTADA, JSON.stringify(remote)); } catch {}
    } else {
      p = loadPortada();
    }
  } catch { p = loadPortada(); }

  // Hero badge
  const hTag = q('.h-tag');
  if (hTag) {
    // preserve the dot span, replace only the text node
    const dot = hTag.querySelector('.h-dot');
    hTag.textContent = p.hero_badge;
    if (dot) hTag.prepend(dot);
  }
  // Hero subtitle (h-sub paragraph)
  const hSub = q('.h-sub');
  if (hSub) hSub.innerHTML = p.hero_subtitulo;

  // About title + text
  const abTi = q('#about .s-ttl');
  if (abTi) abTi.textContent = p.about_titulo;
  const abTx = q('#about .ab-quote');
  if (abTx) abTx.textContent = p.about_texto;

  // Stats labels (nums are driven by animCounter from fetchAbonadosCount — only update label text)
  [2,3,4].forEach(i => {
    const numEl = q(`#stat${i}-num`);
    const lblEl = q(`#stat${i}-lbl`);
    if (numEl) numEl.textContent = p[`stat${i}_num`];
    if (lblEl) lblEl.textContent = p[`stat${i}_lbl`];
  });
  const lbl1 = q('#stat1-lbl');
  if (lbl1) lbl1.textContent = p.stat1_lbl;

  // Contact
  const ctEm  = q('#ct-email-lbl');  if (ctEm)  ctEm.textContent  = p.contacto_email;
  const ctTel = q('#ct-tel-lbl');    if (ctTel) ctTel.textContent  = p.contacto_tel;
  const ctDir = q('#ct-dir-lbl');    if (ctDir) ctDir.textContent  = p.contacto_dir;

  // Footer
  const ftTx = q('#footer-copy');    if (ftTx)  ftTx.textContent  = p.footer_texto;
}

// ── RENDER TICKER ─────────────────────────────────────────
function renderTicker() {
  const p = loadPortada();
  const items = p.ticker;
  const tick = q('#tick');
  if (!tick) return;
  tick.innerHTML = [...items, ...items].map(i => `<span class="tick-it">${i}</span>`).join('');
}

// ── RENDER GALLERY ────────────────────────────────────────
async function renderGallery() {
  const container = q('#galGr');
  if (!container) return;
  const btnIg = q('#btn-instagram');

  let items = [];
  try {
    const remote = await fetchConfig('galeria');
    if (Array.isArray(remote) && remote.length) items = remote;
  } catch {}

  if (!items.length) {
    // Default placeholders
    const defaults = [
      { caption:'Juegos Mundiales Master · Taiwán 2025', emoji:'🏆' },
      { caption:'Club Kyoto Vallecas · Madrid', emoji:'🥋' },
      { caption:'European Masters Championships', emoji:'🌍' },
      { caption:'Ceremonia de entrega de medallas', emoji:'🎖️' },
      { caption:'Equipo AEMTKD · Madrid 2026', emoji:'👥' },
    ];
    const grads = ['135deg,#1B3A6B,#2a5298','135deg,#0D1E38,#1B3A6B','135deg,#243f76,#1B3A6B','135deg,#13233F,#243f76','135deg,#1B3A6B,#0D1E38'];
    container.innerHTML = defaults.map((d,i) => `
      <div class="gi" style="background:linear-gradient(${grads[i]})">
        <div class="gi-in">${d.emoji}<div class="gi-ov"><span class="gi-cp">${d.caption}</span></div></div>
      </div>`).join('');
    return;
  }

  container.innerHTML = items.map(item => {
    if (item.imagen) {
      return `<div class="gi" style="background:#0D1E38">
        <div class="gi-in" style="background-image:url('${item.imagen}');background-size:cover;background-position:center;width:100%;height:100%;display:flex;align-items:flex-end">
          <div class="gi-ov" style="opacity:1"><span class="gi-cp">${item.caption||''}</span></div>
        </div>
      </div>`;
    }
    return `<div class="gi" style="background:linear-gradient(135deg,#1B3A6B,#2a5298)">
      <div class="gi-in">📸<div class="gi-ov"><span class="gi-cp">${item.caption||''}</span></div></div>
    </div>`;
  }).join('');
}

// ── RENDER REDES SOCIALES ─────────────────────────────────
async function renderRedes() {
  let redes = {};
  try {
    const remote = await fetchConfig('redes');
    if (remote && typeof remote === 'object') redes = remote;
  } catch {}

  const map = [
    { id:'ft-ig', key:'instagram', icon:'📸', title:'Instagram' },
    { id:'ft-fb', key:'facebook',  icon:'👥', title:'Facebook'  },
    { id:'ft-yt', key:'youtube',   icon:'▶️', title:'YouTube'   },
    { id:'ft-x',  key:'x',         icon:'𝕏', title:'X'          },
    { id:'ft-wa', key:'whatsapp',  icon:'💬', title:'WhatsApp'  },
  ];

  map.forEach(({ id, key, icon, title }) => {
    const el = q(`#${id}`);
    if (!el) return;
    const url = redes[key];
    if (url) {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
  });

  // Update "Ver Instagram" gallery link
  const btnIg = q('#btn-instagram');
  if (btnIg && redes.instagram) {
    btnIg.href = redes.instagram;
    btnIg.target = '_blank';
    btnIg.rel = 'noopener noreferrer';
    btnIg.onclick = null;
  }
}

// ── RENDER NATIONS ────────────────────────────────────────
function renderNations() {
  const sc = q('#natSc');
  if (!sc) return;
  const doubled = [...NATIONS, ...NATIONS];
  sc.innerHTML = doubled.map(n => `<div class="nat-it"><span class="nat-fl">${n.f}</span>${n.n}</div>`).join('');
}

// ── RENDER HERO CARDS ─────────────────────────────────────
function renderHeroCards(events) {
  const container = q('#hCards');
  if (!container) return;
  if (!events || !events.length) { container.innerHTML = ''; return; }
  const featured = events.slice(0, 3);
  const tmap = { campeonato:'bc', expedicion:'be', seminario:'bs', social:'bs' };
  const lmap = { campeonato:'Torneo', expedicion:'Expedición', seminario:'Seminario', social:'Social' };
  container.innerHTML = featured.map(e => {
    const d = formatDate(e.fecha);
    const pct = Math.round((e.plazas_ocupadas / e.plazas_total) * 100);
    const badge = tmap[e.tipo] || 'bc';
    const label = lmap[e.tipo] || e.tipo;
    return `<div class="hc">
      <div class="hc-top">
        <span>${e.tipo === 'campeonato' ? '🏆' : e.tipo === 'expedicion' ? '🌍' : '🥋'}</span>
        <span class="hc-badge ${badge}">${label}</span>
      </div>
      <div class="hc-title">${e.titulo}</div>
      <div class="hc-detail">${d.full} · ${e.plazas_total} plazas</div>
      <div class="hc-bar"><div class="hc-fill" data-w="${pct}%" style="width:0"></div></div>
    </div>`;
  }).join('');
  // Animate bars after brief delay
  setTimeout(() => {
    qq('.hc-fill').forEach(b => { b.style.width = b.dataset.w; });
  }, 400);
}

// ── RENDER EVENTS ─────────────────────────────────────────
function renderEvents(events) {
  const grid = q('#evGr');
  if (!grid) return;
  if (!events || !events.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:rgba(255,255,255,.3)">
      <div style="font-size:2.5rem;margin-bottom:.8rem">📅</div>
      <div style="font-size:.9rem;line-height:1.7">Próximamente publicaremos el calendario de eventos 2026.<br>Síguenos en redes o suscríbete para estar al tanto.</div>
    </div>`;
    return;
  }
  const tmap = { campeonato:'ebt', expedicion:'ebe', seminario:'ebs', social:'ebg', liga:'ebl' };
  const lmap = { campeonato:'Torneo', expedicion:'Expedición', seminario:'Seminario', social:'Gala', liga:'Liga' };
  grid.innerHTML = events.map(e => {
    const d = formatDate(e.fecha);
    const pct = Math.round((e.plazas_ocupadas / e.plazas_total) * 100);
    const tclass = tmap[e.tipo] || 'ebt';
    const tlabel = lmap[e.tipo] || e.tipo;
    const btnHtml = e.inscripciones_abiertas
      ? `<button class="btn-ev be-g" onclick="openEventModal(${JSON.stringify(e.titulo).replace(/"/g,"'")},${JSON.stringify(e.lugar).replace(/"/g,"'")})">Inscribirme</button>`
      : `<span style="font-size:.7rem;color:rgba(255,255,255,.3);font-weight:600">Próximamente</span>`;
    return `<div class="evc${e.destacado ? ' feat' : ''}">
      <div class="ev-tp">
        <div class="ev-dt"><div class="ev-dy">${d.day}</div><div class="ev-mn">${d.month}</div></div>
        <div>
          <span class="ev-bd2 ${tclass}">${tlabel}</span>
          <div class="ev-ti">${e.titulo}</div>
        </div>
      </div>
      <div class="ev-by">
        <div class="ev-lc">📍 ${e.lugar}</div>
        <div class="ev-bm">
          <div class="ev-sp">
            <div class="ev-st">Inscritos: <span>${e.plazas_ocupadas}/${e.plazas_total}</span></div>
            <div class="ev-sb"><div class="ev-sf" style="width:${pct}%"></div></div>
          </div>
          ${btnHtml}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── RENDER RANKING ────────────────────────────────────────
let _rankingData = [];
const _rkF = { sexo:'all', cat:'all', nivel:'all' };

function _loadRkConfig() {
  try {
    const raw = localStorage.getItem('aemt_puntos_config');
    const cfg = raw ? JSON.parse(raw) : null;
    const defCats = [
      {id:'M35',label:'M+35',sexo:'M'},{id:'M40',label:'M+40',sexo:'M'},{id:'M45',label:'M+45',sexo:'M'},
      {id:'M50',label:'M+50',sexo:'M'},{id:'M55',label:'M+55',sexo:'M'},{id:'M60',label:'M+60',sexo:'M'},
      {id:'F35',label:'F+35',sexo:'F'},{id:'F40',label:'F+40',sexo:'F'},{id:'F45',label:'F+45',sexo:'F'},
      {id:'F50',label:'F+50',sexo:'F'},{id:'F55',label:'F+55',sexo:'F'},{id:'F60',label:'F+60',sexo:'F'},
    ];
    const defNiveles = [{id:'competitivo',label:'Competitivo'},{id:'recreativo',label:'Recreativo'}];
    return {
      categorias_edad: (cfg && cfg.categorias_edad) || defCats,
      niveles: (cfg && cfg.niveles) || defNiveles,
    };
  } catch { return { categorias_edad:[], niveles:[] }; }
}

function renderRankingFilters() {
  const filters = q('#rkFl');
  if (!filters) return;
  const { categorias_edad, niveles } = _loadRkConfig();

  // Group cats by sex
  const mCats = categorias_edad.filter(c => c.sexo === 'M');
  const fCats = categorias_edad.filter(c => c.sexo === 'F');

  filters.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.5rem;align-items:center">
      <span style="font-size:.62rem;font-weight:800;color:var(--gr);letter-spacing:.7px;text-transform:uppercase;min-width:40px">Sexo</span>
      <button class="rf${_rkF.sexo==='all'?' act':''}" onclick="rkFilter('sexo','all')">Todos</button>
      <button class="rf${_rkF.sexo==='M'?' act':''}" onclick="rkFilter('sexo','M')">♂ Masc.</button>
      <button class="rf${_rkF.sexo==='F'?' act':''}" onclick="rkFilter('sexo','F')">♀ Fem.</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.5rem;align-items:center">
      <span style="font-size:.62rem;font-weight:800;color:var(--gr);letter-spacing:.7px;text-transform:uppercase;min-width:40px">Edad</span>
      <button class="rf${_rkF.cat==='all'?' act':''}" onclick="rkFilter('cat','all')">Todas</button>
      ${mCats.map(c=>`<button class="rf${_rkF.cat===c.id?' act':''}" onclick="rkFilter('cat','${c.id}')">${c.label}</button>`).join('')}
      ${fCats.map(c=>`<button class="rf${_rkF.cat===c.id?' act':''}" onclick="rkFilter('cat','${c.id}')">${c.label}</button>`).join('')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:.35rem;align-items:center">
      <span style="font-size:.62rem;font-weight:800;color:var(--gr);letter-spacing:.7px;text-transform:uppercase;min-width:40px">Nivel</span>
      <button class="rf${_rkF.nivel==='all'?' act':''}" onclick="rkFilter('nivel','all')">Todos</button>
      ${niveles.map(n=>`<button class="rf${_rkF.nivel===n.id?' act':''}" onclick="rkFilter('nivel','${n.id}')">${n.label}</button>`).join('')}
    </div>`;
}

function rkFilter(dim, val) {
  _rkF[dim] = val;
  renderRankingFilters();
  renderRankingTable();
}
window.rkFilter = rkFilter;

function renderRankingTable() {
  const body = q('#rkBd');
  if (!body) return;

  let data = _rankingData.slice();
  if (_rkF.sexo !== 'all') data = data.filter(r => r.sexo === _rkF.sexo || (r.categoria||'').startsWith(_rkF.sexo));
  if (_rkF.cat  !== 'all') data = data.filter(r => r.categoria === _rkF.cat);
  if (_rkF.nivel !== 'all') data = data.filter(r => r.nivel === _rkF.nivel);

  if (!data.length) {
    const msg = _rankingData.length
      ? 'Sin resultados para los filtros seleccionados'
      : 'El ranking AEMT se publicará al cierre de la primera jornada de competición';
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2.5rem 1rem;color:var(--gr);font-size:.85rem">${msg}</td></tr>`;
    return;
  }

  const catColors = { M35:'cm35', M40:'cm40', M45:'cm45', M50:'cm50', F35:'cm35', F40:'cm40', F45:'cm45', F50:'cm50' };
  body.innerHTML = data.map((r, i) => {
    const pos = i + 1;
    const rkBadge = pos <= 3
      ? `<div class="rk1 r${pos}">${pos}</div>`
      : `<div class="rk1 ro">${pos}</div>`;
    const ini = r.nombre.split(' ').map(x => x[0]).slice(0,2).join('');
    return `<tr>
      <td>${rkBadge}</td>
      <td><div class="ath-cl">
        <div class="ath-av">${ini}</div>
        <div><div class="ath-nm">${r.nombre}</div><div class="ath-cl2">${r.club}</div></div>
      </div></td>
      <td><span class="cat-b ${catColors[r.categoria] || 'cm40'}">${r.categoria}</span></td>
      <td style="font-size:.8rem;color:var(--gr)">${r.comunidad}</td>
      <td style="text-align:center;font-size:.8rem;color:var(--gr)">${r.eventos}</td>
      <td><div class="pts">${r.puntos}</div></td>
    </tr>`;
  }).join('');
}

async function renderRanking() {
  renderRankingFilters();
  renderRankingTable();
}
window.renderRanking = renderRanking;

// ── RENDER PLANS ──────────────────────────────────────────
function renderPlans() {
  const grid = q('#planGr');
  if (!grid) return;
  grid.innerHTML = PLANS.map(p => `
    <div class="plan ${p.cl}">
      <div class="p-hd">
        <div class="p-nm">${p.nm}</div>
        <div class="p-pr">${p.pr}<span>${p.pe}</span></div>
      </div>
      <ul class="p-fs">
        ${p.fs.map(f => `<li>${f}</li>`).join('')}
        ${p.no.map(f => `<li class="no">${f}</li>`).join('')}
      </ul>
    </div>`).join('');
}

// ── RENDER NEWS ───────────────────────────────────────────
let _newsData = [];

function renderNews(news) {
  _newsData = news;
  const grid = q('#nwGr');
  if (!grid) return;
  if (!news || !news.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:rgba(255,255,255,.3)">
      <div style="font-size:2.5rem;margin-bottom:.8rem">📰</div>
      <div style="font-size:.9rem">Las noticias de la AEMT aparecerán aquí próximamente.</div>
    </div>`;
    return;
  }
  grid.innerHTML = news.map((n, i) => `
    <div class="nwc${i === 0 ? ' feat' : ''}">
      <div class="nw-th">
        <div class="nw-em">${n.emoji || '📰'}</div>
        <div class="nw-ov"></div>
        <span class="nw-ct">${n.categoria}</span>
      </div>
      <div class="nw-bd">
        <div class="nw-dt">${n.fecha_publicacion || n.dt || ''}</div>
        <div class="nw-ti">${n.titulo}</div>
        <div class="nw-ex">${n.extracto}</div>
        <a class="nw-rd" href="#" onclick="openNewsModal(${n.id});return false;">Leer más →</a>
      </div>
    </div>`).join('');
}

function openNewsModal(id) {
  const n = _newsData.find(x => String(x.id) === String(id));
  if (!n) return;
  const paragraphs = (n.contenido || n.extracto || '')
    .split('\n').filter(p => p.trim())
    .map(p => `<p style="margin:0 0 1rem;line-height:1.75;color:#374151">${p}</p>`)
    .join('');
  openModal(`
    <div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.5rem">
      <span style="font-size:2rem">${n.emoji||'📰'}</span>
      <span style="font-size:.72rem;font-weight:800;background:var(--of);border:1px solid var(--bd);padding:.2rem .55rem;border-radius:5px;color:var(--gr)">${n.categoria}</span>
      <span style="font-size:.72rem;color:var(--gr)">${n.fecha_publicacion||''}</span>
    </div>
    <div class="m-ti" style="font-size:1.15rem;margin-bottom:1rem">${n.titulo}</div>
    <div style="border-left:3px solid var(--n);padding-left:1rem;margin-bottom:1.2rem;font-style:italic;color:var(--gr);font-size:.85rem">${n.extracto}</div>
    <div style="max-height:55vh;overflow-y:auto;padding-right:.5rem">${paragraphs || '<p style="color:var(--gr);font-style:italic">Contenido completo próximamente.</p>'}</div>
  `);
}
window.openNewsModal = openNewsModal;

// ── RENDER SPONSORS ───────────────────────────────────────
function renderSponsors() {
  const grid = q('#spGr');
  if (!grid) return;
  const items = [
    { ic:'👟', nm:'Equipación',        sb:'Partner Principal' },
    { ic:'💊', nm:'Nutrición',         sb:'Partner Oficial' },
    { ic:'🏥', nm:'Seguros',           sb:'Partner Oficial' },
    { ic:'✈️', nm:'Turismo',           sb:'Colaborador' },
    { ic:'🏦', nm:'Entidad Financiera',sb:'Colaborador' },
  ];
  grid.innerHTML = items.map(s => `
    <a class="sp-sl" onclick="toast('📧 Contacta info@aemt.es para patrocinar la AEMT')">
      <span class="sp-ic">${s.ic}</span>
      <span class="sp-tx">${s.nm}</span>
      <span class="sp-sb">${s.sb}</span>
    </a>`).join('');
}

// ── MODAL ─────────────────────────────────────────────────
function openModal(html) {
  const modal = q('#modal');
  q('#mCt').innerHTML = html;
  modal.classList.add('open');
}
function closeModal() { q('#modal').classList.remove('open'); }
window.closeModal = closeModal;

function openEventModal(titulo, lugar) {
  openModal(`
    <div class="m-ti">${titulo}</div>
    <div class="m-sb">${lugar} · Evento privado AEMT</div>
    <div class="fr">
      <div class="fg"><label>Nombre completo</label><input type="text" id="ev-nm" placeholder="Tu nombre"></div>
      <div class="fg"><label>Email</label><input type="email" id="ev-em" placeholder="email@email.com"></div>
    </div>
    <div class="fr">
      <div class="fg"><label>Categoría</label><input type="text" id="ev-ct" placeholder="M+40 / -68kg"></div>
      <div class="fg"><label>Nº Licencia Federativa</label><input type="text" id="ev-lc" placeholder="Obligatoria para competir"></div>
    </div>
    <div class="fck" style="margin-bottom:1.4rem">
      <input type="checkbox" id="mc">
      <label for="mc">Confirmo tener licencia federativa vigente, acepto el reglamento del evento y las normas AEMT.</label>
    </div>
    <button class="fsb" onclick="submitEventForm('${titulo}')">Confirmar Inscripción</button>
  `);
}
window.openEventModal = openEventModal;

async function submitEventForm(titulo) {
  if (!q('#mc').checked) { toast('⚠️ Debes aceptar el reglamento'); return; }
  const btn = q('#modal .fsb');
  btn.textContent = 'Enviando...'; btn.disabled = true;
  await new Promise(r => setTimeout(r, 700));
  closeModal();
  toast('✅ Inscripción recibida. Confirmaremos por email en 48h.');
}
window.submitEventForm = submitEventForm;

// ── DISCOUNT CODE ─────────────────────────────────────────
const PLAN_PRECIOS = { estandar: 60, joven: 60, colaborador: 60 };
let _descuentoAplicado = null;

function aplicarDescuento() {
  const codigo = (q('#f-desc')?.value || '').trim().toUpperCase();
  const msgEl  = q('#desc-msg');
  if (!msgEl) return;

  if (!codigo) {
    _descuentoAplicado = null;
    msgEl.innerHTML = '';
    return;
  }

  const todos = JSON.parse(localStorage.getItem('aemt_descuentos') || '[]');
  const desc  = todos.find(d => d.codigo.toUpperCase() === codigo);

  if (!desc) {
    _descuentoAplicado = null;
    msgEl.innerHTML = '<span style="color:#ef4444">❌ Código no válido</span>';
    return;
  }
  if (!desc.activo) {
    _descuentoAplicado = null;
    msgEl.innerHTML = '<span style="color:#ef4444">❌ Este código está desactivado</span>';
    return;
  }
  if (desc.caducidad && new Date(desc.caducidad) < new Date()) {
    _descuentoAplicado = null;
    msgEl.innerHTML = '<span style="color:#ef4444">❌ Código caducado</span>';
    return;
  }
  if (desc.usos_max && desc.usos >= desc.usos_max) {
    _descuentoAplicado = null;
    msgEl.innerHTML = '<span style="color:#ef4444">❌ Este código ha alcanzado el límite de usos</span>';
    return;
  }

  const planSel = q('#f-plan')?.value;
  if (desc.planes && desc.planes.length && !desc.planes.includes(planSel)) {
    _descuentoAplicado = null;
    msgEl.innerHTML = `<span style="color:#f59e0b">⚠️ Este código no aplica al plan seleccionado</span>`;
    return;
  }

  _descuentoAplicado = desc;
  const precioBase = PLAN_PRECIOS[planSel] || 60;
  const ahorro = desc.tipo === 'porcentaje'
    ? Math.round(precioBase * desc.valor / 100 * 100) / 100
    : Math.min(Number(desc.valor), precioBase);
  const precioFinal = Math.max(0, precioBase - ahorro);
  const detalle = desc.tipo === 'porcentaje' ? `${desc.valor}% dto.` : `${desc.valor}€ dto.`;

  msgEl.innerHTML = `<span style="color:#16a34a;font-weight:700">✅ Código aplicado — ${detalle} → precio final: <strong>${precioFinal}€</strong></span>`;
  toast(`✅ Descuento aplicado: ${detalle}`);
}
window.aplicarDescuento = aplicarDescuento;

// ── MEMBERSHIP FORM ───────────────────────────────────────
async function subMem() {
  // Honeypot anti-spam: si el campo trampa tiene valor, es un bot
  if (q('#hp-mem')?.value) return;

  const ckp = q('#ckp');
  if (!ckp.checked) { toast('⚠️ Debes aceptar la política de privacidad'); return; }

  const nombre    = q('#f-nombre')?.value.trim();
  const apellidos = q('#f-apellidos')?.value.trim();
  const email     = q('#f-email')?.value.trim();
  const telefono  = q('#f-tel')?.value.trim();
  const ccaa      = q('#f-ccaa')?.value;
  const plan      = q('#f-plan')?.value;
  const grado     = q('#f-grado')?.value.trim();

  const metodoPago = q('#f-pago')?.value;
  if (!nombre || !apellidos || !email || !ccaa || !plan) {
    toast('⚠️ Por favor, completa todos los campos obligatorios');
    return;
  }
  if (!metodoPago) { toast('⚠️ Selecciona un método de pago'); return; }
  // Validar domiciliación SEPA
  if (metodoPago === 'domiciliacion') {
    const sepaIban = q('#sepa-iban')?.value.trim().replace(/\s/g,'');
    const sepaTitular = q('#sepa-titular')?.value.trim();
    const sepaOk = q('#sepa-ck')?.checked;
    if (!sepaTitular || !sepaIban) { toast('⚠️ Completa los datos SEPA (titular e IBAN)'); return; }
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(sepaIban)) { toast('⚠️ IBAN no válido'); return; }
    if (!sepaOk) { toast('⚠️ Debes aceptar el mandato SEPA'); return; }
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!EMAIL_RE.test(email)) { toast('⚠️ El email no tiene un formato válido'); return; }

  if (telefono) {
    const TEL_RE = /^(\+34|0034)?[\s-]?[6789]\d{8}$/;
    if (!TEL_RE.test(telefono.replace(/\s/g, ''))) { toast('⚠️ Teléfono no válido — usa formato español: 6XX XXX XXX'); return; }
  }

  const btn = q('#btn-mem');
  btn.textContent = 'Enviando solicitud...'; btn.disabled = true;

  const msg = q('#form-msg');
  const pagoExtra = metodoPago === 'domiciliacion' ? {
    sepa_titular: q('#sepa-titular')?.value.trim(),
    sepa_iban: q('#sepa-iban')?.value.trim().replace(/\s/g,'').toUpperCase(),
    sepa_bic: q('#sepa-bic')?.value.trim(),
  } : {};
  const codigoDesc = _descuentoAplicado?.codigo || null;
  const { error } = await submitMembership({ nombre, apellidos, email, telefono, ccaa, plan, grado, metodo_pago: metodoPago, codigo_descuento: codigoDesc, ...pagoExtra });

  btn.textContent = 'Enviar Solicitud de Adhesión'; btn.disabled = false;

  if (error) {
    if (msg) { msg.textContent = '❌ Error al enviar. Inténtalo de nuevo o escríbenos a info@aemt.es'; msg.className = 'err'; }
    toast('❌ Error al enviar la solicitud');
  } else {
    // Redirigir a pasarela de pago si corresponde
    const cfg = await loadPaymentConfig();
    if (metodoPago === 'stripe' && cfg.stripe?.link) {
      if (msg) { msg.textContent = '✅ Solicitud enviada. Redirigiendo a Stripe...'; msg.className = 'ok'; }
      setTimeout(() => window.open(cfg.stripe.link, '_blank'), 1200);
    } else if (metodoPago === 'redsys' && cfg.redsys?.link) {
      if (msg) { msg.textContent = '✅ Solicitud enviada. Redirigiendo a Redsys...'; msg.className = 'ok'; }
      setTimeout(() => window.open(cfg.redsys.link, '_blank'), 1200);
    } else {
      if (msg) { msg.textContent = '✅ Solicitud enviada. Responderemos en menos de 48 horas con los detalles de pago.'; msg.className = 'ok'; }
    }
    toast('✅ Solicitud enviada correctamente');
    q('#f-nombre').value = '';
    q('#f-apellidos').value = '';
    q('#f-email').value = '';
    q('#f-tel').value = '';
    q('#f-ccaa').value = '';
    q('#f-grado').value = '';
    if (q('#f-desc')) q('#f-desc').value = '';
    if (q('#desc-msg')) q('#desc-msg').innerHTML = '';
    _descuentoAplicado = null;
    ckp.checked = false;
    q('#cki').checked = false;
  }
}
// ── PAYMENT CONFIG & FORM ─────────────────────────────────
let _pagoConfig = null;

async function loadPaymentConfig() {
  if (_pagoConfig) return _pagoConfig;
  try {
    const remote = await fetchConfig('pagos');
    _pagoConfig = remote || {};
  } catch { _pagoConfig = {}; }
  return _pagoConfig;
}

async function onPaymentMethodChange(metodo) {
  const panel = q('#pago-panel');
  if (!panel) return;
  if (!metodo) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  panel.innerHTML = '<div style="color:rgba(200,148,42,.7);font-size:.78rem">Cargando...</div>';
  const cfg = await loadPaymentConfig();
  if (metodo === 'transferencia') {
    const t = cfg.transferencia || {};
    panel.innerHTML = `
      <div style="font-weight:700;color:#c8942a;margin-bottom:.4rem">📑 Transferencia bancaria</div>
      <div style="line-height:1.9;color:rgba(255,255,255,.75)">
        <div><strong>Titular:</strong> ${t.titular || 'AEMT — Asociación Española de Taekwondo Masters'}</div>
        <div><strong>IBAN:</strong> ${t.iban || '— (configura en el panel directivo)'}</div>
        <div><strong>Banco:</strong> ${t.banco || '—'}</div>
        <div><strong>Concepto:</strong> ${t.concepto || 'Cuota AEMT 2026 - [TU NOMBRE]'}</div>
      </div>
      <div style="font-size:.75rem;color:rgba(255,255,255,.4);margin-top:.5rem">Envía el justificante a info@aemt.es tras realizar la transferencia.</div>`;
  } else if (metodo === 'domiciliacion') {
    panel.innerHTML = `
      <div style="font-weight:700;color:#c8942a;margin-bottom:.6rem">🏦 Domiciliación bancaria — Mandato SEPA</div>
      <div class="fr">
        <div class="fg"><label>Titular de la cuenta *</label><input type="text" id="sepa-titular" placeholder="Nombre completo del titular"></div>
        <div class="fg"><label>IBAN *</label><input type="text" id="sepa-iban" placeholder="ES00 0000 0000 00 0000000000" maxlength="34" oninput="this.value=this.value.toUpperCase()"></div>
      </div>
      <div class="fg"><label>BIC / SWIFT (opcional)</label><input type="text" id="sepa-bic" placeholder="Ej: CAIXESBBXXX"></div>
      <div class="fck" style="margin-top:.6rem">
        <input type="checkbox" id="sepa-ck">
        <label for="sepa-ck" style="font-size:.78rem">Autorizo a la AEMT a cargar en mi cuenta el importe de la cuota anual (60 €). Este mandato está protegido por el esquema de domiciliación SEPA. Puedo cancelarlo en cualquier momento.</label>
      </div>`;
  } else if (metodo === 'stripe') {
    const link = cfg.stripe?.link;
    panel.innerHTML = link
      ? `<div style="font-weight:700;color:#c8942a;margin-bottom:.4rem">💳 Pago con tarjeta — Stripe</div>
         <p style="color:rgba(255,255,255,.7);font-size:.8rem">Al enviar la solicitud serás redirigido a la pasarela segura de Stripe para completar el pago de 60 €.</p>`
      : `<div style="color:rgba(255,255,255,.5);font-size:.8rem">⚠️ Pasarela Stripe no configurada aún. Contacta con info@aemt.es.</div>`;
  } else if (metodo === 'redsys') {
    const link = cfg.redsys?.link;
    panel.innerHTML = link
      ? `<div style="font-weight:700;color:#c8942a;margin-bottom:.4rem">💳 Pago con tarjeta — Redsys</div>
         <p style="color:rgba(255,255,255,.7);font-size:.8rem">Al enviar la solicitud serás redirigido a la pasarela Redsys para completar el pago de 60 €.</p>`
      : `<div style="color:rgba(255,255,255,.5);font-size:.8rem">⚠️ Pasarela Redsys no configurada aún. Contacta con info@aemt.es.</div>`;
  }
}
window.onPaymentMethodChange = onPaymentMethodChange;

window.subMem = subMem;

// ── CONTACT FORM ──────────────────────────────────────────
async function subContact() {
  // Honeypot anti-spam
  if (q('#hp-ct')?.value) return;

  // RGPD: verificar consentimiento
  if (!q('#ct-ckp')?.checked) { toast('⚠️ Debes aceptar la política de privacidad'); return; }

  const nombre  = q('#ct-nombre')?.value.trim();
  const email   = q('#ct-email')?.value.trim();
  const asunto  = q('#ct-asunto')?.value;
  const mensaje = q('#ct-mensaje')?.value.trim();

  if (!nombre || !email || !mensaje) {
    toast('⚠️ Por favor, completa nombre, email y mensaje');
    return;
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!EMAIL_RE.test(email)) { toast('⚠️ El email no tiene un formato válido'); return; }

  const btn = q('#btn-contact');
  btn.textContent = 'Enviando...'; btn.disabled = true;

  const { error } = await submitContact({ nombre, email, asunto, mensaje });

  btn.textContent = 'Enviar Mensaje'; btn.disabled = false;

  const msg = q('#ct-msg');
  if (error) {
    toast('❌ Error al enviar. Escríbenos directamente a info@aemt.es');
  } else {
    if (msg) msg.textContent = '✅ Mensaje enviado. Responderemos en breve.';
    toast('✅ Mensaje enviado correctamente');
    q('#ct-nombre').value = '';
    q('#ct-email').value  = '';
    q('#ct-mensaje').value = '';
  }
}
window.subContact = subContact;

// ── LEGAL MODAL ───────────────────────────────────────────
const LEGAL_CONTENT = {
  aviso: {
    titulo: 'Aviso Legal',
    contenido: `
<h3 style="margin:.8rem 0 .4rem">1. Identificación del titular</h3>
<p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa:</p>
<ul style="padding-left:1.2rem;line-height:2">
  <li><strong>Denominación:</strong> Asociación Española de Taekwondo Masters (AEMT)</li>
  <li><strong>Domicilio social:</strong> C/ Alcalá de Guadaira, 10, Local 1, 28018 Madrid, España</li>
  <li><strong>Email de contacto:</strong> info@aemt.es</li>
  <li><strong>Teléfono:</strong> +34 625 59 39 98</li>
  <li><strong>Registro:</strong> Asociación inscrita en el Registro Nacional de Asociaciones del Ministerio del Interior (número de registro pendiente de asignación tras inscripción RNA)</li>
  <li><strong>Responsable de contenidos:</strong> Junta Directiva de la AEMT</li>
</ul>
<h3 style="margin:.8rem 0 .4rem">2. Objeto y ámbito de aplicación</h3>
<p>El acceso y uso de este sitio web (<strong>aemtkd.es</strong>) está sujeto a las presentes condiciones legales y a la legislación vigente en España. El uso del sitio implica la aceptación de las mismas.</p>
<h3 style="margin:.8rem 0 .4rem">3. Propiedad intelectual e industrial</h3>
<p>Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño gráfico, código fuente) son propiedad de la AEMT o de sus licenciantes, y están protegidos por la legislación española e internacional de propiedad intelectual e industrial. Queda prohibida su reproducción total o parcial sin autorización expresa.</p>
<h3 style="margin:.8rem 0 .4rem">4. Responsabilidad</h3>
<p>La AEMT no se responsabiliza de los daños que pudieran derivarse del uso del sitio web, de interrupciones del servicio, de virus informáticos o de la inexactitud de los contenidos suministrados por terceros.</p>
<h3 style="margin:.8rem 0 .4rem">5. Legislación aplicable y jurisdicción</h3>
<p>Las presentes condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid, con renuncia expresa a cualquier otro fuero.</p>
<h3 style="margin:.8rem 0 .4rem">6. Contacto legal</h3>
<p>Para cualquier consulta legal: <strong>info@aemt.es</strong> — Plazo de respuesta: máximo 30 días hábiles.</p>`,
  },
  privacidad: {
    titulo: 'Política de Privacidad',
    contenido: `
<h3 style="margin:.8rem 0 .4rem">1. Responsable del tratamiento</h3>
<ul style="padding-left:1.2rem;line-height:2">
  <li><strong>Identidad:</strong> Asociación Española de Taekwondo Masters (AEMT)</li>
  <li><strong>Domicilio:</strong> C/ Alcalá de Guadaira, 10, Local 1, 28018 Madrid</li>
  <li><strong>Email:</strong> info@aemt.es — <strong>Tel:</strong> +34 625 59 39 98</li>
</ul>
<h3 style="margin:.8rem 0 .4rem">2. Datos que tratamos y finalidades</h3>
<table style="width:100%;border-collapse:collapse;font-size:.82rem;margin:.5rem 0">
  <thead><tr style="background:#f0f0f0"><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Datos</th><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Finalidad</th><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Base jurídica</th><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Conservación</th></tr></thead>
  <tbody>
    <tr><td style="padding:.4rem;border:1px solid #ddd">Nombre, apellidos, email, teléfono, CCAA, grado, plan</td><td style="padding:.4rem;border:1px solid #ddd">Gestión de la relación de abono</td><td style="padding:.4rem;border:1px solid #ddd">Ejecución del contrato de adhesión (art. 6.1.b RGPD)</td><td style="padding:.4rem;border:1px solid #ddd">Vigencia del abono + 5 años</td></tr>
    <tr><td style="padding:.4rem;border:1px solid #ddd">Email</td><td style="padding:.4rem;border:1px solid #ddd">Comunicaciones sobre eventos y actividades</td><td style="padding:.4rem;border:1px solid #ddd">Consentimiento expreso (art. 6.1.a RGPD)</td><td style="padding:.4rem;border:1px solid #ddd">Hasta retirada del consentimiento</td></tr>
    <tr><td style="padding:.4rem;border:1px solid #ddd">Nombre, email, consulta</td><td style="padding:.4rem;border:1px solid #ddd">Atención de consultas vía formulario de contacto</td><td style="padding:.4rem;border:1px solid #ddd">Consentimiento expreso (art. 6.1.a RGPD)</td><td style="padding:.4rem;border:1px solid #ddd">12 meses desde la consulta</td></tr>
    <tr><td style="padding:.4rem;border:1px solid #ddd">Imagen (fotografías/vídeos de eventos)</td><td style="padding:.4rem;border:1px solid #ddd">Difusión de actividades de la AEMT</td><td style="padding:.4rem;border:1px solid #ddd">Consentimiento expreso (art. 6.1.a RGPD)</td><td style="padding:.4rem;border:1px solid #ddd">Hasta retirada del consentimiento</td></tr>
  </tbody>
</table>
<h3 style="margin:.8rem 0 .4rem">3. Destinatarios de los datos</h3>
<p>Los datos no se ceden a terceros salvo obligación legal. Se utilizan proveedores de servicios técnicos (alojamiento web: Netlify Inc., EE.UU., con garantías adecuadas; base de datos: Supabase Inc., EE.UU., con garantías adecuadas) que actúan como encargados del tratamiento con las debidas garantías contractuales.</p>
<h3 style="margin:.8rem 0 .4rem">4. Transferencias internacionales</h3>
<p>Los datos pueden transferirse a EE.UU. (Netlify, Supabase) bajo las garantías del Marco de Privacidad de Datos UE-EE.UU. (adecuación de la Comisión Europea) o cláusulas contractuales tipo.</p>
<h3 style="margin:.8rem 0 .4rem">5. Tus derechos</h3>
<p>Puedes ejercer en cualquier momento los derechos de <strong>acceso, rectificación, supresión, oposición, portabilidad y limitación</strong> del tratamiento escribiendo a <strong>info@aemt.es</strong> con asunto "Protección de datos" y adjuntando copia de tu DNI. Responderemos en el plazo máximo de <strong>30 días hábiles</strong>. También puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener" style="color:var(--g)">www.aepd.es</a>).</p>
<h3 style="margin:.8rem 0 .4rem">6. Seguridad</h3>
<p>La AEMT aplica medidas técnicas y organizativas adecuadas para garantizar la seguridad de tus datos y evitar su alteración, pérdida o acceso no autorizado.</p>`,
  },
  cookies: {
    titulo: 'Política de Cookies',
    contenido: `
<h3 style="margin:.8rem 0 .4rem">¿Qué son las cookies?</h3>
<p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo al visitarlos.</p>
<h3 style="margin:.8rem 0 .4rem">Cookies que utilizamos</h3>
<table style="width:100%;border-collapse:collapse;font-size:.82rem;margin:.5rem 0">
  <thead><tr style="background:#f0f0f0"><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Nombre</th><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Tipo</th><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Finalidad</th><th style="padding:.4rem;text-align:left;border:1px solid #ddd">Duración</th></tr></thead>
  <tbody>
    <tr><td style="padding:.4rem;border:1px solid #ddd">aemt_cookies_ok</td><td style="padding:.4rem;border:1px solid #ddd">Técnica (localStorage)</td><td style="padding:.4rem;border:1px solid #ddd">Recordar aceptación del aviso de cookies</td><td style="padding:.4rem;border:1px solid #ddd">Persistente</td></tr>
    <tr><td style="padding:.4rem;border:1px solid #ddd">aemt_*</td><td style="padding:.4rem;border:1px solid #ddd">Técnica (localStorage)</td><td style="padding:.4rem;border:1px solid #ddd">Almacenamiento local de datos de la aplicación (sesión de admin, preferencias)</td><td style="padding:.4rem;border:1px solid #ddd">Persistente</td></tr>
    <tr><td style="padding:.4rem;border:1px solid #ddd">sb-* (Supabase)</td><td style="padding:.4rem;border:1px solid #ddd">Técnica (cookie de sesión)</td><td style="padding:.4rem;border:1px solid #ddd">Mantener la sesión autenticada del panel directivo</td><td style="padding:.4rem;border:1px solid #ddd">Sesión</td></tr>
  </tbody>
</table>
<p>Este sitio <strong>no utiliza cookies de análisis, publicidad ni seguimiento de terceros</strong>.</p>
<h3 style="margin:.8rem 0 .4rem">¿Cómo desactivar las cookies?</h3>
<p>Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que esto puede afectar al funcionamiento del panel directivo. Instrucciones: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener" style="color:var(--g)">Chrome</a> · <a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener" style="color:var(--g)">Firefox</a> · <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener" style="color:var(--g)">Safari</a></p>
<p>Para más información: <strong>info@aemt.es</strong></p>`,
  },
  estatutos: {
    titulo: 'Estatutos AEMT',
    contenido: `<p>Los Estatutos de la Asociación Española de Taekwondo Masters (AEMT) fueron aprobados por los socios fundadores el 16 de marzo de 2026 en Madrid.</p>
<p>Los Estatutos constan de <strong>35 artículos</strong> organizados en los siguientes capítulos:</p>
<ul style="padding-left:1.2rem;line-height:2">
  <li>Cap. I — Denominación, naturaleza, domicilio y ámbito</li>
  <li>Cap. II — Fines y actividades</li>
  <li>Cap. III — Socios: clases, derechos y obligaciones</li>
  <li>Cap. IV — Órganos de gobierno</li>
  <li>Cap. V — Régimen económico</li>
  <li>Cap. VI — Modificación de estatutos y disolución</li>
</ul>
<p>El texto íntegro está disponible bajo petición a los directivos o consultando en la sede de la AEMT. Una vez inscrita la asociación en el Registro Nacional de Asociaciones, los estatutos estarán disponibles para consulta pública.</p>`,
  },
  reglamento: {
    titulo: 'Reglamento Interno',
    contenido: `<p>El Reglamento de Régimen Interno de la AEMT regula el funcionamiento diario de la asociación y complementa los Estatutos en aquellos aspectos que requieren mayor detalle operativo.</p>
<p>Consta de <strong>24 artículos</strong> que regulan, entre otros:</p>
<ul style="padding-left:1.2rem;line-height:2">
  <li>Procedimiento de admisión de nuevos abonados</li>
  <li>Convocatoria y celebración de asambleas</li>
  <li>Funcionamiento de la Junta Directiva</li>
  <li>Régimen disciplinario</li>
  <li>Gestión económica y presupuestaria</li>
</ul>
<p>Aprobado en la primera reunión de la Junta Directiva, marzo de 2026.</p>`,
  },
  transparencia: {
    titulo: 'Transparencia',
    contenido: `<p>La AEMT se compromete con la transparencia en su gestión como asociación sin ánimo de lucro. En cumplimiento de los principios de buena gobernanza:</p>
<ul style="padding-left:1.2rem;line-height:2">
  <li>Las cuentas anuales se aprobarán en Asamblea General Ordinaria</li>
  <li>La composición de la Junta Directiva es pública</li>
  <li>Las subvenciones recibidas se publicarán en esta sección</li>
  <li>Los acuerdos de la Junta Directiva están documentados en actas</li>
</ul>
<p>Para solicitar información sobre la gestión de la AEMT: <strong>info@aemt.es</strong></p>`,
  },
};

function openLegalModal(tipo) {
  const content = LEGAL_CONTENT[tipo];
  if (!content) return;
  openModal(`
    <div class="m-ti">${content.titulo}</div>
    <div style="max-height:60vh;overflow-y:auto;padding-right:.5rem;line-height:1.7;font-size:.85rem;color:#374151">
      ${content.contenido}
    </div>
    <button class="fsb" style="margin-top:1.2rem" onclick="closeModal()">Cerrar</button>
  `);
}
window.openLegalModal = openLegalModal;

// ── ACCESO PROTEGIDO ──────────────────────────────────────
async function checkAccesoProtegido() {
  try {
    // Fetch authoritative config from Supabase; fallback to localStorage
    let cfg = {};
    try {
      const remote = await fetchConfig('acceso');
      if (remote !== null) {
        cfg = remote;
        try { localStorage.setItem('aemt_acceso', JSON.stringify(remote)); } catch {}
      } else {
        cfg = JSON.parse(localStorage.getItem('aemt_acceso') || '{}');
      }
    } catch {
      cfg = JSON.parse(localStorage.getItem('aemt_acceso') || '{}');
    }

    if (!cfg.activa || !cfg.password) return; // no protection

    // Already authenticated this session?
    if (sessionStorage.getItem('aemt_auth') === 'ok') return;

    // Show gate
    const gate = document.createElement('div');
    gate.id = 'acc-gate';
    gate.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;font-family:Outfit,sans-serif';
    gate.innerHTML = `
      <div style="text-align:center;margin-bottom:.5rem">
        <div style="font-family:\'Bebas Neue\',sans-serif;font-size:3rem;letter-spacing:4px;color:#c8942a">AEMT</div>
        <div style="font-size:.8rem;color:rgba(255,255,255,.4);letter-spacing:2px;text-transform:uppercase">Asociación Española de Taekwondo Masters</div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:2rem 2.5rem;max-width:380px;width:90%;text-align:center">
        <div style="font-size:2.5rem;margin-bottom:.8rem">🔒</div>
        <div style="font-size:1rem;font-weight:700;color:white;margin-bottom:.5rem">Acceso restringido</div>
        <div style="font-size:.82rem;color:rgba(255,255,255,.5);margin-bottom:1.5rem">${cfg.mensaje || 'Sitio web en construcción. Introduce la contraseña para continuar.'}</div>
        <input type="password" id="gate-pw" placeholder="Contraseña" style="width:100%;padding:.7rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:white;font-size:.9rem;text-align:center;outline:none;margin-bottom:.8rem" onkeydown="if(event.key==='Enter')checkGatePw()">
        <button onclick="checkGatePw()" style="width:100%;padding:.75rem;background:linear-gradient(135deg,#c8942a,#e5b84e);border:none;border-radius:8px;color:#0a0a0a;font-weight:800;font-size:.9rem;cursor:pointer;letter-spacing:.5px">Entrar →</button>
        <div id="gate-err" style="font-size:.75rem;color:#f87171;margin-top:.6rem;min-height:1rem"></div>
      </div>`;
    document.body.appendChild(gate);
    document.body.style.overflow = 'hidden';

    window._gatePw = cfg.password;
  } catch { /* no block on error */ }
}

function checkGatePw() {
  const input = document.querySelector('#gate-pw');
  if (!input) return;
  if (input.value === window._gatePw) {
    sessionStorage.setItem('aemt_auth', 'ok');
    const gate = document.querySelector('#acc-gate');
    if (gate) { gate.style.opacity='0'; gate.style.transition='opacity .4s'; setTimeout(()=>gate.remove(),400); }
    document.body.style.overflow = '';
  } else {
    const err = document.querySelector('#gate-err');
    if (err) err.textContent = '❌ Contraseña incorrecta';
    input.value = '';
    input.focus();
  }
}
window.checkGatePw = checkGatePw;

// ── LOADER ────────────────────────────────────────────────
function startLoader(onDone) {
  const bar = q('.ldr-bar');
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) { pct = 100; clearInterval(iv); }
    if (bar) bar.style.width = pct + '%';
  }, 120);
  setTimeout(() => {
    q('#ldr').classList.add('hide');
    if (onDone) onDone();
  }, 2000);
}

// ── INIT ──────────────────────────────────────────────────
async function init() {
  await checkAccesoProtegido();
  await applyPortada();
  renderTicker(); // after applyPortada so localStorage is synced from Supabase
  renderNations();
  renderPlans();
  renderSponsors();

  // Load data (with Supabase or static fallback)
  const [events, ranking, news, count] = await Promise.all([
    fetchEvents(),
    fetchRanking(),
    fetchNews(),
    fetchAbonadosCount(),
    renderGallery(),
    renderRedes(),
  ]);

  renderHeroCards(events);
  renderEvents(events);
  _rankingData = ranking;
  renderRanking();
  renderNews(news);

  // Ripple effect — must attach after all dynamic content is rendered
  qq('.btn-hp, .btn-go, .fsb, .ct-sb, .btn-ev.be-g').forEach(b => b.addEventListener('click', addRipple));

  // Counter
  const cntEl = q('#c1');
  observeReveal();

  startLoader(() => {
    if (cntEl) animCounter(cntEl, count);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSupabase(); // debe ejecutarse antes de init() para que _isConfigured sea true
  init();
  initCookieBanner();
});
window.toast = toast;

// ── BANNER DE COOKIES ─────────────────────────────────────
function initCookieBanner() {
  if (localStorage.getItem('aemt_cookies_ok')) return;
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.innerHTML = `
    <div style="max-width:700px">
      <strong>Este sitio web utiliza cookies técnicas</strong> estrictamente necesarias para su funcionamiento. No utilizamos cookies de seguimiento ni publicitarias.
      <a href="#" onclick="openLegalModal('cookies');return false;" style="color:var(--gl);text-decoration:underline;margin-left:.4rem">Más información</a>
    </div>
    <div style="display:flex;gap:.6rem;flex-shrink:0">
      <button id="cookie-accept" onclick="acceptCookies()" style="background:var(--g);color:var(--nd);border:none;padding:.5rem 1.2rem;border-radius:6px;font-weight:700;cursor:pointer;font-size:.82rem">Aceptar</button>
      <button onclick="rejectCookies()" style="background:transparent;color:#ccc;border:1px solid #555;padding:.5rem 1rem;border-radius:6px;cursor:pointer;font-size:.82rem">Solo necesarias</button>
    </div>`;
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;color:#e0e0e0;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;z-index:99999;font-size:.82rem;border-top:2px solid var(--g);';
  document.body.appendChild(banner);
}
function acceptCookies() {
  localStorage.setItem('aemt_cookies_ok', '1');
  document.getElementById('cookie-banner')?.remove();
}
function rejectCookies() {
  localStorage.setItem('aemt_cookies_ok', 'minimal');
  document.getElementById('cookie-banner')?.remove();
}
window.acceptCookies = acceptCookies;
window.rejectCookies = rejectCookies;
