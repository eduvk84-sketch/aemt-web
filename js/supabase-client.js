// ============================================================
// AEMT — js/supabase-client.js
// Supabase client + localStorage fallback layer
// En modo demo (sin credenciales) todos los datos se guardan
// en localStorage y persisten entre recargas.
// ============================================================

let _sb = null;
let _isConfigured = false;

// ── LOCALSTORAGE STORE ────────────────────────────────────
const LS = {
  events:   'aemt_events',
  ranking:  'aemt_ranking',
  news:     'aemt_news',
  abonados: 'aemt_abonados',
};

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    // Devolver el array tal cual, aunque esté vacío — sin caer en datos estáticos
    if (!Array.isArray(data)) return fallback;
    return data;
  } catch { return fallback; }
}

function lsSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch(e) { console.warn('[AEMT] localStorage write error:', e); }
}

function lsNextId(data) {
  const maxId = data.reduce((m, x) => Math.max(m, parseInt(x.id) || 0), 0);
  return String(maxId + 1);
}

function lsUpsert(key, item, fallback) {
  const data = lsGet(key, fallback);
  if (item.id) {
    const updated = data.map(d => String(d.id) === String(item.id) ? { ...d, ...item } : d);
    // If id not found, append
    const found = data.some(d => String(d.id) === String(item.id));
    lsSet(key, found ? updated : [...data, { ...item }]);
  } else {
    lsSet(key, [...data, { ...item, id: lsNextId(data) }]);
  }
}

function lsDelete(key, id, fallback) {
  const data = lsGet(key, fallback);
  lsSet(key, data.filter(d => String(d.id) !== String(id)));
}

function initLocalStore() {
  // Seed localStorage with static data on first visit
  if (!localStorage.getItem(LS.events))
    lsSet(LS.events, STATIC_EVENTS);
  if (!localStorage.getItem(LS.ranking))
    lsSet(LS.ranking, STATIC_RANKING);
  if (!localStorage.getItem(LS.news))
    lsSet(LS.news, STATIC_NEWS);
  if (!localStorage.getItem(LS.abonados))
    lsSet(LS.abonados, STATIC_ABONADOS);
  console.info('[AEMT] localStorage store listo');
}

// Reset all demo data to original static values
function resetDemoData() {
  Object.values(LS).forEach(k => localStorage.removeItem(k));
  initLocalStore();
  console.info('[AEMT] Datos demo reiniciados');
}
window.resetDemoData = resetDemoData;

// ── INIT ──────────────────────────────────────────────────
function initSupabase() {
  const isPlaceholder =
    SUPABASE_URL.includes('TU_PROYECTO') ||
    SUPABASE_ANON.includes('TU_ANON_KEY');

  if (isPlaceholder) {
    console.info('[AEMT] Supabase no configurado — usando localStorage');
    initLocalStore();
    return false;
  }

  try {
    const { createClient } = supabase;
    _sb = createClient(SUPABASE_URL, SUPABASE_ANON);
    _isConfigured = true;
    console.info('[AEMT] Supabase conectado ✓');
    return true;
  } catch (e) {
    console.warn('[AEMT] Error inicializando Supabase:', e);
    initLocalStore();
    return false;
  }
}

// ── AUTH ──────────────────────────────────────────────────
async function authLogin(email, password) {
  if (!_isConfigured) return { error: { message: 'Supabase no configurado' } };
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function authLogout() {
  if (!_isConfigured) return;
  await _sb.auth.signOut();
}

async function authGetSession() {
  if (!_isConfigured) return null;
  const { data } = await _sb.auth.getSession();
  return data?.session || null;
}

// ── PUBLIC DATA ───────────────────────────────────────────
async function fetchEvents() {
  if (!_isConfigured) return lsGet(LS.events, STATIC_EVENTS);
  const { data, error } = await _sb
    .from('eventos')
    .select('*')
    .eq('publicado', true)
    .order('fecha', { ascending: true });
  if (error) { console.warn('[AEMT] fetchEvents:', error); return []; }
  return data;
}

async function fetchRanking(categoria = 'all') {
  if (!_isConfigured) {
    const all = lsGet(LS.ranking, STATIC_RANKING);
    if (categoria === 'all') return all;
    return all.filter(r => r.categoria === categoria);
  }
  let query = _sb
    .from('ranking')
    .select('posicion,nombre,club,categoria,comunidad,eventos,puntos')
    .order('posicion', { ascending: true });
  if (categoria !== 'all') query = query.eq('categoria', categoria);
  const { data, error } = await query;
  if (error) { console.warn('[AEMT] fetchRanking:', error); return []; }
  return data;
}

async function fetchNews() {
  if (!_isConfigured) {
    return lsGet(LS.news, STATIC_NEWS).filter(n => n.publicada !== false);
  }
  const { data, error } = await _sb
    .from('noticias')
    .select('*')
    .eq('publicada', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(6);
  if (error) { console.warn('[AEMT] fetchNews:', error); return []; }
  return data;
}

async function fetchAbonadosCount() {
  if (!_isConfigured) {
    return lsGet(LS.abonados, STATIC_ABONADOS).filter(a => a.estado === 'activo').length;
  }
  const { count, error } = await _sb
    .from('abonados')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'activo');
  if (error) return lsGet(LS.abonados, STATIC_ABONADOS).filter(a => a.estado === 'activo').length;
  return count ?? 0;
}

// ── FORM SUBMISSIONS ──────────────────────────────────────
async function submitMembership(data) {
  if (!_isConfigured) {
    await new Promise(r => setTimeout(r, 600));
    const abs = lsGet(LS.abonados, STATIC_ABONADOS);
    const newMember = {
      ...data,
      id: lsNextId(abs),
      comunidad_autonoma: data.ccaa,
      estado: 'pendiente',
      fecha_solicitud: new Date().toISOString(),
      notas: '',
    };
    lsSet(LS.abonados, [...abs, newMember]);
    return { error: null };
  }
  const { error } = await _sb.from('abonados').insert([{
    nombre: data.nombre, apellidos: data.apellidos, email: data.email,
    telefono: data.telefono, comunidad_autonoma: data.ccaa,
    plan: data.plan, cinturon: data.grado || null,
    estado: 'pendiente', fecha_solicitud: new Date().toISOString(),
  }]);
  return { error };
}

async function submitContact(data) {
  if (!_isConfigured) {
    await new Promise(r => setTimeout(r, 500));
    return { error: null };
  }
  const { error } = await _sb.from('contactos').insert([{
    nombre: data.nombre, email: data.email,
    asunto: data.asunto, mensaje: data.mensaje,
    fecha: new Date().toISOString(),
  }]);
  return { error };
}

// ── ADMIN — ABONADOS ──────────────────────────────────────
async function adminFetchAbonados() {
  if (!_isConfigured) return lsGet(LS.abonados, STATIC_ABONADOS);
  const { data, error } = await _sb
    .from('abonados').select('*')
    .order('fecha_solicitud', { ascending: false });
  if (error) { console.warn('[AEMT] adminFetchAbonados:', error); return []; }
  return data;
}

async function adminUpdateAbonado(id, updates) {
  if (!_isConfigured) {
    const abs = lsGet(LS.abonados, STATIC_ABONADOS);
    lsSet(LS.abonados, abs.map(a => String(a.id) === String(id) ? { ...a, ...updates } : a));
    return { error: null };
  }
  const { error } = await _sb.from('abonados').update(updates).eq('id', id);
  return { error };
}

async function adminInsertAbonado(data) {
  if (!_isConfigured) {
    const abs = lsGet(LS.abonados, STATIC_ABONADOS);
    lsSet(LS.abonados, [...abs, { ...data, id: lsNextId(abs) }]);
    return { error: null };
  }
  const { error } = await _sb.from('abonados').insert([data]);
  return { error };
}

async function adminDeleteAbonado(id) {
  if (!_isConfigured) {
    lsDelete(LS.abonados, id, STATIC_ABONADOS);
    return { error: null };
  }
  const { error } = await _sb.from('abonados').delete().eq('id', id);
  return { error };
}

// ── ADMIN — KPIs ──────────────────────────────────────────
async function adminFetchKPIs() {
  if (!_isConfigured) {
    const abs  = lsGet(LS.abonados, STATIC_ABONADOS);
    const evts = lsGet(LS.events, STATIC_EVENTS);
    const now  = new Date();
    const prox = evts
      .filter(e => new Date(e.fecha) >= now)
      .sort((a,b) => new Date(a.fecha) - new Date(b.fecha))[0];
    const activos = abs.filter(a => a.estado === 'activo').length;
    return {
      total:      abs.length,
      pendientes: abs.filter(a => a.estado === 'pendiente').length,
      ingresos:   `${(activos * 60).toLocaleString('es-ES')}€`,
      evento_prox: prox ? prox.titulo.split(' ').slice(0,4).join(' ') : 'Sin eventos',
    };
  }
  const [total, pendientes] = await Promise.all([
    _sb.from('abonados').select('*', { count:'exact', head:true }),
    _sb.from('abonados').select('*', { count:'exact', head:true }).eq('estado','pendiente'),
  ]);
  return {
    total:       total.count ?? 0,
    pendientes:  pendientes.count ?? 0,
    ingresos:    `${((total.count ?? 0) * 60).toLocaleString('es-ES')}€`,
    evento_prox: 'AEMT Open',
  };
}

// ── ADMIN — EVENTOS ───────────────────────────────────────
async function adminFetchEventos() {
  if (!_isConfigured) return lsGet(LS.events, STATIC_EVENTS);
  const { data, error } = await _sb
    .from('eventos').select('*')
    .order('fecha', { ascending: true });
  if (error) return lsGet(LS.events, STATIC_EVENTS);
  // Reinyectar circular_pdf desde localStorage (no se almacena en Supabase)
  return (data || []).map(e => {
    try {
      const raw = localStorage.getItem('aemt_circ_' + e.id);
      return raw ? { ...e, circular_pdf: JSON.parse(raw) } : e;
    } catch { return e; }
  });
}

async function adminUpsertEvento(evento) {
  if (!_isConfigured) {
    lsUpsert(LS.events, evento, STATIC_EVENTS);
    return { error: null };
  }
  // Extraer campos que no van a la BD de Supabase
  const { circular_pdf, inscritos, id: _id, ...dbEvento } = evento;
  // Guardar circular_pdf en localStorage keyed por id (base64 no va a Supabase)
  const savedId = evento.id || null;
  if (savedId && circular_pdf !== undefined) {
    try {
      if (circular_pdf) localStorage.setItem('aemt_circ_' + savedId, JSON.stringify(circular_pdf));
      else localStorage.removeItem('aemt_circ_' + savedId);
    } catch {}
  }
  // Siempre publicado = true al guardar desde el panel
  dbEvento.publicado = true;
  if (evento.id) {
    // UPDATE: no incluir id en el body
    const { error } = await _sb.from('eventos').update(dbEvento).eq('id', evento.id);
    return { error };
  } else {
    // INSERT: recuperar id para asociar circular_pdf
    const { data, error } = await _sb.from('eventos').insert([dbEvento]).select('id').maybeSingle();
    if (!error && data?.id && circular_pdf) {
      try { localStorage.setItem('aemt_circ_' + data.id, JSON.stringify(circular_pdf)); } catch {}
    }
    return { error };
  }
}

async function adminDeleteEvento(id) {
  if (!_isConfigured) {
    lsDelete(LS.events, id, STATIC_EVENTS);
    return { error: null };
  }
  const { error } = await _sb.from('eventos').delete().eq('id', id);
  return { error };
}

// ── ADMIN — RANKING ───────────────────────────────────────
async function adminFetchRanking() {
  if (!_isConfigured) return lsGet(LS.ranking, STATIC_RANKING);
  const { data, error } = await _sb
    .from('ranking').select('*')
    .order('posicion', { ascending: true });
  if (error) return lsGet(LS.ranking, STATIC_RANKING);
  return data;
}

async function adminUpsertRanking(row) {
  if (!_isConfigured) {
    lsUpsert(LS.ranking, row, STATIC_RANKING);
    return { error: null };
  }
  const { error } = row.id
    ? await _sb.from('ranking').update(row).eq('id', row.id)
    : await _sb.from('ranking').insert([row]);
  return { error };
}

async function adminDeleteRanking(id) {
  if (!_isConfigured) {
    lsDelete(LS.ranking, id, STATIC_RANKING);
    return { error: null };
  }
  const { error } = await _sb.from('ranking').delete().eq('id', id);
  return { error };
}

// ── ADMIN — NOTICIAS ──────────────────────────────────────
async function adminFetchNoticias() {
  if (!_isConfigured) return lsGet(LS.news, STATIC_NEWS);
  const { data, error } = await _sb
    .from('noticias').select('*')
    .order('fecha_publicacion', { ascending: false });
  if (error) return lsGet(LS.news, STATIC_NEWS);
  return data;
}

async function adminUpsertNoticia(noticia) {
  if (!_isConfigured) {
    lsUpsert(LS.news, noticia, STATIC_NEWS);
    return { error: null };
  }
  const { error } = noticia.id
    ? await _sb.from('noticias').update(noticia).eq('id', noticia.id)
    : await _sb.from('noticias').insert([noticia]);
  return { error };
}

async function adminDeleteNoticia(id) {
  if (!_isConfigured) {
    lsDelete(LS.news, id, STATIC_NEWS);
    return { error: null };
  }
  const { error } = await _sb.from('noticias').delete().eq('id', id);
  return { error };
}

// ── CONFIGURACIÓN (portada, acceso) ──────────────────────
async function fetchConfig(clave) {
  if (!_isConfigured) return null;
  const { data, error } = await _sb
    .from('configuracion')
    .select('valor')
    .eq('clave', clave)
    .maybeSingle();
  if (error || !data) return null;
  return data.valor;
}

async function saveConfig(clave, valor) {
  if (!_isConfigured) return { error: { message: 'Supabase no configurado' } };
  // Verificar que hay sesión activa antes de intentar escribir
  const { data: sessionData } = await _sb.auth.getSession();
  if (!sessionData?.session) {
    console.error('[AEMT] saveConfig: sin sesión autenticada');
    return { error: { message: 'Sin sesión activa — vuelve a iniciar sesión' } };
  }
  const { error } = await _sb
    .from('configuracion')
    .upsert({ clave, valor }, { onConflict: 'clave' });
  if (error) console.error('[AEMT] saveConfig error:', JSON.stringify(error));
  return { error };
}

// Init on load
window.addEventListener('DOMContentLoaded', initSupabase);
