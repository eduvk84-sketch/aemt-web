// ============================================================
// AEMT — js/admin.js
// Panel Directivo — CRUD completo con localStorage demo
// ============================================================
'use strict';

// ── DATA CACHE ────────────────────────────────────────────
// Loaded on each tab render. Used by onclick="editX('id')" handlers.
const _d = { events: [], abonados: [], ranking: [], news: [] };

// ── HELPERS ───────────────────────────────────────────────
function q(sel, ctx = document) { return ctx.querySelector(sel); }
function qq(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function toast(msg, dur = 4000) {
  const t = q('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), dur);
}
window.toast = toast;

function ccaaOpts(selected = '') {
  return `<option value="">Selecciona...</option>` +
    CCAA.map(c => `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`).join('');
}

// ── AUTH GUARD ────────────────────────────────────────────
async function checkAuth() {
  const isDemo = SUPABASE_URL.includes('TU_PROYECTO');
  if (isDemo) return;
  const session = await authGetSession();
  if (!session) window.location.href = 'login.html';
}

async function logout() {
  await authLogout();
  window.location.href = 'login.html';
}
window.logout = logout;

// ── MODAL ─────────────────────────────────────────────────
function openModal(html) {
  q('#mCt').innerHTML = html;
  q('#modal').classList.add('open');
}
function closeModal() { q('#modal').classList.remove('open'); }
window.closeModal = closeModal;

// ── NAV ───────────────────────────────────────────────────
function admTab(el, tab) {
  qq('.adm-nv a').forEach(a => a.classList.remove('act'));
  if (el) el.classList.add('act');
  renderTab(tab);
}
window.admTab = admTab;

// ── TABS ──────────────────────────────────────────────────
async function renderTab(tab) {
  const main = q('#admMain');
  main.innerHTML = '<div style="padding:3rem;text-align:center;color:var(--gr)"><div class="ldr-dots">Cargando...</div></div>';
  switch (tab) {
    case 'dash':  await renderDash();         break;
    case 'mbrs':  await renderMiembros();     break;
    case 'evts':  await renderEventos();      break;
    case 'rnk':   await renderRankingAdmin(); break;
    case 'news':  await renderNoticiasAdmin();break;
    case 'portada': renderPortada();           break;
    case 'fin':   renderFinanzas();           break;
    case 'sub':   renderSubvenciones();       break;
    case 'leg':   renderLegal();              break;
    case 'pagos': await renderPagos();        break;
    default:
      main.innerHTML = '<div style="padding:3rem;text-align:center"><div style="font-size:3rem;margin-bottom:1rem">🚧</div><div style="font-weight:700;color:var(--n)">Sección en desarrollo</div></div>';
  }
}

// ── DASHBOARD ─────────────────────────────────────────────
async function renderDash() {
  const [kpis, abonados] = await Promise.all([adminFetchKPIs(), adminFetchAbonados()]);
  _d.abonados = abonados;
  const all5 = abonados.slice(0, 5);

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Dashboard</h2><p>${new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p></div>
      <button class="btn-adm-gold" onclick="openNewMember()">+ Nuevo Abonado</button>
    </div>

    <div class="kpi-r">
      <div class="kpi"><div class="kpi-lb">Total Abonados</div><div class="kpi-vl">${kpis.total}</div><div class="kpi-tr tu">↑ Activos</div></div>
      <div class="kpi"><div class="kpi-lb">Pendientes</div><div class="kpi-vl">${kpis.pendientes}</div><div class="kpi-tr tg">Revisar solicitudes</div></div>
      <div class="kpi"><div class="kpi-lb">Ingresos Cuotas</div><div class="kpi-vl">${kpis.ingresos}</div><div class="kpi-tr tu">↑ YTD</div></div>
      <div class="kpi"><div class="kpi-lb">Próximo Evento</div><div class="kpi-vl" style="font-size:1.4rem;line-height:1.3">${kpis.evento_prox}</div><div class="kpi-tr tg">Temporada 2026</div></div>
    </div>

    <div class="a2c">
      <div class="acard">
        <div class="acard-hd">
          <div class="acard-ti">Últimas adhesiones</div>
          <a onclick="admTab(document.querySelector('[data-tab=mbrs]'),'mbrs')" style="font-size:.74rem;color:var(--g);cursor:pointer">Ver todos →</a>
        </div>
        <div class="acard-bd">
          ${all5.map(mb => {
            const ini = ((mb.nombre||'')+' '+(mb.apellidos||'')).trim().split(' ').map(x=>x[0]).slice(0,2).join('');
            return `<div class="mb-r">
              <div class="mb-av">${ini}</div>
              <div style="flex:1"><div class="mb-nm">${mb.nombre||''} ${mb.apellidos||''}</div><div class="mb-dt">${mb.plan||'Estándar'} · ${mb.comunidad_autonoma||'—'}</div></div>
              <span class="sp ${mb.estado==='activo'?'sp-a':'sp-p'}">${mb.estado==='activo'?'Activo':'Pendiente'}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="acard">
        <div class="acard-hd"><div class="acard-ti">Tareas urgentes</div></div>
        <div class="acard-bd">${TASKS.map(t=>`
          <div class="tk-it"><span class="tk-ug ${t.c}">${t.u}</span><span class="tk-tx">${t.t}</span></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="acard">
      <div class="acard-hd"><div class="acard-ti">Estado de documentación legal</div></div>
      <div class="acard-bd">
        <div class="doc-grid">${DOCS.map(d=>`
          <div class="doc-item" style="background:${d.bg}">
            <div class="doc-title">${d.d}</div>
            <div class="doc-status ${d.cls}">${d.s}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- AVISO PERSISTENCIA -->
    <div style="margin-top:1rem;padding:.85rem 1.1rem;background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:12px;border:1px solid #fcd34d;display:flex;align-items:flex-start;gap:.8rem">
      <div style="font-size:1.4rem;flex-shrink:0">💾</div>
      <div style="flex:1">
        <div style="font-size:.78rem;font-weight:800;color:#92400e;margin-bottom:.2rem">Almacenamiento local (modo demo)</div>
        <div style="font-size:.73rem;color:#92400e;line-height:1.5">Todos los cambios se guardan en <strong>este navegador</strong>. Si limpias los datos del navegador o abres en otro dispositivo, se pierden. Usa los botones de abajo para hacer copias de seguridad.</div>
        <div style="display:flex;gap:.5rem;margin-top:.6rem;flex-wrap:wrap">
          <button class="btn-adm-sm ghost" style="font-size:.7rem" onclick="exportarBackup()">📤 Exportar backup</button>
          <button class="btn-adm-sm ghost" style="font-size:.7rem" onclick="document.querySelector('#backup-import-input').click()">📥 Importar backup</button>
          <input type="file" id="backup-import-input" accept=".json" style="display:none" onchange="importarBackup(this)">
        </div>
      </div>
    </div>`;
}

// ── BACKUP / EXPORT ───────────────────────────────────────
function exportarBackup() {
  const allKeys = ['aemt_events','aemt_ranking','aemt_news','aemt_abonados',
                   'aemt_finanzas','aemt_subvenciones','aemt_portada','aemt_puntos_config','aemt_subv_checks'];
  const backup = {};
  allKeys.forEach(k => {
    const v = localStorage.getItem(k);
    if (v) backup[k] = JSON.parse(v);
  });
  backup._exported = new Date().toISOString();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `aemt_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('📤 Backup exportado correctamente');
}
window.exportarBackup = exportarBackup;

function importarBackup(input) {
  const file = input.files[0];
  if (!file) return;
  if (!confirm('¿Importar backup? Esto sobreescribirá TODOS los datos actuales.')) { input.value=''; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Object.entries(data).forEach(([k, v]) => {
        if (k.startsWith('aemt_')) localStorage.setItem(k, JSON.stringify(v));
      });
      toast('✅ Backup importado. Recarga la página para ver los datos.');
      input.value = '';
      setTimeout(() => location.reload(), 1500);
    } catch { toast('❌ Archivo de backup inválido'); }
  };
  reader.readAsText(file);
}
window.importarBackup = importarBackup;

// ── MEMBERS ───────────────────────────────────────────────
async function renderMiembros() {
  const data = await adminFetchAbonados();
  _d.abonados = data;

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Abonados</h2><p>${data.length} registros · ${data.filter(d=>d.estado==='pendiente').length} pendientes</p></div>
      <button class="btn-adm-gold" onclick="openNewMember()">+ Nuevo Abonado</button>
    </div>
    <div class="acard">
      <div class="acard-hd">
        <div class="acard-ti">Lista de Abonados</div>
        <input class="tbl-search" type="text" placeholder="Buscar..." oninput="filterMbrs(this.value)">
      </div>
      <div style="overflow-x:auto">
        <table class="data-table" id="mbTbl">
          <thead><tr><th>Abonado</th><th>Club / Org.</th><th>Plan</th><th>CCAA</th><th>Grado</th><th>Estado</th><th>Fecha solicitud</th><th>Acciones</th></tr></thead>
          <tbody>
            ${data.map(mb => {
              const ini = ((mb.nombre||'').charAt(0) + (mb.apellidos||'').charAt(0)).toUpperCase();
              const stCls = mb.estado==='activo'?'sp-a':mb.estado==='pendiente'?'sp-p':'sp-i';
              const stLbl = mb.estado==='activo'?'Activo':mb.estado==='pendiente'?'Pendiente':'Inactivo';
              const fecha = mb.fecha_solicitud ? new Date(mb.fecha_solicitud).toLocaleDateString('es-ES') : '—';
              return `<tr data-id="${mb.id||''}">
                <td><div class="ath-cl">
                  <div class="mb-av">${ini}</div>
                  <div><div class="mb-nm">${mb.nombre||''} ${mb.apellidos||''}</div><div class="mb-dt">${mb.email||''}</div></div>
                </div></td>
                <td style="font-size:.78rem;color:var(--gr)">${mb.club||'—'}</td>
                <td style="font-size:.8rem;color:var(--gr)">${mb.plan||'Estándar'}</td>
                <td style="font-size:.8rem;color:var(--gr)">${mb.comunidad_autonoma||'—'}</td>
                <td style="font-size:.8rem;color:var(--gr)">${mb.cinturon||'—'}</td>
                <td><span class="sp ${stCls}">${stLbl}</span></td>
                <td style="font-size:.78rem;color:var(--gr)">${fecha}</td>
                <td style="display:flex;gap:.38rem;flex-wrap:wrap">
                  <button class="btn-adm-sm primary" onclick="editMember('${mb.id}')">Editar</button>
                  ${mb.estado==='pendiente'?`<button class="btn-adm-sm success" onclick="approveM('${mb.id}')">Aprobar</button>`:''}
                  <button class="btn-adm-sm danger" onclick="deleteAbonado('${mb.id}')">Borrar</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

window.filterMbrs = function(v) {
  qq('#mbTbl tbody tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(v.toLowerCase()) ? '' : 'none';
  });
};

async function approveM(id) {
  const { error } = await adminUpdateAbonado(id, { estado: 'activo' });
  if (error) toast('❌ Error al aprobar');
  else { toast('✅ Abonado aprobado'); renderMiembros(); }
}
window.approveM = approveM;

async function deleteAbonado(id) {
  const mb = _d.abonados.find(a => String(a.id) === String(id));
  const nm = mb ? `${mb.nombre} ${mb.apellidos||''}`.trim() : id;
  if (!confirm(`¿Eliminar abonado "${nm}"? Esta acción no se puede deshacer.`)) return;
  const { error } = await adminDeleteAbonado(id);
  if (error) toast('❌ Error al eliminar');
  else { toast('✅ Abonado eliminado'); renderMiembros(); }
}
window.deleteAbonado = deleteAbonado;

function openNewMember() {
  openModal(`
    <div class="m-ti">Nuevo Abonado</div>
    <div class="m-sb">Registro manual desde el Panel Directivo</div>
    <div class="fr">
      <div class="fg"><label>Nombre</label><input type="text" id="nm-n" placeholder="Nombre"></div>
      <div class="fg"><label>Apellidos</label><input type="text" id="nm-ap" placeholder="Apellidos"></div>
    </div>
    <div class="fg"><label>Email</label><input type="email" id="nm-em" placeholder="correo@email.com"></div>
    <div class="fr">
      <div class="fg"><label>Teléfono</label><input type="tel" id="nm-tel" placeholder="+34 600 000 000"></div>
      <div class="fg"><label>CCAA</label><select id="nm-ccaa">${ccaaOpts()}</select></div>
    </div>
    <div class="fg"><label>Club / Asociación / Organización</label><input type="text" id="nm-cl" placeholder="Ej: Club Kyoto Vallecas"></div>
    <div class="fr">
      <div class="fg"><label>Nacionalidad</label><input type="text" id="nm-nac" placeholder="Ej: Española" value="Española"></div>
      <div class="fg"><label>Federación</label><input type="text" id="nm-fed" placeholder="Ej: RFTKD" value="RFTKD"></div>
    </div>
    <div class="fr">
      <div class="fg"><label>Plan</label><select id="nm-plan">
        <option value="estandar">Estándar — 60€/año</option>
        <option value="joven">Joven — 60€/año</option>
        <option value="colaborador">Colaborador — 60€/año</option>
      </select></div>
      <div class="fg"><label>Grado (Dan)</label><input type="text" id="nm-gr" placeholder="Ej: 3.º Dan"></div>
    </div>
    <div class="fg"><label>Notas</label><textarea id="nm-no" placeholder="Observaciones..." style="height:60px"></textarea></div>
    <button class="m-fsb" onclick="saveNewMember()">Registrar Abonado</button>
  `);
}
window.openNewMember = openNewMember;

async function saveNewMember() {
  const data = {
    nombre:             q('#nm-n').value.trim(),
    apellidos:          q('#nm-ap').value.trim(),
    email:              q('#nm-em').value.trim(),
    telefono:           q('#nm-tel').value.trim(),
    comunidad_autonoma: q('#nm-ccaa').value,
    club:               q('#nm-cl').value.trim(),
    nacionalidad:       q('#nm-nac').value.trim(),
    federacion:         q('#nm-fed').value.trim(),
    plan:               q('#nm-plan').value,
    cinturon:           q('#nm-gr').value.trim() || null,
    notas:              q('#nm-no').value.trim(),
    estado:             'activo',
    fecha_solicitud:    new Date().toISOString(),
  };
  if (!data.nombre || !data.email) { toast('⚠️ Nombre y email son obligatorios'); return; }
  const { error } = await adminInsertAbonado(data);
  closeModal();
  if (error) toast('❌ Error al registrar: ' + (error.message||''));
  else { toast('✅ Abonado registrado'); renderMiembros(); }
}
window.saveNewMember = saveNewMember;

function editMember(id) {
  const mb = _d.abonados.find(a => String(a.id) === String(id));
  if (!mb) { toast('⚠️ Abonado no encontrado'); return; }
  openModal(`
    <div class="m-ti">Editar Abonado</div>
    <div class="m-sb">${mb.nombre} ${mb.apellidos||''}</div>
    <div class="fr">
      <div class="fg"><label>Nombre</label><input type="text" id="em-n" value="${mb.nombre||''}"></div>
      <div class="fg"><label>Apellidos</label><input type="text" id="em-ap" value="${mb.apellidos||''}"></div>
    </div>
    <div class="fg"><label>Email</label><input type="email" id="em-em" value="${mb.email||''}"></div>
    <div class="fr">
      <div class="fg"><label>Teléfono</label><input type="tel" id="em-tel" value="${mb.telefono||''}"></div>
      <div class="fg"><label>CCAA</label><select id="em-ccaa">${ccaaOpts(mb.comunidad_autonoma)}</select></div>
    </div>
    <div class="fg"><label>Club / Asociación / Organización</label><input type="text" id="em-cl" value="${mb.club||''}"></div>
    <div class="fr">
      <div class="fg"><label>Nacionalidad</label><input type="text" id="em-nac" value="${mb.nacionalidad||'Española'}"></div>
      <div class="fg"><label>Federación</label><input type="text" id="em-fed" value="${mb.federacion||'RFTKD'}"></div>
    </div>
    <div class="fr">
      <div class="fg"><label>Plan</label><select id="em-plan">
        <option value="estandar" ${mb.plan==='estandar'?'selected':''}>Estándar — 60€/año</option>
        <option value="joven" ${mb.plan==='joven'?'selected':''}>Joven — 60€/año</option>
        <option value="colaborador" ${mb.plan==='colaborador'?'selected':''}>Colaborador — 60€/año</option>
      </select></div>
      <div class="fg"><label>Grado (Dan)</label><input type="text" id="em-gr" value="${mb.cinturon||''}"></div>
    </div>
    <div class="fg"><label>Estado</label><select id="em-st">
      <option value="activo" ${mb.estado==='activo'?'selected':''}>Activo</option>
      <option value="pendiente" ${mb.estado==='pendiente'?'selected':''}>Pendiente</option>
      <option value="inactivo" ${mb.estado==='inactivo'?'selected':''}>Inactivo</option>
    </select></div>
    <div class="fg"><label>Notas</label><textarea id="em-no" style="height:60px">${mb.notas||''}</textarea></div>
    <button class="m-fsb" onclick="saveMember('${mb.id}')">Guardar Cambios</button>
  `);
}
window.editMember = editMember;

async function saveMember(id) {
  const updates = {
    nombre:             q('#em-n').value.trim(),
    apellidos:          q('#em-ap').value.trim(),
    email:              q('#em-em').value.trim(),
    telefono:           q('#em-tel').value.trim(),
    comunidad_autonoma: q('#em-ccaa').value,
    club:               q('#em-cl').value.trim(),
    nacionalidad:       q('#em-nac').value.trim(),
    federacion:         q('#em-fed').value.trim(),
    plan:               q('#em-plan').value,
    cinturon:           q('#em-gr').value.trim() || null,
    estado:             q('#em-st').value,
    notas:              q('#em-no').value.trim(),
  };
  if (!updates.nombre || !updates.email) { toast('⚠️ Nombre y email son obligatorios'); return; }
  const { error } = await adminUpdateAbonado(id, updates);
  closeModal();
  if (error) toast('❌ Error al guardar');
  else { toast('✅ Abonado actualizado'); renderMiembros(); }
}
window.saveMember = saveMember;

// ── EVENTS ADMIN ──────────────────────────────────────────
async function renderEventos() {
  const events = await adminFetchEventos();
  _d.events = events;

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Eventos</h2><p>${events.length} eventos programados</p></div>
      <button class="btn-adm-gold" onclick="openNewEvent()">+ Nuevo Evento</button>
    </div>
    <div class="acard">
      <div class="acard-hd"><div class="acard-ti">Calendario 2026</div></div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Fecha</th><th>Evento</th><th>Lugar</th><th>Tipo</th><th>Plazas</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${events.map(e => {
            const fecha = e.fecha ? new Date(e.fecha).toLocaleDateString('es-ES') : '—';
            const pct = e.plazas_total ? Math.round((e.plazas_ocupadas/e.plazas_total)*100) : 0;
            const nIns = (e.inscritos||[]).length;
            return `<tr>
              <td style="font-size:.82rem;font-weight:700;color:var(--n)">${fecha}</td>
              <td>
                <div style="font-weight:700;font-size:.84rem;color:var(--n)">${e.titulo}</div>
                ${e.destacado?'<span style="font-size:.6rem;color:var(--g);font-weight:700">★ DESTACADO</span>':''}
                ${e.url_web?`<a href="${e.url_web}" target="_blank" style="font-size:.68rem;color:var(--g);display:block;margin-top:.15rem;text-decoration:none;overflow:hidden;text-overflow:ellipsis;max-width:200px;white-space:nowrap">🔗 ${e.url_web}</a>`:''}
                ${e.categorias?`<div style="font-size:.66rem;color:var(--gr);margin-top:.1rem">${e.categorias}</div>`:''}
              </td>
              <td style="font-size:.78rem;color:var(--gr)">${e.lugar||'—'}</td>
              <td style="font-size:.78rem;color:var(--gr);text-transform:capitalize">${e.tipo||'—'}</td>
              <td>
                <div style="font-size:.8rem;color:var(--n);font-weight:700">${e.plazas_ocupadas||0}/${e.plazas_total||0}</div>
                <div style="width:80px;height:3px;background:var(--gl2);border-radius:2px;margin-top:3px">
                  <div style="height:100%;width:${pct}%;background:var(--g);border-radius:2px"></div>
                </div>
                <button class="btn-adm-sm ghost" style="margin-top:.4rem;font-size:.66rem" onclick="openInscritos('${e.id}')">
                  👥 ${nIns} inscritos
                </button>
              </td>
              <td><span class="sp ${e.inscripciones_abiertas?'sp-a':'sp-i'}">${e.inscripciones_abiertas?'Abiertas':'Cerradas'}</span></td>
              <td style="display:flex;gap:.38rem;flex-wrap:wrap">
                <button class="btn-adm-sm ghost" onclick="editEvent('${e.id}')">Editar</button>
                <button class="btn-adm-sm danger" onclick="deleteEvent('${e.id}')">Borrar</button>
                ${e.circular_pdf ? `<a href="${e.circular_pdf.url}" download="${e.circular_pdf.name}" class="btn-adm-sm ghost" style="text-decoration:none" title="${e.circular_pdf.name}">📄 PDF</a>` : ''}
              </td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function eventFormHtml(e = {}) {
  const tipos = ['campeonato','expedicion','seminario','social'];
  return `
    <div class="m-ti">${e.id ? 'Editar Evento' : 'Nuevo Evento'}</div>
    <div class="fg"><label>Título</label><input type="text" id="ev-ti" value="${(e.titulo||'').replace(/"/g,'&quot;')}" placeholder="Nombre del evento"></div>
    <div class="fg"><label>Lugar</label><input type="text" id="ev-lu" value="${(e.lugar||'').replace(/"/g,'&quot;')}" placeholder="Ciudad, instalación..."></div>
    <div class="fr">
      <div class="fg"><label>Fecha</label><input type="date" id="ev-fc" value="${e.fecha||''}"></div>
      <div class="fg"><label>Tipo</label><select id="ev-tp">
        ${tipos.map(t=>`<option value="${t}" ${e.tipo===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
      </select></div>
    </div>
    <div class="fr">
      <div class="fg"><label>URL web del evento</label><input type="url" id="ev-url" value="${e.url_web||''}" placeholder="https://..."></div>
      <div class="fg"><label>Precio inscripción</label><input type="text" id="ev-pr" value="${e.precio||''}" placeholder="Ej: 25€"></div>
    </div>
    <div class="fg"><label>Categorías participantes</label><input type="text" id="ev-cat" value="${(e.categorias||'').replace(/"/g,'&quot;')}" placeholder="Ej: M35, M40, M45, M50"></div>
    <div class="fg"><label>Descripción del evento</label><textarea id="ev-desc" placeholder="Descripción pública..." style="height:70px">${e.descripcion||''}</textarea></div>
    <div class="fg"><label>Circular para inscritos (texto)</label><textarea id="ev-circ" placeholder="Texto de la comunicación que se enviará a los inscritos..." style="height:80px">${e.circular||''}</textarea></div>
    <div class="fg"><label>Circular / documentación PDF</label>
      <div style="display:flex;align-items:center;gap:.7rem;flex-wrap:wrap">
        ${e.circular_pdf
          ? `<a href="${e.circular_pdf.url}" download="${e.circular_pdf.name}" style="font-size:.8rem;color:var(--g);text-decoration:none">📄 ${e.circular_pdf.name}</a>
             <button type="button" onclick="quitarCircularPdf()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:.78rem" title="Quitar">🗑️ Quitar</button>`
          : `<button type="button" id="btn-pdf-circ" onclick="adjuntarCircularPdf()" style="background:none;border:1px solid var(--gl2);cursor:pointer;font-size:.78rem;color:var(--gr);padding:.3rem .7rem;border-radius:6px">📎 Adjuntar PDF</button>
             <span id="pdf-circ-name" style="font-size:.76rem;color:var(--gr)"></span>`
        }
      </div>
    </div>
    <div class="fr">
      <div class="fg"><label>Plazas total</label><input type="number" id="ev-pt" value="${e.plazas_total||100}" min="1"></div>
      <div class="fg"><label>Plazas ocupadas</label><input type="number" id="ev-po" value="${e.plazas_ocupadas||0}" min="0"></div>
    </div>
    <div style="display:flex;gap:1.5rem;margin-bottom:.9rem">
      <label style="display:flex;gap:.5rem;align-items:center;font-size:.82rem;color:var(--n)">
        <input type="checkbox" id="ev-ins" ${e.inscripciones_abiertas?'checked':''} style="accent-color:var(--n)"> Inscripciones abiertas
      </label>
      <label style="display:flex;gap:.5rem;align-items:center;font-size:.82rem;color:var(--n)">
        <input type="checkbox" id="ev-des" ${e.destacado?'checked':''} style="accent-color:var(--n)"> Destacado en portada
      </label>
    </div>
    <button class="m-fsb" onclick="saveEvent('${e.id||''}')">Guardar Evento</button>
  `;
}

let _circularPdfTemp = null; // temporal while form is open

function adjuntarCircularPdf() {
  pickFile('.pdf', archivo => {
    _circularPdfTemp = archivo;
    const nameEl = document.getElementById('pdf-circ-name');
    if (nameEl) nameEl.textContent = '📄 ' + archivo.name;
    const btn = document.getElementById('btn-pdf-circ');
    if (btn) btn.textContent = '🔄 Cambiar';
  });
}
window.adjuntarCircularPdf = adjuntarCircularPdf;

function quitarCircularPdf() {
  _circularPdfTemp = null;
  // Re-render the PDF block inside the open modal without closing it
  const wrap = document.querySelector('#btn-pdf-circ')?.closest('div');
  if (wrap) wrap.innerHTML = `<button type="button" id="btn-pdf-circ" onclick="adjuntarCircularPdf()" style="background:none;border:1px solid var(--gl2);cursor:pointer;font-size:.78rem;color:var(--gr);padding:.3rem .7rem;border-radius:6px">📎 Adjuntar PDF</button>
    <span id="pdf-circ-name" style="font-size:.76rem;color:var(--gr)"></span>`;
}
window.quitarCircularPdf = quitarCircularPdf;

function openNewEvent() { _circularPdfTemp = null; openModal(eventFormHtml()); }
window.openNewEvent = openNewEvent;

function editEvent(id) {
  const e = _d.events.find(ev => String(ev.id) === String(id));
  if (!e) { toast('⚠️ Evento no encontrado'); return; }
  _circularPdfTemp = null;
  openModal(eventFormHtml(e));
}
window.editEvent = editEvent;

async function saveEvent(id) {
  // preserve existing inscritos array when editing
  const existing = id ? (_d.events.find(ev => String(ev.id) === String(id)) || {}) : {};
  const evento = {
    titulo:                  q('#ev-ti').value.trim(),
    lugar:                   q('#ev-lu').value.trim(),
    fecha:                   q('#ev-fc').value,
    tipo:                    q('#ev-tp').value,
    url_web:                 q('#ev-url').value.trim(),
    precio:                  q('#ev-pr').value.trim(),
    categorias:              q('#ev-cat').value.trim(),
    descripcion:             q('#ev-desc').value.trim(),
    circular:                q('#ev-circ').value.trim(),
    circular_pdf:            _circularPdfTemp !== null ? _circularPdfTemp : (existing.circular_pdf || null),
    plazas_total:            parseInt(q('#ev-pt').value) || 0,
    plazas_ocupadas:         parseInt(q('#ev-po').value) || 0,
    inscripciones_abiertas:  q('#ev-ins').checked,
    destacado:               q('#ev-des').checked,
    inscritos:               existing.inscritos || [],
  };
  if (!evento.titulo) { toast('⚠️ El título es obligatorio'); return; }
  if (!evento.fecha)  { toast('⚠️ La fecha es obligatoria');  return; }
  if (id) evento.id = id;
  const { error } = await adminUpsertEvento(evento);
  closeModal();
  if (error) toast('❌ Error al guardar');
  else { toast('✅ Evento guardado'); renderEventos(); }
}
window.saveEvent = saveEvent;

async function deleteEvent(id) {
  const e = _d.events.find(ev => String(ev.id) === String(id));
  if (!confirm(`¿Eliminar "${e ? e.titulo : id}"?`)) return;
  const { error } = await adminDeleteEvento(id);
  if (error) toast('❌ Error al eliminar');
  else { toast('✅ Evento eliminado'); renderEventos(); }
}
window.deleteEvent = deleteEvent;

// ── INSCRITOS MANAGER ─────────────────────────────────────
function openInscritos(id) {
  const e = _d.events.find(ev => String(ev.id) === String(id));
  if (!e) { toast('⚠️ Evento no encontrado'); return; }
  renderInscritosModal(e);
}
window.openInscritos = openInscritos;

function renderInscritosModal(e) {
  const ins = e.inscritos || [];
  openModal(`
    <div class="m-ti">Inscritos</div>
    <div class="m-sb" style="margin-bottom:.8rem">${e.titulo} · ${ins.length} personas inscritas</div>

    ${ins.length ? `
    <div style="overflow-x:auto;margin-bottom:1.2rem">
      <table class="data-table" style="font-size:.78rem">
        <thead><tr><th>Nombre</th><th>Email</th><th>Club</th><th>Categoría</th><th>Fecha</th><th></th></tr></thead>
        <tbody>
          ${ins.map((p, i) => `<tr>
            <td style="font-weight:700;color:var(--n)">${p.nombre||'—'}</td>
            <td style="color:var(--gr)">${p.email||'—'}</td>
            <td style="color:var(--gr)">${p.club||'—'}</td>
            <td><span class="cat-b">${p.categoria||'—'}</span></td>
            <td style="color:var(--gr)">${p.fecha||'—'}</td>
            <td><button class="btn-adm-sm danger" style="padding:.18rem .5rem;font-size:.66rem" onclick="removeInscrito('${e.id}',${i})">✕</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `<div style="text-align:center;color:var(--gr);padding:1rem;font-size:.84rem">Sin inscritos todavía</div>`}

    ${e.circular ? `
    <div style="background:var(--of);border:1px solid var(--bd);border-radius:10px;padding:1rem;margin-bottom:1.2rem">
      <div style="font-size:.66rem;font-weight:700;color:var(--gr);letter-spacing:.8px;text-transform:uppercase;margin-bottom:.4rem">Circular para inscritos</div>
      <div style="font-size:.8rem;color:var(--n);white-space:pre-line;max-height:100px;overflow-y:auto">${e.circular}</div>
    </div>` : ''}

    <div style="border-top:1px solid var(--bd);padding-top:1rem;margin-top:.5rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--n);letter-spacing:.8px;text-transform:uppercase;margin-bottom:.7rem">Añadir inscrito</div>
      <div class="fr">
        <div class="fg" style="margin-bottom:.5rem"><label>Nombre completo</label><input type="text" id="ins-nm" placeholder="Nombre y apellidos"></div>
        <div class="fg" style="margin-bottom:.5rem"><label>Email</label><input type="email" id="ins-em" placeholder="correo@email.com"></div>
      </div>
      <div class="fr">
        <div class="fg" style="margin-bottom:.5rem"><label>Club / Organización</label><input type="text" id="ins-cl" placeholder="Club deportivo"></div>
        <div class="fg" style="margin-bottom:.5rem"><label>Categoría</label><input type="text" id="ins-cat" placeholder="Ej: M40"></div>
      </div>
    </div>
    <button class="m-fsb" onclick="addInscrito('${e.id}')">+ Añadir Inscrito</button>
  `);
}

async function addInscrito(eventId) {
  const nombre    = q('#ins-nm').value.trim();
  const email     = q('#ins-em').value.trim();
  const club      = q('#ins-cl').value.trim();
  const categoria = q('#ins-cat').value.trim();
  if (!nombre) { toast('⚠️ El nombre es obligatorio'); return; }

  const e = _d.events.find(ev => String(ev.id) === String(eventId));
  if (!e) return;
  const ins = [...(e.inscritos || []), {
    nombre, email, club, categoria,
    fecha: new Date().toLocaleDateString('es-ES'),
  }];
  const updated = { ...e, inscritos: ins, plazas_ocupadas: Math.max(e.plazas_ocupadas||0, ins.length) };
  const { error } = await adminUpsertEvento(updated);
  if (error) { toast('❌ Error al guardar'); return; }
  // refresh cache and reopen modal
  const events = await adminFetchEventos();
  _d.events = events;
  const fresh = events.find(ev => String(ev.id) === String(eventId));
  if (fresh) renderInscritosModal(fresh);
  toast('✅ Inscrito añadido');
}
window.addInscrito = addInscrito;

async function removeInscrito(eventId, idx) {
  const e = _d.events.find(ev => String(ev.id) === String(eventId));
  if (!e) return;
  const ins = (e.inscritos || []).filter((_, i) => i !== idx);
  const updated = { ...e, inscritos: ins };
  const { error } = await adminUpsertEvento(updated);
  if (error) { toast('❌ Error al eliminar'); return; }
  const events = await adminFetchEventos();
  _d.events = events;
  const fresh = events.find(ev => String(ev.id) === String(eventId));
  if (fresh) renderInscritosModal(fresh);
  toast('✅ Inscrito eliminado');
}
window.removeInscrito = removeInscrito;

// ── PUNTOS CONFIG ─────────────────────────────────────────
const LS_PUNTOS = 'aemt_puntos_config';

const DEFAULT_PUNTOS = {
  posiciones: [
    { pos:1, emoji:'🥇', label:'1.º Puesto — Oro',              puntos:500 },
    { pos:2, emoji:'🥈', label:'2.º Puesto — Plata',            puntos:350 },
    { pos:3, emoji:'🥉', label:'3.º Puesto — Bronce',           puntos:250 },
    { pos:4, emoji:'4️⃣', label:'4.º Puesto',                    puntos:150 },
    { pos:5, emoji:'5️⃣', label:'5.º - 8.º Puesto',             puntos:80  },
    { pos:0, emoji:'🎽', label:'Participación (sin medalla)',    puntos:30  },
  ],
  multiplicadores: [
    { tipo:'campeonato', label:'Campeonato AEMT Nacional',            x:1.0 },
    { tipo:'liga',       label:'Liga AEMT',                           x:0.8 },
    { tipo:'expedicion', label:'Expedición / Torneo Internacional',   x:1.5 },
    { tipo:'seminario',  label:'Seminario / Campus técnico',          x:0.3 },
    { tipo:'social',     label:'Evento Social / Gala',                x:0.2 },
  ],
  bonus: [
    { id:'triple_oro',  emoji:'⭐', label:'Triple Oro en una temporada',              puntos:200 },
    { id:'asistencia',  emoji:'📅', label:'Asistencia perfecta (todos los eventos)',  puntos:150 },
    { id:'mas5',        emoji:'🏅', label:'Deportista del año (≥ 5 eventos)',         puntos:100 },
    { id:'fair_play',   emoji:'🤝', label:'Premio Fair Play AEMT (por evento)',       puntos:50  },
    { id:'debut',       emoji:'🆕', label:'Debut AEMT (primer evento oficial)',       puntos:25  },
  ],
  penalizaciones: [
    { id:'no_show',   emoji:'🚫', label:'No presentación sin justificación previa', puntos:-50 },
    { id:'descalif',  emoji:'🟥', label:'Descalificación por árbitro',              puntos:-30 },
    { id:'abandono',  emoji:'⚠️', label:'Abandono injustificado de competición',    puntos:-20 },
  ],
  categorias_edad: [
    { id:'M35', label:'M+35', sexo:'M', edad_min:35 },
    { id:'M40', label:'M+40', sexo:'M', edad_min:40 },
    { id:'M45', label:'M+45', sexo:'M', edad_min:45 },
    { id:'M50', label:'M+50', sexo:'M', edad_min:50 },
    { id:'M55', label:'M+55', sexo:'M', edad_min:55 },
    { id:'M60', label:'M+60', sexo:'M', edad_min:60 },
    { id:'F35', label:'F+35', sexo:'F', edad_min:35 },
    { id:'F40', label:'F+40', sexo:'F', edad_min:40 },
    { id:'F45', label:'F+45', sexo:'F', edad_min:45 },
    { id:'F50', label:'F+50', sexo:'F', edad_min:50 },
    { id:'F55', label:'F+55', sexo:'F', edad_min:55 },
    { id:'F60', label:'F+60', sexo:'F', edad_min:60 },
  ],
  niveles: [
    { id:'competitivo',  label:'Competitivo',  descripcion:'Compite por medallas y puntos de ranking' },
    { id:'recreativo',   label:'Recreativo',   descripcion:'Participación, sin puntos de ranking' },
  ],
};

function loadPuntosConfig() {
  try {
    const raw = localStorage.getItem(LS_PUNTOS);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_PUNTOS));
  } catch { return JSON.parse(JSON.stringify(DEFAULT_PUNTOS)); }
}

function savePuntosConfig() {
  const cfg = loadPuntosConfig();
  cfg.posiciones.forEach(     (p, i) => { p.puntos = parseInt(q(`#pt-pos-${i}`)?.value)   || 0; });
  cfg.multiplicadores.forEach((m, i) => { m.x      = parseFloat(q(`#pt-mul-${i}`)?.value) || 0; });
  cfg.bonus.forEach(          (b, i) => { b.puntos = parseInt(q(`#pt-bon-${i}`)?.value)   || 0; });
  cfg.penalizaciones.forEach( (p, i) => { p.puntos = parseInt(q(`#pt-pen-${i}`)?.value)   || 0; });
  localStorage.setItem(LS_PUNTOS, JSON.stringify(cfg));
  toast('✅ Configuración de puntos guardada');
  calcPuntos(); // refresh calculator
}
window.savePuntosConfig = savePuntosConfig;

function resetPuntosConfig() {
  if (!confirm('¿Restaurar configuración de puntos por defecto?')) return;
  localStorage.removeItem(LS_PUNTOS);
  renderRankingAdmin();
  toast('✅ Puntos restaurados al sistema por defecto');
}
window.resetPuntosConfig = resetPuntosConfig;

function calcPuntos() {
  const cfg = loadPuntosConfig();
  const pi = parseInt(q('#calc-pos')?.value);
  const mi = parseInt(q('#calc-mul')?.value);
  const base = cfg.posiciones[pi]?.puntos || 0;
  const mul  = cfg.multiplicadores[mi]?.x  || 1;
  const result = Math.round(base * mul);
  const el = q('#calc-result');
  if (el) el.innerHTML = `<span style="font-size:2rem;font-weight:800;color:var(--n)">${result}</span> <span style="font-size:.9rem;color:var(--gr)">puntos</span>`;
}
window.calcPuntos = calcPuntos;

// ── FILTROS RANKING ───────────────────────────────────────
function saveFiltrosRanking() {
  const cfg = loadPuntosConfig();
  // Read categorias
  const cats = [];
  let i = 0;
  while (document.querySelector(`#fc-id-${i}`) !== null) {
    const id  = document.querySelector(`#fc-id-${i}`).value.trim();
    const lb  = document.querySelector(`#fc-lb-${i}`).value.trim();
    const sx  = document.querySelector(`#fc-sx-${i}`).value;
    if (id && lb) cats.push({ id, label: lb, sexo: sx });
    i++;
  }
  // Read niveles
  const niveles = [];
  let j = 0;
  while (document.querySelector(`#fn-id-${j}`) !== null) {
    const id  = document.querySelector(`#fn-id-${j}`).value.trim();
    const lb  = document.querySelector(`#fn-lb-${j}`).value.trim();
    if (id && lb) niveles.push({ id, label: lb });
    j++;
  }
  cfg.categorias_edad = cats;
  cfg.niveles = niveles;
  localStorage.setItem(LS_PUNTOS, JSON.stringify(cfg));
  toast('✅ Categorías y niveles guardados');
  renderRankingAdmin();
}
window.saveFiltrosRanking = saveFiltrosRanking;

function addCategoriaEdad() {
  const cfg = loadPuntosConfig();
  cfg.categorias_edad = cfg.categorias_edad || [];
  cfg.categorias_edad.push({ id:'', label:'', sexo:'M' });
  localStorage.setItem(LS_PUNTOS, JSON.stringify(cfg));
  renderRankingAdmin();
}
window.addCategoriaEdad = addCategoriaEdad;

function removeCategoriaEdad(idx) {
  const cfg = loadPuntosConfig();
  cfg.categorias_edad.splice(idx, 1);
  localStorage.setItem(LS_PUNTOS, JSON.stringify(cfg));
  renderRankingAdmin();
}
window.removeCategoriaEdad = removeCategoriaEdad;

function addNivelRanking() {
  const cfg = loadPuntosConfig();
  cfg.niveles = cfg.niveles || [];
  cfg.niveles.push({ id:'', label:'' });
  localStorage.setItem(LS_PUNTOS, JSON.stringify(cfg));
  renderRankingAdmin();
}
window.addNivelRanking = addNivelRanking;

function removeNivelRanking(idx) {
  const cfg = loadPuntosConfig();
  cfg.niveles.splice(idx, 1);
  localStorage.setItem(LS_PUNTOS, JSON.stringify(cfg));
  renderRankingAdmin();
}
window.removeNivelRanking = removeNivelRanking;

// ── RANKING ADMIN ─────────────────────────────────────────
async function renderRankingAdmin() {
  const data = await adminFetchRanking();
  _d.ranking = data;
  const cfg = loadPuntosConfig();

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Ranking AEMT</h2><p>Temporada 2026 · ${data.length} deportistas</p></div>
      <button class="btn-adm-gold" onclick="openNewRanking()">+ Añadir Deportista</button>
    </div>

    <div class="acard">
      <div class="acard-hd"><div class="acard-ti">Clasificación Temporada 2026</div></div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Pos.</th><th>Deportista</th><th>Club</th><th>Cat.</th><th>Sexo</th><th>Nivel</th><th>CCAA</th><th style="text-align:center">Ev.</th><th>Puntos</th><th>Acciones</th></tr></thead>
          <tbody>${data.map(r => {
            const sexoIcon = r.sexo === 'F' ? '♀️' : '♂️';
            const nivelBg  = r.nivel === 'recreativo' ? 'background:#f0f9ff;color:#0369a1' : 'background:#fef9ec;color:#92400e';
            return `<tr>
            <td style="font-weight:700;color:var(--n)">${r.posicion}</td>
            <td style="font-weight:700;font-size:.84rem;color:var(--n)">${r.nombre}</td>
            <td style="font-size:.78rem;color:var(--gr)">${r.club}</td>
            <td><span class="cat-b">${r.categoria}</span></td>
            <td style="text-align:center;font-size:1rem">${sexoIcon}</td>
            <td><span style="font-size:.7rem;font-weight:700;padding:.18rem .48rem;border-radius:5px;${nivelBg}">${r.nivel||'—'}</span></td>
            <td style="font-size:.78rem;color:var(--gr)">${r.comunidad}</td>
            <td style="text-align:center;font-size:.82rem">${r.eventos}</td>
            <td style="font-weight:700;color:var(--n)">${r.puntos} pts</td>
            <td style="display:flex;gap:.38rem">
              <button class="btn-adm-sm ghost" onclick="editRanking('${r.id||r.posicion}')">Editar</button>
              <button class="btn-adm-sm danger" onclick="deleteRanking('${r.id||r.posicion}')">Borrar</button>
            </td>
          </tr>`;}).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ PANEL FILTROS Y CATEGORÍAS ══ -->
    <div class="acard" style="margin-top:1.5rem">
      <div class="acard-hd">
        <div>
          <div class="acard-ti">🗂️ Categorías y Niveles del Ranking</div>
          <div style="font-size:.72rem;color:var(--gr);margin-top:.15rem">Añade, edita o elimina categorías de edad y niveles de competición</div>
        </div>
        <button class="btn-adm-gold" onclick="saveFiltrosRanking()">Guardar</button>
      </div>
      <div class="acard-bd">
        <div class="a2c">

          <!-- CATEGORÍAS DE EDAD -->
          <div>
            <div style="font-size:.7rem;font-weight:800;color:var(--n);letter-spacing:1px;text-transform:uppercase;margin-bottom:.6rem;padding-bottom:.35rem;border-bottom:2px solid var(--gl2)">
              Categorías de edad
            </div>
            <div id="filtros-cats">
              ${cfg.categorias_edad.map((c,i) => `
              <div style="display:grid;grid-template-columns:70px 90px 50px 28px;gap:.4rem;padding:.35rem 0;border-bottom:1px solid var(--gl2);align-items:center">
                <input type="text" id="fc-id-${i}"  value="${c.id}"    placeholder="ID" style="border:1px solid var(--bd);border-radius:5px;padding:.25rem .4rem;font-size:.78rem;font-weight:700">
                <input type="text" id="fc-lb-${i}"  value="${c.label}" placeholder="Etiqueta" style="border:1px solid var(--bd);border-radius:5px;padding:.25rem .4rem;font-size:.78rem">
                <select id="fc-sx-${i}" style="border:1px solid var(--bd);border-radius:5px;padding:.25rem .3rem;font-size:.78rem">
                  <option value="M" ${c.sexo==='M'?'selected':''}>M</option>
                  <option value="F" ${c.sexo==='F'?'selected':''}>F</option>
                </select>
                <button onclick="removeCategoriaEdad(${i})" style="background:#fee2e2;border:none;border-radius:5px;cursor:pointer;font-size:.9rem;padding:.2rem .3rem;color:#dc2626">✕</button>
              </div>`).join('')}
            </div>
            <button onclick="addCategoriaEdad()" class="btn-adm-sm ghost" style="margin-top:.6rem;width:100%">+ Añadir categoría</button>
          </div>

          <!-- NIVELES -->
          <div>
            <div style="font-size:.7rem;font-weight:800;color:var(--n);letter-spacing:1px;text-transform:uppercase;margin-bottom:.6rem;padding-bottom:.35rem;border-bottom:2px solid var(--gl2)">
              Niveles de competición
            </div>
            <div id="filtros-niveles">
              ${cfg.niveles.map((n,i) => `
              <div style="display:grid;grid-template-columns:1fr 1fr 28px;gap:.4rem;padding:.35rem 0;border-bottom:1px solid var(--gl2);align-items:center">
                <input type="text" id="fn-id-${i}"  value="${n.id}"    placeholder="ID" style="border:1px solid var(--bd);border-radius:5px;padding:.25rem .4rem;font-size:.78rem;font-weight:700">
                <input type="text" id="fn-lb-${i}"  value="${n.label}" placeholder="Nombre" style="border:1px solid var(--bd);border-radius:5px;padding:.25rem .4rem;font-size:.78rem">
                <button onclick="removeNivelRanking(${i})" style="background:#fee2e2;border:none;border-radius:5px;cursor:pointer;font-size:.9rem;padding:.2rem .3rem;color:#dc2626">✕</button>
              </div>`).join('')}
            </div>
            <button onclick="addNivelRanking()" class="btn-adm-sm ghost" style="margin-top:.6rem;width:100%">+ Añadir nivel</button>
          </div>

        </div>
      </div>
    </div>

    <!-- ══ PANEL DE PUNTOS ══ -->
    <div class="acard" style="margin-top:1.5rem">
      <div class="acard-hd">
        <div>
          <div class="acard-ti">⚙️ Sistema de Puntos AEMT</div>
          <div style="font-size:.72rem;color:var(--gr);margin-top:.15rem">Define cómo se calculan los puntos del ranking oficial</div>
        </div>
        <div style="display:flex;gap:.5rem">
          <button class="btn-adm-sm ghost" onclick="resetPuntosConfig()">Restaurar defecto</button>
          <button class="btn-adm-gold" onclick="savePuntosConfig()">Guardar configuración</button>
        </div>
      </div>
      <div class="acard-bd">

        <div class="a2c" style="margin-bottom:1.5rem">

          <!-- PUNTOS POR POSICIÓN -->
          <div>
            <div style="font-size:.7rem;font-weight:800;color:var(--n);letter-spacing:1px;text-transform:uppercase;margin-bottom:.7rem;padding-bottom:.4rem;border-bottom:2px solid var(--gl2)">Puntos base por posición</div>
            ${cfg.posiciones.map((p, i) => `
              <div style="display:flex;align-items:center;gap:.7rem;padding:.45rem 0;border-bottom:1px solid var(--gl2)">
                <span style="font-size:1.1rem;width:1.6rem;flex-shrink:0">${p.emoji}</span>
                <span style="flex:1;font-size:.82rem;color:var(--n)">${p.label}</span>
                <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
                  <input type="number" id="pt-pos-${i}" value="${p.puntos}" min="0" style="width:70px;text-align:right;border:1px solid var(--bd);border-radius:6px;padding:.28rem .45rem;font-size:.84rem;font-weight:700;color:var(--n)">
                  <span style="font-size:.72rem;color:var(--gr)">pts</span>
                </div>
              </div>`).join('')}
          </div>

          <!-- MULTIPLICADORES -->
          <div>
            <div style="font-size:.7rem;font-weight:800;color:var(--n);letter-spacing:1px;text-transform:uppercase;margin-bottom:.7rem;padding-bottom:.4rem;border-bottom:2px solid var(--gl2)">Multiplicador por tipo de evento</div>
            ${cfg.multiplicadores.map((m, i) => `
              <div style="display:flex;align-items:center;gap:.7rem;padding:.45rem 0;border-bottom:1px solid var(--gl2)">
                <span style="flex:1;font-size:.82rem;color:var(--n)">${m.label}</span>
                <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
                  <span style="font-size:.8rem;color:var(--g);font-weight:700">×</span>
                  <input type="number" id="pt-mul-${i}" value="${m.x}" min="0" step="0.1" max="5" style="width:60px;text-align:right;border:1px solid var(--bd);border-radius:6px;padding:.28rem .45rem;font-size:.84rem;font-weight:700;color:var(--n)">
                </div>
              </div>`).join('')}

            <div style="margin-top:1.2rem;padding:.8rem;background:var(--of);border-radius:10px;border:1px solid var(--bd)">
              <div style="font-size:.68rem;font-weight:700;color:var(--gr);letter-spacing:.8px;text-transform:uppercase;margin-bottom:.5rem">Ejemplo: puntos base × multiplicador</div>
              <div style="font-size:.76rem;color:var(--n);line-height:1.8">
                ${cfg.posiciones.slice(0,3).map(p =>
                  cfg.multiplicadores.slice(0,3).map(m =>
                    `${p.emoji} ${p.label.split('—')[0].trim()} en ${m.label.split(' ')[0]}: <strong>${Math.round(p.puntos * m.x)} pts</strong>`
                  ).join(' &nbsp;·&nbsp; ')
                ).join('<br>')}
              </div>
            </div>
          </div>
        </div>

        <!-- BONUS Y PENALIZACIONES -->
        <div class="a2c" style="margin-bottom:1.5rem">
          <div>
            <div style="font-size:.7rem;font-weight:800;color:#16a34a;letter-spacing:1px;text-transform:uppercase;margin-bottom:.7rem;padding-bottom:.4rem;border-bottom:2px solid #dcfce7">Bonificaciones especiales</div>
            ${cfg.bonus.map((b, i) => `
              <div style="display:flex;align-items:center;gap:.7rem;padding:.45rem 0;border-bottom:1px solid var(--gl2)">
                <span style="font-size:1.1rem;width:1.6rem;flex-shrink:0">${b.emoji}</span>
                <span style="flex:1;font-size:.8rem;color:var(--n)">${b.label}</span>
                <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
                  <span style="font-size:.72rem;color:#16a34a;font-weight:700">+</span>
                  <input type="number" id="pt-bon-${i}" value="${b.puntos}" min="0" style="width:65px;text-align:right;border:1px solid #bbf7d0;border-radius:6px;padding:.28rem .45rem;font-size:.84rem;font-weight:700;color:#16a34a">
                  <span style="font-size:.72rem;color:var(--gr)">pts</span>
                </div>
              </div>`).join('')}
          </div>

          <div>
            <div style="font-size:.7rem;font-weight:800;color:#dc2626;letter-spacing:1px;text-transform:uppercase;margin-bottom:.7rem;padding-bottom:.4rem;border-bottom:2px solid #fee2e2">Penalizaciones</div>
            ${cfg.penalizaciones.map((p, i) => `
              <div style="display:flex;align-items:center;gap:.7rem;padding:.45rem 0;border-bottom:1px solid var(--gl2)">
                <span style="font-size:1.1rem;width:1.6rem;flex-shrink:0">${p.emoji}</span>
                <span style="flex:1;font-size:.8rem;color:var(--n)">${p.label}</span>
                <div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0">
                  <input type="number" id="pt-pen-${i}" value="${p.puntos}" max="0" style="width:65px;text-align:right;border:1px solid #fecaca;border-radius:6px;padding:.28rem .45rem;font-size:.84rem;font-weight:700;color:#dc2626">
                  <span style="font-size:.72rem;color:var(--gr)">pts</span>
                </div>
              </div>`).join('')}

            <!-- CALCULADORA -->
            <div style="margin-top:1.2rem;padding:1rem;background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-radius:10px;border:1px solid #c7d2fe">
              <div style="font-size:.7rem;font-weight:800;color:var(--n);letter-spacing:1px;text-transform:uppercase;margin-bottom:.7rem">🧮 Calculadora de puntos</div>
              <div class="fr" style="gap:.5rem;margin-bottom:.6rem">
                <div class="fg" style="margin-bottom:0">
                  <label style="font-size:.62rem">Posición</label>
                  <select id="calc-pos" onchange="calcPuntos()" style="font-size:.78rem;padding:.3rem .5rem;border:1px solid var(--bd);border-radius:6px;width:100%">
                    ${cfg.posiciones.map((p, i) => `<option value="${i}">${p.emoji} ${p.label.split('—')[0].trim()}</option>`).join('')}
                  </select>
                </div>
                <div class="fg" style="margin-bottom:0">
                  <label style="font-size:.62rem">Tipo de evento</label>
                  <select id="calc-mul" onchange="calcPuntos()" style="font-size:.78rem;padding:.3rem .5rem;border:1px solid var(--bd);border-radius:6px;width:100%">
                    ${cfg.multiplicadores.map((m, i) => `<option value="${i}">${m.label}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div id="calc-result" style="text-align:center;padding:.5rem">
                <span style="font-size:2rem;font-weight:800;color:var(--n)">${Math.round(cfg.posiciones[0].puntos * cfg.multiplicadores[0].x)}</span>
                <span style="font-size:.9rem;color:var(--gr)"> puntos</span>
              </div>
            </div>
          </div>
        </div>

        <button class="m-fsb" onclick="savePuntosConfig()" style="margin-top:0">Guardar configuración de puntos</button>
      </div>
    </div>

    <!-- ══ EVENTOS PUNTUABLES ══ -->
    <div class="acard" style="margin-top:1.5rem">
      <div class="acard-hd">
        <div>
          <div class="acard-ti">📅 Eventos Puntuables del Ranking</div>
          <div style="font-size:.72rem;color:var(--gr);margin-top:.15rem">Marca qué eventos cuentan para el ranking y asigna el multiplicador individual</div>
        </div>
        <button class="btn-adm-gold" onclick="saveEventosPuntuables()">Guardar</button>
      </div>
      <div class="acard-bd">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.5rem">
          <div style="font-size:.65rem;font-weight:800;color:var(--gr);letter-spacing:.8px;text-transform:uppercase">Evento</div>
          <div style="display:grid;grid-template-columns:60px 90px 80px;gap:.5rem;font-size:.65rem;font-weight:800;color:var(--gr);letter-spacing:.8px;text-transform:uppercase">
            <span>Puntúa</span><span>Multiplicador</span><span>Pts máx</span>
          </div>
        </div>
        ${(await adminFetchEventos()).map((e, i) => {
          const epCfg = (loadPuntosConfig().eventosPersonalizados || {})[e.id] || {};
          const activo  = epCfg.activo !== false;
          const mulVal  = epCfg.multiplicador !== undefined ? epCfg.multiplicador : 1.0;
          const ptsMax  = epCfg.pts_max !== undefined ? epCfg.pts_max : '';
          return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;padding:.5rem 0;border-bottom:1px solid var(--gl2);align-items:center">
            <div>
              <div style="font-size:.82rem;font-weight:700;color:var(--n)">${e.titulo}</div>
              <div style="font-size:.68rem;color:var(--gr)">${e.fecha||''} · ${(e.tipo||'').charAt(0).toUpperCase()+(e.tipo||'').slice(1)}</div>
            </div>
            <div style="display:grid;grid-template-columns:60px 90px 80px;gap:.5rem;align-items:center">
              <label style="display:flex;align-items:center;gap:.4rem;cursor:pointer">
                <input type="checkbox" id="ep-act-${e.id}" ${activo?'checked':''} style="accent-color:var(--n);width:16px;height:16px">
              </label>
              <div style="display:flex;align-items:center;gap:.3rem">
                <span style="font-size:.78rem;color:var(--g);font-weight:700">×</span>
                <input type="number" id="ep-mul-${e.id}" value="${mulVal}" min="0" step="0.1" max="5"
                  style="width:56px;border:1px solid var(--bd);border-radius:6px;padding:.25rem .4rem;font-size:.82rem;font-weight:700;color:var(--n)">
              </div>
              <input type="number" id="ep-max-${e.id}" value="${ptsMax}" min="0" placeholder="Sin límite"
                style="width:72px;border:1px solid var(--bd);border-radius:6px;padding:.25rem .4rem;font-size:.78rem;color:var(--n)">
            </div>
          </div>`;
        }).join('')}
        <div style="margin-top:.8rem;padding:.65rem;background:var(--of);border-radius:8px;font-size:.76rem;color:var(--gr)">
          💡 El multiplicador individual sobreescribe el multiplicador por tipo de evento para ese evento concreto.
          Si pones límite de puntos, ningún deportista podrá superar esa cantidad en ese evento.
        </div>
      </div>
    </div>`;
}

async function saveEventosPuntuables() {
  const events = await adminFetchEventos();
  const cfg = loadPuntosConfig();
  cfg.eventosPersonalizados = cfg.eventosPersonalizados || {};
  events.forEach(e => {
    const activo = q(`#ep-act-${e.id}`)?.checked;
    const mul    = parseFloat(q(`#ep-mul-${e.id}`)?.value) || 1.0;
    const max    = parseInt(q(`#ep-max-${e.id}`)?.value)   || null;
    cfg.eventosPersonalizados[e.id] = { activo, multiplicador: mul, pts_max: max };
  });
  localStorage.setItem(LS_PUNTOS, JSON.stringify(cfg));
  toast('✅ Eventos puntuables guardados');
}
window.saveEventosPuntuables = saveEventosPuntuables;

function rankingFormHtml(r = {}) {
  const cfg = loadPuntosConfig();
  const cats = (cfg.categorias_edad || []).map(c => c.id);
  const niveles = cfg.niveles || [];
  return `
    <div class="m-ti">${r.id ? 'Editar Deportista' : 'Nuevo Deportista'}</div>
    <div class="fr">
      <div class="fg"><label>Posición</label><input type="number" id="rk-pos" value="${r.posicion||''}" min="1"></div>
      <div class="fg"><label>Categoría edad</label><select id="rk-cat">
        ${cats.map(c=>`<option value="${c}" ${r.categoria===c?'selected':''}>${c}</option>`).join('')}
      </select></div>
    </div>
    <div class="fr">
      <div class="fg"><label>Sexo</label><select id="rk-sx">
        <option value="M" ${r.sexo==='M'||!r.sexo?'selected':''}>♂ Masculino</option>
        <option value="F" ${r.sexo==='F'?'selected':''}>♀ Femenino</option>
      </select></div>
      <div class="fg"><label>Nivel</label><select id="rk-nv">
        ${niveles.map(n=>`<option value="${n.id}" ${r.nivel===n.id?'selected':''}>${n.label}</option>`).join('')}
      </select></div>
    </div>
    <div class="fg"><label>Nombre completo</label><input type="text" id="rk-nm" value="${r.nombre||''}" placeholder="Nombre y apellidos"></div>
    <div class="fg"><label>Club</label><input type="text" id="rk-cl" value="${r.club||''}" placeholder="Club deportivo"></div>
    <div class="fg"><label>Comunidad Autónoma</label><select id="rk-cc">${ccaaOpts(r.comunidad)}</select></div>
    <div class="fr">
      <div class="fg"><label>Puntos</label><input type="number" id="rk-pts" value="${r.puntos||0}" min="0"></div>
      <div class="fg"><label>Eventos participados</label><input type="number" id="rk-ev" value="${r.eventos||0}" min="0"></div>
    </div>
    <button class="m-fsb" onclick="saveRanking('${r.id||''}')">Guardar</button>
  `;
}

function openNewRanking() { openModal(rankingFormHtml()); }
window.openNewRanking = openNewRanking;

function editRanking(id) {
  const r = _d.ranking.find(x => String(x.id||x.posicion) === String(id));
  if (!r) { toast('⚠️ Registro no encontrado'); return; }
  openModal(rankingFormHtml(r));
}
window.editRanking = editRanking;

async function saveRanking(id) {
  const row = {
    posicion:  parseInt(q('#rk-pos').value)  || 0,
    nombre:    q('#rk-nm').value.trim(),
    club:      q('#rk-cl').value.trim(),
    categoria: q('#rk-cat').value,
    sexo:      q('#rk-sx').value,
    nivel:     q('#rk-nv').value,
    comunidad: q('#rk-cc').value,
    puntos:    parseInt(q('#rk-pts').value)  || 0,
    eventos:   parseInt(q('#rk-ev').value)   || 0,
  };
  if (!row.nombre) { toast('⚠️ El nombre es obligatorio'); return; }
  if (id) row.id = id;
  const { error } = await adminUpsertRanking(row);
  closeModal();
  if (error) toast('❌ Error al guardar');
  else { toast('✅ Ranking actualizado'); renderRankingAdmin(); }
}
window.saveRanking = saveRanking;

async function deleteRanking(id) {
  const r = _d.ranking.find(x => String(x.id||x.posicion) === String(id));
  if (!confirm(`¿Eliminar a "${r ? r.nombre : id}" del ranking?`)) return;
  const { error } = await adminDeleteRanking(id);
  if (error) toast('❌ Error al eliminar');
  else { toast('✅ Deportista eliminado del ranking'); renderRankingAdmin(); }
}
window.deleteRanking = deleteRanking;

// ── NOTICIAS ADMIN ────────────────────────────────────────
async function renderNoticiasAdmin() {
  const noticias = await adminFetchNoticias();
  _d.news = noticias;

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Noticias</h2><p>${noticias.length} artículos</p></div>
      <button class="btn-adm-gold" onclick="openNewNoticia()">+ Nueva Noticia</button>
    </div>
    <div class="acard">
      <div class="acard-bd">${noticias.map(n => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem 0;border-bottom:1px solid var(--gl2)">
          <div style="flex:1">
            <div style="font-weight:700;font-size:.88rem;color:var(--n)">${n.titulo||'Sin título'}</div>
            <div style="font-size:.72rem;color:var(--gr);margin-top:.15rem">${n.categoria||''} · ${n.fecha_publicacion||''}</div>
          </div>
          <div style="display:flex;gap:.4rem;align-items:center;margin-left:1rem;flex-shrink:0">
            <span class="sp ${n.publicada?'sp-a':'sp-i'}">${n.publicada?'Publicada':'Borrador'}</span>
            <button class="btn-adm-sm ghost" onclick="togglePublish('${n.id}',${!!n.publicada})">${n.publicada?'Ocultar':'Publicar'}</button>
            <button class="btn-adm-sm primary" onclick="editNoticia('${n.id}')">Editar</button>
            <button class="btn-adm-sm danger" onclick="deleteNoticia('${n.id}')">Borrar</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
}

async function togglePublish(id, current) {
  const { error } = await adminUpsertNoticia({ id, publicada: !current });
  if (error) toast('❌ Error'); else { toast('✅ Estado actualizado'); renderNoticiasAdmin(); }
}
window.togglePublish = togglePublish;

function noticiaFormHtml(n = {}) {
  return `
    <div class="m-ti">${n.id ? 'Editar Noticia' : 'Nueva Noticia'}</div>
    <div class="fg"><label>Título</label><input type="text" id="nn-ti" value="${(n.titulo||'').replace(/"/g,'&quot;')}" placeholder="Título de la noticia"></div>
    <div class="fr">
      <div class="fg"><label>Categoría</label><input type="text" id="nn-cat" value="${n.categoria||''}" placeholder="Ej: Internacional"></div>
      <div class="fg"><label>Emoji</label><input type="text" id="nn-em" value="${n.emoji||'📰'}" style="max-width:80px"></div>
    </div>
    <div class="fg"><label>Extracto (resumen corto)</label><textarea id="nn-ex" placeholder="Resumen breve para la portada..." style="height:65px">${n.extracto||''}</textarea></div>
    <div class="fg"><label>Contenido completo del artículo</label><textarea id="nn-body" placeholder="Texto completo de la noticia. Usa saltos de línea para párrafos." style="height:160px">${n.contenido||''}</textarea></div>
    <div style="display:flex;gap:.6rem;align-items:center;margin-bottom:.9rem">
      <input type="checkbox" id="nn-pub" ${n.publicada?'checked':''} style="accent-color:var(--n)">
      <label for="nn-pub" style="font-size:.8rem;color:var(--n)">Publicada</label>
      <input type="checkbox" id="nn-des" ${n.destacada?'checked':''} style="accent-color:var(--n);margin-left:.8rem">
      <label for="nn-des" style="font-size:.8rem;color:var(--n)">Destacada</label>
    </div>
    <button class="m-fsb" onclick="saveNoticia('${n.id||''}')">Guardar Noticia</button>
  `;
}

function openNewNoticia() { openModal(noticiaFormHtml()); }
window.openNewNoticia = openNewNoticia;

function editNoticia(id) {
  const n = _d.news.find(x => String(x.id) === String(id));
  if (!n) { toast('⚠️ Noticia no encontrada'); return; }
  openModal(noticiaFormHtml(n));
}
window.editNoticia = editNoticia;

async function saveNoticia(id) {
  const noticia = {
    titulo:            q('#nn-ti').value.trim(),
    categoria:         q('#nn-cat').value.trim(),
    emoji:             q('#nn-em').value.trim() || '📰',
    extracto:          q('#nn-ex').value.trim(),
    contenido:         q('#nn-body').value.trim(),
    publicada:         q('#nn-pub').checked,
    destacada:         q('#nn-des').checked,
    fecha_publicacion: new Date().toISOString().split('T')[0],
  };
  if (!noticia.titulo) { toast('⚠️ El título es obligatorio'); return; }
  if (id) noticia.id = id;
  const { error } = await adminUpsertNoticia(noticia);
  closeModal();
  if (error) toast('❌ Error al guardar');
  else { toast('✅ Noticia guardada'); renderNoticiasAdmin(); }
}
window.saveNoticia = saveNoticia;

async function deleteNoticia(id) {
  const n = _d.news.find(x => String(x.id) === String(id));
  if (!confirm(`¿Eliminar la noticia "${n ? n.titulo : id}"?`)) return;
  const { error } = await adminDeleteNoticia(id);
  if (error) toast('❌ Error al eliminar');
  else { toast('✅ Noticia eliminada'); renderNoticiasAdmin(); }
}
window.deleteNoticia = deleteNoticia;

// ── PORTADA EDITOR ────────────────────────────────────────
const LS_PORTADA = 'aemt_portada';

const DEFAULT_PORTADA = {
  hero_titulo:    'ASOCIACIÓN ESPAÑOLA DE TAEKWONDO MASTERS',
  hero_subtitulo: 'La élite del Taekwondo por encima de los 35 años. Competición, hermandad y excelencia.',
  hero_badge:     'Fundada en Madrid · 2026',
  ticker:         ['AEMT Open Madrid · 15 Marzo','USA Master Cup · Junio','European Masters · Septiembre','Summer Camp · Agosto','Liga AEMT · 7 Jornadas','Gran Final · Diciembre','Únete · aemt.es'],
  about_titulo:   'Somos la nueva referencia del Taekwondo Master en España',
  about_texto:    'Nace para dar estructura, visibilidad y oportunidades a los practicantes de taekwondo mayores de 35 años. Un espacio donde la experiencia y la competición se fusionan.',
  stat1_num:      47,   stat1_lbl: 'Abonados',
  stat2_num:      7,    stat2_lbl: 'Eventos 2026',
  stat3_num:      5,    stat3_lbl: 'CC.AA.',
  stat4_num:      108,  stat4_lbl: 'Países en IMGA',
  contacto_email: 'info@aemt.es',
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

const LS_ACCESO = 'aemt_acceso';
function loadAccesoConfig() {
  try { const r = localStorage.getItem(LS_ACCESO); return r ? JSON.parse(r) : { activa:false, password:'', mensaje:'' }; }
  catch { return { activa:false, password:'', mensaje:'' }; }
}
function saveAccesoConfig() {
  const cfg = {
    activa:   q('#pt-acc-on')?.checked || false,
    password: q('#pt-acc-pw')?.value.trim() || '',
    mensaje:  q('#pt-acc-msg')?.value.trim() || '',
  };
  localStorage.setItem(LS_ACCESO, JSON.stringify(cfg));
  saveConfig('acceso', cfg).then(({ error }) => {
    if (error) toast('⚠️ Solo local — Error: ' + (error.message || error.code || JSON.stringify(error)));
    else toast(cfg.activa ? '🔒 Protección activada en todos los dispositivos' : '🔓 Protección desactivada globalmente');
  });
  renderPortada();
}
window.saveAccesoConfig = saveAccesoConfig;

function renderPortada() {
  const p = loadPortada();
  const accCfg = loadAccesoConfig();
  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Editor de Portada</h2><p>Edita el contenido de la web sin tocar código</p></div>
      <div style="display:flex;gap:.5rem">
        <button class="btn-adm-sm ghost" onclick="resetPortada()">Restaurar defecto</button>
        <button class="btn-adm-gold" onclick="savePortada()">Guardar y publicar</button>
      </div>
    </div>

    <!-- HERO -->
    <div class="acard">
      <div class="acard-hd"><div class="acard-ti">🦸 Sección Hero (cabecera principal)</div></div>
      <div class="acard-bd">
        <div class="fg"><label>Título principal</label>
          <input type="text" id="pt-hero-ti" value="${p.hero_titulo}" style="font-weight:700"></div>
        <div class="fg"><label>Subtítulo</label>
          <textarea id="pt-hero-sub" style="height:65px">${p.hero_subtitulo}</textarea></div>
        <div class="fg"><label>Badge (texto pequeño bajo el título)</label>
          <input type="text" id="pt-hero-badge" value="${p.hero_badge}"></div>
      </div>
    </div>

    <!-- TICKER -->
    <div class="acard" style="margin-top:1rem">
      <div class="acard-hd">
        <div><div class="acard-ti">📢 Ticker (banda de noticias)</div>
        <div style="font-size:.72rem;color:var(--gr)">Un mensaje por línea · se repite automáticamente</div></div>
      </div>
      <div class="acard-bd">
        <div class="fg"><label>Mensajes del ticker</label>
          <textarea id="pt-ticker" style="height:130px;font-size:.82rem">${p.ticker.join('\n')}</textarea></div>
      </div>
    </div>

    <!-- ABOUT -->
    <div class="acard" style="margin-top:1rem">
      <div class="acard-hd"><div class="acard-ti">📖 Sección ¿Quiénes somos?</div></div>
      <div class="acard-bd">
        <div class="fg"><label>Título</label>
          <input type="text" id="pt-about-ti" value="${p.about_titulo}"></div>
        <div class="fg"><label>Texto</label>
          <textarea id="pt-about-tx" style="height:80px">${p.about_texto}</textarea></div>
      </div>
    </div>

    <!-- STATS -->
    <div class="acard" style="margin-top:1rem">
      <div class="acard-hd"><div class="acard-ti">📊 Contadores estadísticos</div></div>
      <div class="acard-bd">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem">
          ${[1,2,3,4].map(i => `
          <div style="background:var(--of);padding:.8rem;border-radius:10px;border:1px solid var(--bd)">
            <div class="fg" style="margin-bottom:.4rem"><label>Número ${i}</label>
              <input type="number" id="pt-st${i}-n" value="${p['stat'+i+'_num']}"></div>
            <div class="fg" style="margin-bottom:0"><label>Etiqueta ${i}</label>
              <input type="text" id="pt-st${i}-l" value="${p['stat'+i+'_lbl']}"></div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- CONTACTO -->
    <div class="acard" style="margin-top:1rem">
      <div class="acard-hd"><div class="acard-ti">📬 Datos de contacto</div></div>
      <div class="acard-bd">
        <div class="fr">
          <div class="fg"><label>Email</label><input type="email" id="pt-ct-em" value="${p.contacto_email}"></div>
          <div class="fg"><label>Teléfono</label><input type="tel" id="pt-ct-tel" value="${p.contacto_tel}"></div>
        </div>
        <div class="fg"><label>Dirección / Sede</label><input type="text" id="pt-ct-dir" value="${p.contacto_dir}"></div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="acard" style="margin-top:1rem">
      <div class="acard-hd"><div class="acard-ti">🔻 Footer</div></div>
      <div class="acard-bd">
        <div class="fg"><label>Texto de copyright</label>
          <input type="text" id="pt-footer" value="${p.footer_texto}"></div>
      </div>
    </div>

    <!-- PROTECCIÓN DE ACCESO -->
    <div class="acard" style="margin-top:1rem;border:2px solid ${accCfg.activa ? '#fcd34d' : 'var(--gl2)'}">
      <div class="acard-hd">
        <div>
          <div class="acard-ti">🔒 Protección de acceso a la web</div>
          <div style="font-size:.72rem;color:var(--gr);margin-top:.15rem">Activa una contraseña para ocultar la web al público hasta que esté lista</div>
        </div>
        <div style="display:flex;align-items:center;gap:.7rem">
          <span style="font-size:.72rem;font-weight:800;color:${accCfg.activa?'#92400e':'var(--gr)'}">${accCfg.activa ? '🔒 ACTIVA' : '🔓 Desactivada'}</span>
          <label style="display:flex;align-items:center;gap:.4rem;cursor:pointer">
            <input type="checkbox" id="pt-acc-on" ${accCfg.activa?'checked':''} style="accent-color:var(--n);width:16px;height:16px">
            <span style="font-size:.8rem;color:var(--n)">Activar</span>
          </label>
        </div>
      </div>
      <div class="acard-bd">
        <div class="fr">
          <div class="fg">
            <label>Contraseña de acceso</label>
            <input type="text" id="pt-acc-pw" value="${accCfg.password||''}" placeholder="Ej: aemt2026" autocomplete="off">
            <div style="font-size:.68rem;color:var(--gr);margin-top:.3rem">⚠️ Seguridad básica — no usar para datos sensibles. Diseñada para mantener la web en beta.</div>
          </div>
          <div class="fg">
            <label>Mensaje en la pantalla de acceso</label>
            <input type="text" id="pt-acc-msg" value="${accCfg.mensaje||'Sitio web en construcción. Introduce la contraseña para continuar.'}" placeholder="Mensaje para los visitantes">
          </div>
        </div>
        <button class="btn-adm-gold" onclick="saveAccesoConfig()" style="margin-top:.5rem">Guardar configuración de acceso</button>
      </div>
    </div>

    <div style="margin-top:1rem">
      <button class="m-fsb" onclick="savePortada()">💾 Guardar y publicar cambios en la portada</button>
    </div>`;
}

function savePortada() {
  const ticker = q('#pt-ticker').value.split('\n').map(s => s.trim()).filter(Boolean);
  const data = {
    hero_titulo:    q('#pt-hero-ti').value.trim(),
    hero_subtitulo: q('#pt-hero-sub').value.trim(),
    hero_badge:     q('#pt-hero-badge').value.trim(),
    ticker,
    about_titulo:   q('#pt-about-ti').value.trim(),
    about_texto:    q('#pt-about-tx').value.trim(),
    stat1_num: parseInt(q('#pt-st1-n').value) || 0,  stat1_lbl: q('#pt-st1-l').value.trim(),
    stat2_num: parseInt(q('#pt-st2-n').value) || 0,  stat2_lbl: q('#pt-st2-l').value.trim(),
    stat3_num: parseInt(q('#pt-st3-n').value) || 0,  stat3_lbl: q('#pt-st3-l').value.trim(),
    stat4_num: parseInt(q('#pt-st4-n').value) || 0,  stat4_lbl: q('#pt-st4-l').value.trim(),
    contacto_email: q('#pt-ct-em').value.trim(),
    contacto_tel:   q('#pt-ct-tel').value.trim(),
    contacto_dir:   q('#pt-ct-dir').value.trim(),
    footer_texto:   q('#pt-footer').value.trim(),
  };
  localStorage.setItem(LS_PORTADA, JSON.stringify(data));
  saveConfig('portada', data).then(({ error }) => {
    if (error) toast('⚠️ Solo local — Error Supabase: ' + (error.message || error.code || JSON.stringify(error)));
    else toast('✅ Portada actualizada y publicada en todos los dispositivos');
  });
}
window.savePortada = savePortada;

function resetPortada() {
  if (!confirm('¿Restaurar contenido por defecto de la portada?')) return;
  localStorage.removeItem(LS_PORTADA);
  renderPortada();
  toast('✅ Portada restaurada al contenido original');
}
window.resetPortada = resetPortada;

// ── FINANZAS ──────────────────────────────────────────────
const LS_FIN = 'aemt_finanzas';

const DEFAULT_MOVIMIENTOS = [
  { id:'f1', fecha:'2026-03-10', concepto:'Cuotas × 12 abonados',     categoria:'cuotas',       tipo:'ingreso', importe:720,  notas:'' },
  { id:'f2', fecha:'2026-03-08', concepto:'Seguro RC (AXA)',           categoria:'seguros',      tipo:'gasto',   importe:280,  notas:'' },
  { id:'f3', fecha:'2026-03-05', concepto:'Notaría AEMT Gestión SL',  categoria:'constitucion', tipo:'gasto',   importe:450,  notas:'' },
  { id:'f4', fecha:'2026-03-01', concepto:'Cuotas × 8 abonados',      categoria:'cuotas',       tipo:'ingreso', importe:480,  notas:'' },
  { id:'f5', fecha:'2026-02-25', concepto:'Hosting + dominio aemt.es',categoria:'tecnologia',   tipo:'gasto',   importe:120,  notas:'' },
];

function loadMovimientos() {
  try {
    const raw = localStorage.getItem(LS_FIN);
    if (raw) { const d = JSON.parse(raw); if (Array.isArray(d)) return d; }
    return DEFAULT_MOVIMIENTOS.map(m => ({...m}));
  } catch { return DEFAULT_MOVIMIENTOS.map(m => ({...m})); }
}

function saveMovimientos(data) {
  localStorage.setItem(LS_FIN, JSON.stringify(data));
}

const FIN_CATS = ['cuotas','eventos','subvenciones','patrocinio','seguros','constitucion','tecnologia','material','viajes','otros'];

function renderFinanzas() {
  const movs = loadMovimientos();
  const ingresos = movs.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.importe), 0);
  const gastos   = movs.filter(m => m.tipo === 'gasto').reduce((s, m) => s + Number(m.importe), 0);
  const saldo    = ingresos - gastos;

  const filtro = window._finFiltro || 'todos';
  const filtered = filtro === 'todos' ? movs
    : filtro === 'ingresos' ? movs.filter(m => m.tipo === 'ingreso')
    : movs.filter(m => m.tipo === 'gasto');

  const sorted = [...filtered].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Finanzas 2026</h2><p>${movs.length} movimientos registrados</p></div>
      <div style="display:flex;gap:.5rem">
        <button class="btn-adm-sm ghost" onclick="importarExcelFinanzas()">📂 Importar CSV/Excel</button>
        <button class="btn-adm-sm ghost" onclick="exportarFinanzas()">📥 Exportar CSV</button>
        <button class="btn-adm-gold" onclick="openNuevoMovimiento()">+ Nuevo movimiento</button>
      </div>
    </div>

    <div class="kpi-r">
      <div class="kpi"><div class="kpi-lb">Ingresos YTD</div><div class="kpi-vl" style="color:#16a34a">+${ingresos.toLocaleString('es-ES')}€</div><div class="kpi-tr tu">↑ Total entradas</div></div>
      <div class="kpi"><div class="kpi-lb">Gastos YTD</div><div class="kpi-vl" style="color:#dc2626">-${gastos.toLocaleString('es-ES')}€</div><div class="kpi-tr tn">Total salidas</div></div>
      <div class="kpi"><div class="kpi-lb">Saldo neto</div><div class="kpi-vl" style="color:${saldo>=0?'#16a34a':'#dc2626'}">${saldo>=0?'+':''}${saldo.toLocaleString('es-ES')}€</div><div class="kpi-tr ${saldo>=0?'tu':'tn'}">${saldo>=0?'↑ Superávit':'↓ Déficit'}</div></div>
      <div class="kpi"><div class="kpi-lb">Movimientos</div><div class="kpi-vl">${movs.length}</div><div class="kpi-tr tg">${movs.filter(m=>m.tipo==='ingreso').length} ingresos · ${movs.filter(m=>m.tipo==='gasto').length} gastos</div></div>
    </div>

    <div class="acard" style="margin-top:1rem">
      <div class="acard-hd">
        <div class="acard-ti">Movimientos bancarios</div>
        <div style="display:flex;gap:.35rem">
          ${['todos','ingresos','gastos'].map(f=>`<button class="btn-adm-sm ${filtro===f?'primary':'ghost'}" onclick="finFiltrar('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('')}
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Tipo</th><th style="text-align:right">Importe</th><th>Notas</th><th>Acciones</th></tr></thead>
          <tbody>${sorted.length ? sorted.map(m => `<tr>
            <td style="font-size:.78rem;color:var(--gr);white-space:nowrap">${m.fecha}</td>
            <td style="font-weight:600;font-size:.83rem;color:var(--n)">${m.concepto}</td>
            <td><span style="font-size:.68rem;font-weight:700;background:var(--of);padding:.18rem .45rem;border-radius:5px;color:var(--gr)">${m.categoria||'—'}</span></td>
            <td><span style="font-size:.72rem;font-weight:800;color:${m.tipo==='ingreso'?'#16a34a':'#dc2626'};background:${m.tipo==='ingreso'?'#dcfce7':'#fee2e2'};padding:.18rem .45rem;border-radius:5px">${m.tipo==='ingreso'?'↑ Ingreso':'↓ Gasto'}</span></td>
            <td style="text-align:right;font-weight:800;font-size:.88rem;color:${m.tipo==='ingreso'?'#16a34a':'#dc2626'}">${m.tipo==='ingreso'?'+':'-'}${Number(m.importe).toLocaleString('es-ES')}€</td>
            <td style="font-size:.75rem;color:var(--gr);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.notas||''}</td>
            <td style="display:flex;gap:.35rem">
              <button class="btn-adm-sm ghost" onclick="editMovimiento('${m.id}')">Editar</button>
              <button class="btn-adm-sm danger" onclick="deleteMovimiento('${m.id}')">Borrar</button>
            </td>
          </tr>`).join('') : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gr)">Sin movimientos</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Importar CSV oculto -->
    <input type="file" id="fin-file-input" accept=".csv,.xlsx,.xls" style="display:none" onchange="procesarArchivoFinanzas(this)">

    <div style="margin-top:1rem;padding:.8rem 1rem;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd;font-size:.75rem;color:#0369a1">
      💡 <strong>Importar CSV/Excel:</strong> El archivo debe tener columnas: <code>fecha, concepto, tipo (ingreso/gasto), importe, categoria, notas</code>. Los movimientos importados se añaden a los existentes.
    </div>`;
}

function finFiltrar(f) {
  window._finFiltro = f;
  renderFinanzas();
}
window.finFiltrar = finFiltrar;

function movimientoFormHtml(m = {}) {
  const isEdit = !!m.id;
  return `
    <div class="m-ti">${isEdit ? 'Editar Movimiento' : 'Nuevo Movimiento'}</div>
    <div class="fr">
      <div class="fg"><label>Fecha</label><input type="date" id="fm-fe" value="${m.fecha || new Date().toISOString().split('T')[0]}"></div>
      <div class="fg"><label>Tipo</label>
        <select id="fm-tp">
          <option value="ingreso" ${m.tipo==='ingreso'||!m.tipo?'selected':''}>↑ Ingreso</option>
          <option value="gasto"   ${m.tipo==='gasto'?'selected':''}>↓ Gasto</option>
        </select>
      </div>
    </div>
    <div class="fg"><label>Concepto</label><input type="text" id="fm-co" value="${(m.concepto||'').replace(/"/g,'&quot;')}" placeholder="Descripción del movimiento"></div>
    <div class="fr">
      <div class="fg"><label>Importe (€)</label><input type="number" id="fm-im" value="${m.importe||''}" min="0" step="0.01" placeholder="0.00"></div>
      <div class="fg"><label>Categoría</label>
        <select id="fm-ca">
          ${FIN_CATS.map(c=>`<option value="${c}" ${m.categoria===c?'selected':''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="fg"><label>Notas</label><textarea id="fm-no" style="height:60px" placeholder="Observaciones...">${m.notas||''}</textarea></div>
    <button class="m-fsb" onclick="saveMovimiento('${m.id||''}')">Guardar</button>`;
}

function openNuevoMovimiento() { openModal(movimientoFormHtml()); }
window.openNuevoMovimiento = openNuevoMovimiento;

function editMovimiento(id) {
  const m = loadMovimientos().find(x => String(x.id) === String(id));
  if (!m) { toast('⚠️ Movimiento no encontrado'); return; }
  openModal(movimientoFormHtml(m));
}
window.editMovimiento = editMovimiento;

function saveMovimiento(id) {
  const concepto = q('#fm-co').value.trim();
  const importe  = parseFloat(q('#fm-im').value);
  if (!concepto) { toast('⚠️ El concepto es obligatorio'); return; }
  if (!importe || importe <= 0) { toast('⚠️ El importe debe ser mayor que 0'); return; }

  const movs = loadMovimientos();
  const mov = {
    id:        id || ('f' + Date.now()),
    fecha:     q('#fm-fe').value,
    concepto,
    tipo:      q('#fm-tp').value,
    importe,
    categoria: q('#fm-ca').value,
    notas:     q('#fm-no').value.trim(),
  };

  if (id) {
    saveMovimientos(movs.map(m => String(m.id) === String(id) ? mov : m));
  } else {
    saveMovimientos([...movs, mov]);
  }
  closeModal();
  toast('✅ Movimiento guardado');
  renderFinanzas();
}
window.saveMovimiento = saveMovimiento;

function deleteMovimiento(id) {
  const m = loadMovimientos().find(x => String(x.id) === String(id));
  if (!confirm(`¿Eliminar "${m ? m.concepto : id}"?`)) return;
  saveMovimientos(loadMovimientos().filter(x => String(x.id) !== String(id)));
  toast('✅ Movimiento eliminado');
  renderFinanzas();
}
window.deleteMovimiento = deleteMovimiento;

function importarExcelFinanzas() {
  q('#fin-file-input')?.click();
}
window.importarExcelFinanzas = importarExcelFinanzas;

function procesarArchivoFinanzas(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { toast('⚠️ El archivo no tiene datos suficientes'); return; }
    // Detect separator
    const sep = lines[0].includes(';') ? ';' : ',';
    const header = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/['"]/g,''));
    const idxFecha    = header.findIndex(h => h.includes('fecha'));
    const idxConcepto = header.findIndex(h => h.includes('concepto') || h.includes('descripcion') || h.includes('descripción'));
    const idxTipo     = header.findIndex(h => h.includes('tipo'));
    const idxImporte  = header.findIndex(h => h.includes('importe') || h.includes('cantidad') || h.includes('amount'));
    const idxCat      = header.findIndex(h => h.includes('categor'));
    const idxNotas    = header.findIndex(h => h.includes('nota') || h.includes('obs'));

    if (idxConcepto < 0 || idxImporte < 0) {
      toast('⚠️ No se detectaron columnas "concepto" e "importe"');
      return;
    }

    const movs = loadMovimientos();
    let added = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep).map(c => c.trim().replace(/^["']|["']$/g,''));
      const concepto = idxConcepto >= 0 ? cols[idxConcepto] : '';
      const importeRaw = idxImporte >= 0 ? cols[idxImporte].replace(',','.').replace(/[^\d.-]/g,'') : '0';
      const importe = Math.abs(parseFloat(importeRaw));
      if (!concepto || !importe) continue;

      // Auto-detect tipo from importe sign or tipo column
      let tipo = 'ingreso';
      if (idxTipo >= 0 && cols[idxTipo]) {
        tipo = cols[idxTipo].toLowerCase().includes('gasto') || cols[idxTipo].toLowerCase().includes('salida') || cols[idxTipo].toLowerCase().includes('out') ? 'gasto' : 'ingreso';
      } else if (parseFloat(importeRaw) < 0) {
        tipo = 'gasto';
      }

      movs.push({
        id:        'csv_' + Date.now() + '_' + i,
        fecha:     idxFecha >= 0 ? cols[idxFecha] : new Date().toISOString().split('T')[0],
        concepto,
        tipo,
        importe,
        categoria: idxCat >= 0 ? (cols[idxCat] || 'otros') : 'otros',
        notas:     idxNotas >= 0 ? cols[idxNotas] : '',
      });
      added++;
    }
    saveMovimientos(movs);
    input.value = '';
    toast(`✅ ${added} movimientos importados`);
    renderFinanzas();
  };
  reader.readAsText(file, 'UTF-8');
}
window.procesarArchivoFinanzas = procesarArchivoFinanzas;

function exportarFinanzas() {
  const movs = loadMovimientos();
  const header = 'fecha,concepto,tipo,importe,categoria,notas';
  const rows = movs.map(m =>
    [m.fecha, `"${m.concepto}"`, m.tipo, m.importe, m.categoria, `"${m.notas||''}"`].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `aemt_finanzas_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('📥 CSV exportado');
}
window.exportarFinanzas = exportarFinanzas;

// ── FILE UPLOAD HELPERS ───────────────────────────────────
const MAX_FILE_MB = 2;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      reject(new Error(`El archivo supera ${MAX_FILE_MB} MB. Usa un PDF comprimido.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function pickFile(accept, onFile) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = accept || '.pdf,.doc,.docx,.png,.jpg,.jpeg';
  inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.addEventListener('change', async () => {
    const file = inp.files[0];
    if (!file) { inp.remove(); return; }
    try {
      const url = await readFileAsDataURL(file);
      onFile({ name: file.name, url, size: file.size });
    } catch(e) {
      toast('❌ ' + e.message);
    }
    inp.remove();
  });
  inp.click();
}

// ── SUBVENCIONES ──────────────────────────────────────────
const LS_SUB = 'aemt_subvenciones';

const DEFAULT_SUBVENCIONES = [
  {
    id:'sv1', organismo:'Consejo Superior de Deportes (CSD)',
    descripcion:'Fomento deporte base y asociacionismo',
    estado:'en_preparacion', importe_solicitado:'5.000-15.000€',
    plazo:'Ene-Mar 2026', fecha_presentacion:'', importe_concedido:'',
    notas:'Requiere perspectiva de género obligatoria',
    documentos:[
      { id:'d1', nombre:'RNA inscrita con NIF definitivo', completado:false },
      { id:'d2', nombre:'Memoria de actividades previstas cuantificada', completado:false },
      { id:'d3', nombre:'Presupuesto detallado del ejercicio', completado:false },
      { id:'d4', nombre:'Certificados AEAT y TGSS al corriente', completado:false },
      { id:'d5', nombre:'Programa perspectiva de género (obligatorio)', completado:false },
      { id:'d6', nombre:'Programa deporte y salud mayores de 35 años', completado:false },
    ],
  },
  {
    id:'sv2', organismo:'Comunidad de Madrid — Dir. General Deportes',
    descripcion:'Subvenciones asociaciones deportivas CM',
    estado:'en_preparacion', importe_solicitado:'8.000-25.000€',
    plazo:'May-Jun 2026', fecha_presentacion:'', importe_concedido:'',
    notas:'Inscripción previa en rede@madrid.org',
    documentos:[
      { id:'d1', nombre:'Inscripción Registro Entidades Deportivas CM', completado:false },
      { id:'d2', nombre:'Domicilio social en Madrid acreditado', completado:false },
      { id:'d3', nombre:'Memoria actividades con indicadores cuantitativos', completado:false },
      { id:'d4', nombre:'Composición Junta Directiva actualizada', completado:false },
      { id:'d5', nombre:'Certificado de no deudas', completado:false },
    ],
  },
  {
    id:'sv3', organismo:'Ayuntamiento de Madrid',
    descripcion:'Madrid con el Deporte',
    estado:'pendiente_apertura', importe_solicitado:'2.000-8.000€',
    plazo:'Abr 2026', fecha_presentacion:'', importe_concedido:'',
    notas:'',
    documentos:[
      { id:'d1', nombre:'RNA + NIF definitivo', completado:false },
      { id:'d2', nombre:'Actividades demostrables en municipio de Madrid', completado:false },
      { id:'d3', nombre:'Presupuesto por actividad', completado:false },
    ],
  },
];

const SUBV_ESTADOS = {
  en_preparacion:   { label:'En preparación',     color:'#92400e', bg:'#fef3c7' },
  pendiente_apertura:{ label:'Pendiente apertura', color:'#6b7280', bg:'#f3f4f6' },
  presentada:       { label:'Presentada',          color:'#1d4ed8', bg:'#dbeafe' },
  en_revision:      { label:'En revisión',         color:'#7c3aed', bg:'#ede9fe' },
  concedida:        { label:'✅ Concedida',         color:'#15803d', bg:'#dcfce7' },
  denegada:         { label:'❌ Denegada',          color:'#dc2626', bg:'#fee2e2' },
  desistida:        { label:'Desistida',            color:'#9ca3af', bg:'#f9fafb' },
};

function loadSubvenciones() {
  try {
    const raw = localStorage.getItem(LS_SUB);
    if (raw) { const d = JSON.parse(raw); if (Array.isArray(d) && d.length) return d; }
    return DEFAULT_SUBVENCIONES.map(s => JSON.parse(JSON.stringify(s)));
  } catch { return DEFAULT_SUBVENCIONES.map(s => JSON.parse(JSON.stringify(s))); }
}

function saveSubvData(data) {
  localStorage.setItem(LS_SUB, JSON.stringify(data));
}

function renderSubvenciones() {
  const subvs = loadSubvenciones();
  const concedidas = subvs.filter(s => s.estado === 'concedida');
  const totalConcedido = concedidas.reduce((sum, s) => {
    const n = parseFloat((s.importe_concedido||'0').replace(/[^\d.]/g,''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Subvenciones</h2><p>${subvs.length} convocatorias · ${concedidas.length} concedidas</p></div>
      <button class="btn-adm-gold" onclick="openNuevaSubvencion()">+ Nueva subvención</button>
    </div>

    <div class="kpi-r">
      <div class="kpi"><div class="kpi-lb">Total convocatorias</div><div class="kpi-vl">${subvs.length}</div><div class="kpi-tr tg">Activas</div></div>
      <div class="kpi"><div class="kpi-lb">En preparación</div><div class="kpi-vl">${subvs.filter(s=>s.estado==='en_preparacion').length}</div><div class="kpi-tr tu">↑ Pendientes envío</div></div>
      <div class="kpi"><div class="kpi-lb">Concedidas</div><div class="kpi-vl" style="color:#16a34a">${concedidas.length}</div><div class="kpi-tr tu">✅ Aprobadas</div></div>
      <div class="kpi"><div class="kpi-lb">Importe concedido</div><div class="kpi-vl" style="color:#16a34a">${totalConcedido > 0 ? totalConcedido.toLocaleString('es-ES')+'€' : '—'}</div><div class="kpi-tr tu">YTD</div></div>
    </div>

    ${subvs.map(s => {
      const est = SUBV_ESTADOS[s.estado] || SUBV_ESTADOS.en_preparacion;
      const docsTotal = s.documentos.length;
      const docsOk    = s.documentos.filter(d => d.completado).length;
      const pct       = docsTotal ? Math.round(docsOk / docsTotal * 100) : 0;
      return `
      <div class="acard" style="margin-top:1rem">
        <div class="acard-hd">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
              <div class="acard-ti">${s.organismo}</div>
              <span style="font-size:.7rem;font-weight:800;padding:.18rem .55rem;border-radius:5px;background:${est.bg};color:${est.color}">${est.label}</span>
            </div>
            <div style="font-size:.75rem;color:var(--gr);margin-top:.2rem">${s.descripcion} · Plazo: <strong>${s.plazo}</strong> · Importe solicitado: <strong>${s.importe_solicitado}</strong>${s.importe_concedido ? ' · <span style="color:#16a34a;font-weight:700">Concedido: '+s.importe_concedido+'</span>':''}</div>
          </div>
          <div style="display:flex;gap:.4rem;flex-shrink:0">
            <button class="btn-adm-sm ghost" onclick="editSubvencion('${s.id}')">Editar</button>
            <button class="btn-adm-sm danger" onclick="deleteSubvencion('${s.id}')">Borrar</button>
          </div>
        </div>
        <div class="acard-bd">
          <!-- Progress bar -->
          <div style="display:flex;align-items:center;gap:.7rem;margin-bottom:1rem">
            <div style="flex:1;background:var(--gl2);border-radius:99px;height:8px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:${pct===100?'#16a34a':'var(--n)'};border-radius:99px;transition:.4s"></div>
            </div>
            <span style="font-size:.72rem;font-weight:800;color:${pct===100?'#16a34a':'var(--n)'};white-space:nowrap">${docsOk}/${docsTotal} docs · ${pct}%</span>
          </div>

          <!-- Documentos checklist -->
          <div style="display:grid;gap:.3rem;margin-bottom:.8rem">
            ${s.documentos.map((doc,di) => `
            <div style="display:flex;align-items:center;gap:.6rem;padding:.4rem .5rem;background:${doc.completado?'#f0fdf4':'var(--of)'};border-radius:7px;border:1px solid ${doc.completado?'#bbf7d0':'var(--gl2)'}">
              <input type="checkbox" ${doc.completado?'checked':''} style="accent-color:#16a34a;width:15px;height:15px;flex-shrink:0" onchange="toggleDocSubv('${s.id}',${di},this.checked)">
              <span style="flex:1;font-size:.8rem;color:var(--n);${doc.completado?'text-decoration:line-through;color:var(--gr)':''}">${doc.nombre}</span>
              ${doc.archivo
                ? `<a href="${doc.archivo.url}" download="${doc.archivo.name}" title="${doc.archivo.name}" style="font-size:.75rem;color:var(--g);text-decoration:none;white-space:nowrap">📄 Ver</a>
                   <button onclick="quitarArchivoDocSubv('${s.id}',${di})" style="background:none;border:none;cursor:pointer;font-size:.72rem;color:#dc2626;padding:.1rem .3rem;border-radius:4px" title="Quitar archivo">🗑️</button>`
                : `<button onclick="adjuntarDocSubv('${s.id}',${di})" style="background:none;border:1px solid var(--gl2);cursor:pointer;font-size:.72rem;color:var(--gr);padding:.15rem .5rem;border-radius:5px;white-space:nowrap" title="Adjuntar archivo">📎 Adjuntar</button>`
              }
              <button onclick="editDocSubv('${s.id}',${di})" style="background:none;border:none;cursor:pointer;font-size:.78rem;color:var(--gr);padding:.1rem .3rem;border-radius:4px" title="Editar">✏️</button>
              <button onclick="removeDocSubv('${s.id}',${di})" style="background:none;border:none;cursor:pointer;font-size:.78rem;color:#dc2626;padding:.1rem .3rem;border-radius:4px" title="Eliminar">✕</button>
            </div>`).join('')}
          </div>

          <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
            <button class="btn-adm-sm ghost" onclick="addDocSubv('${s.id}')">+ Añadir documento</button>
            ${s.notas ? `<span style="font-size:.72rem;color:var(--gr)">📝 ${s.notas}</span>` : ''}
          </div>
        </div>
      </div>`;
    }).join('')}`;
}

function toggleDocSubv(subvId, docIdx, checked) {
  const subvs = loadSubvenciones();
  const s = subvs.find(x => x.id === subvId);
  if (s && s.documentos[docIdx]) {
    s.documentos[docIdx].completado = checked;
    saveSubvData(subvs);
    renderSubvenciones();
  }
}
window.toggleDocSubv = toggleDocSubv;

function adjuntarDocSubv(subvId, docIdx) {
  pickFile('.pdf,.doc,.docx,.png,.jpg,.jpeg', archivo => {
    const subvs = loadSubvenciones();
    const s = subvs.find(x => x.id === subvId);
    if (s && s.documentos[docIdx]) {
      s.documentos[docIdx] = { ...s.documentos[docIdx], archivo };
      saveSubvData(subvs);
      renderSubvenciones();
      toast(`📎 "${archivo.name}" adjuntado`);
    }
  });
}
window.adjuntarDocSubv = adjuntarDocSubv;

function quitarArchivoDocSubv(subvId, docIdx) {
  const subvs = loadSubvenciones();
  const s = subvs.find(x => x.id === subvId);
  if (s && s.documentos[docIdx]) {
    const { archivo: _, ...rest } = s.documentos[docIdx];
    s.documentos[docIdx] = rest;
    saveSubvData(subvs);
    renderSubvenciones();
  }
}
window.quitarArchivoDocSubv = quitarArchivoDocSubv;

function addDocSubv(subvId) {
  const nombre = prompt('Nombre del documento:');
  if (!nombre || !nombre.trim()) return;
  const subvs = loadSubvenciones();
  const s = subvs.find(x => x.id === subvId);
  if (s) {
    s.documentos.push({ id:'d'+Date.now(), nombre: nombre.trim(), completado: false });
    saveSubvData(subvs);
    renderSubvenciones();
  }
}
window.addDocSubv = addDocSubv;

function editDocSubv(subvId, docIdx) {
  const subvs = loadSubvenciones();
  const s = subvs.find(x => x.id === subvId);
  if (!s) return;
  const nuevoNombre = prompt('Nombre del documento:', s.documentos[docIdx].nombre);
  if (!nuevoNombre || !nuevoNombre.trim()) return;
  s.documentos[docIdx].nombre = nuevoNombre.trim();
  saveSubvData(subvs);
  renderSubvenciones();
}
window.editDocSubv = editDocSubv;

function removeDocSubv(subvId, docIdx) {
  const subvs = loadSubvenciones();
  const s = subvs.find(x => x.id === subvId);
  if (!s || !confirm('¿Eliminar este documento?')) return;
  s.documentos.splice(docIdx, 1);
  saveSubvData(subvs);
  renderSubvenciones();
}
window.removeDocSubv = removeDocSubv;

function subvFormHtml(s = {}) {
  const isEdit = !!s.id;
  return `
    <div class="m-ti">${isEdit ? 'Editar Subvención' : 'Nueva Subvención'}</div>
    <div class="fg"><label>Organismo convocante</label><input type="text" id="sv-org" value="${(s.organismo||'').replace(/"/g,'&quot;')}" placeholder="Ej: Ministerio de Cultura y Deporte"></div>
    <div class="fg"><label>Descripción / Nombre convocatoria</label><input type="text" id="sv-desc" value="${(s.descripcion||'').replace(/"/g,'&quot;')}" placeholder="Ej: Ayudas a federaciones deportivas"></div>
    <div class="fr">
      <div class="fg"><label>Importe solicitado</label><input type="text" id="sv-imp" value="${s.importe_solicitado||''}" placeholder="Ej: 5.000€"></div>
      <div class="fg"><label>Plazo presentación</label><input type="text" id="sv-plz" value="${s.plazo||''}" placeholder="Ej: Ene-Mar 2026"></div>
    </div>
    <div class="fr">
      <div class="fg"><label>Estado</label>
        <select id="sv-est">
          ${Object.entries(SUBV_ESTADOS).map(([k,v])=>`<option value="${k}" ${s.estado===k?'selected':''}>${v.label}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label>Importe concedido (si aplica)</label><input type="text" id="sv-conc" value="${s.importe_concedido||''}" placeholder="Ej: 8.000€"></div>
    </div>
    <div class="fg"><label>Notas</label><textarea id="sv-not" style="height:65px">${s.notas||''}</textarea></div>
    <button class="m-fsb" onclick="saveSubvencion('${s.id||''}')">Guardar</button>`;
}

function openNuevaSubvencion() { openModal(subvFormHtml()); }
window.openNuevaSubvencion = openNuevaSubvencion;

function editSubvencion(id) {
  const s = loadSubvenciones().find(x => x.id === id);
  if (!s) { toast('⚠️ No encontrada'); return; }
  openModal(subvFormHtml(s));
}
window.editSubvencion = editSubvencion;

function saveSubvencion(id) {
  const organismo = q('#sv-org').value.trim();
  if (!organismo) { toast('⚠️ El organismo es obligatorio'); return; }
  const subvs = loadSubvenciones();
  const base = id ? (subvs.find(x => x.id === id) || {}) : {};
  const updated = {
    ...base,
    id:                 id || ('sv' + Date.now()),
    organismo,
    descripcion:        q('#sv-desc').value.trim(),
    importe_solicitado: q('#sv-imp').value.trim(),
    plazo:              q('#sv-plz').value.trim(),
    estado:             q('#sv-est').value,
    importe_concedido:  q('#sv-conc').value.trim(),
    notas:              q('#sv-not').value.trim(),
    documentos:         base.documentos || [],
  };
  if (id) {
    saveSubvData(subvs.map(x => x.id === id ? updated : x));
  } else {
    saveSubvData([...subvs, updated]);
  }
  closeModal();
  toast('✅ Subvención guardada');
  renderSubvenciones();
}
window.saveSubvencion = saveSubvencion;

function deleteSubvencion(id) {
  const s = loadSubvenciones().find(x => x.id === id);
  if (!confirm(`¿Eliminar la subvención de "${s ? s.organismo : id}"?`)) return;
  saveSubvData(loadSubvenciones().filter(x => x.id !== id));
  toast('✅ Subvención eliminada');
  renderSubvenciones();
}
window.deleteSubvencion = deleteSubvencion;

// Compat alias — old checkbox system no longer needed
window.saveSubvCheck = function() {};

// ── LEGAL ─────────────────────────────────────────────────
const LS_LEGAL_FILES = 'aemt_legal_files';

function loadLegalFiles() {
  try { return JSON.parse(localStorage.getItem(LS_LEGAL_FILES) || '{}'); } catch { return {}; }
}
function saveLegalFiles(data) {
  try { localStorage.setItem(LS_LEGAL_FILES, JSON.stringify(data)); } catch {}
}

function adjuntarDocLegal(docKey) {
  pickFile('.pdf,.doc,.docx,.png,.jpg,.jpeg', archivo => {
    const files = loadLegalFiles();
    files[docKey] = archivo;
    saveLegalFiles(files);
    renderLegal();
    toast(`📎 "${archivo.name}" adjuntado`);
  });
}
window.adjuntarDocLegal = adjuntarDocLegal;

function quitarArchivoLegal(docKey) {
  const files = loadLegalFiles();
  delete files[docKey];
  saveLegalFiles(files);
  renderLegal();
}
window.quitarArchivoLegal = quitarArchivoLegal;

function renderLegal() {
  const files = loadLegalFiles();
  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Estado Legal</h2><p>Documentación y trámites registrales</p></div>
    </div>
    <div class="acard">
      <div class="acard-hd"><div class="acard-ti">Todos los documentos AEMT</div></div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Documento</th><th>Versión</th><th>Estado</th><th>Acción requerida</th><th>Archivo</th></tr></thead>
          <tbody>${LEGAL_DOCS.map((d, i) => {
            const f = files[d.d];
            return `<tr style="background:${i%2?'var(--of)':'white'}">
              <td style="font-weight:700;font-size:.82rem;color:var(--n)">${d.d}</td>
              <td style="font-size:.76rem;color:var(--gr)">${d.v}</td>
              <td><span style="font-size:.76rem;font-weight:700;color:${d.c}">${d.s}</span></td>
              <td style="font-size:.76rem;color:var(--gr)">${d.a}</td>
              <td style="white-space:nowrap">
                ${f
                  ? `<a href="${f.url}" download="${f.name}" title="${f.name}" style="font-size:.75rem;color:var(--g);text-decoration:none;margin-right:.4rem">📄 ${f.name.length>18?f.name.slice(0,18)+'…':f.name}</a>
                     <button onclick="quitarArchivoLegal('${d.d.replace(/'/g,"\\'")}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:.75rem" title="Quitar">🗑️</button>`
                  : `<button onclick="adjuntarDocLegal('${d.d.replace(/'/g,"\\'")}')" style="background:none;border:1px solid var(--gl2);cursor:pointer;font-size:.72rem;color:var(--gr);padding:.15rem .5rem;border-radius:5px">📎 Adjuntar</button>`
                }
              </td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ── STATIC DATA ───────────────────────────────────────────
const TASKS = [
  { u:'HOY',   c:'tu-n', t:'Imprimir Estatutos FINAL y firmar con los 4 fundadores' },
  { u:'SEM 1', c:'tu-s', t:'Obtener certificado digital FNMT (sede.fnmt.es)' },
  { u:'SEM 1', c:'tu-s', t:'Presentar inscripción RNA en sede.mjusticia.gob.es' },
  { u:'SEM 1', c:'tu-s', t:'Alta censal AEAT — Modelo 036' },
  { u:'MES 1', c:'tu-o', t:'Abrir cuenta bancaria AEMT (Presidente con autonomía total)' },
  { u:'MES 2', c:'tu-o', t:'Constituir AEMT Gestión SL ante notario' },
];

const DOCS = [
  { d:'Estatutos FINAL (35 arts.)',       s:'✅ Listo para RNA',    bg:'#EEF7F2', c:'var(--grn)', cls:'ok' },
  { d:'Acta Fundacional FINAL (9 acu.)',  s:'✅ Lista para firmar', bg:'#EEF7F2', c:'var(--grn)', cls:'ok' },
  { d:'Reglamento Régimen Interno',       s:'✅ Operativo',         bg:'#EEF7F2', c:'var(--grn)', cls:'ok' },
  { d:'Contrato de Adhesión',             s:'✅ Modelo oficial',    bg:'#EEF7F2', c:'var(--grn)', cls:'ok' },
  { d:'Reglamento Competición',           s:'✅ Listo para eventos',bg:'#EEF7F2', c:'var(--grn)', cls:'ok' },
  { d:'Solicitud RNA',                    s:'⏳ Pendiente presentar',bg:'#FEF9EE',c:'var(--gd)',  cls:'warn' },
  { d:'NIF / Modelo 036',                 s:'⏳ Tras RNA',          bg:'#FEF9EE', c:'var(--gd)',  cls:'warn' },
  { d:'AEMT Gestión SL',                  s:'📋 Mes 2',             bg:'#EBF0FB', c:'var(--n)',   cls:'info' },
  { d:'Seguro RC General',                s:'📋 Pendiente cotizar', bg:'#EBF0FB', c:'var(--n)',   cls:'info' },
];

const TRANSACTIONS = [
  { d:'10 Mar 26', t:'Cuotas × 12 abonados',      i:'+720€', p:true  },
  { d:'08 Mar 26', t:'Seguro RC (AXA)',             i:'-280€', p:false },
  { d:'05 Mar 26', t:'Notaría AEMT Gestión SL',    i:'-450€', p:false },
  { d:'01 Mar 26', t:'Cuotas × 8 abonados',        i:'+480€', p:true  },
  { d:'25 Feb 26', t:'Hosting + dominio aemt.es',  i:'-120€', p:false },
];

const GRANTS = [
  { o:'CSD',                 s:'En preparación',    d:'Fomento deporte base',   i:'8.000€',  c:'var(--g)'  },
  { o:'Comunidad de Madrid', s:'En preparación',    d:'Asoc. Deportivas CM',    i:'12.000€', c:'var(--g)'  },
  { o:'Ayto. Madrid',        s:'Pendiente apertura',d:'Madrid con el Deporte',  i:'3.000€',  c:'var(--gr)' },
];

const SUBVENCIONES = [
  {
    o:'Consejo Superior de Deportes (CSD)', l:'Fomento deporte base y asociacionismo',
    p:'Ene-Mar 2026', i:'5.000-15.000€',
    r:['RNA inscrita con NIF definitivo','Memoria de actividades previstas cuantificada','Presupuesto detallado del ejercicio','Certificados AEAT y TGSS al corriente','Programa perspectiva de género (obligatorio)','Programa deporte y salud mayores de 35 años'],
  },
  {
    o:'Comunidad de Madrid — Dir. General Deportes', l:'Subvenciones asociaciones deportivas CM',
    p:'May-Jun 2026', i:'8.000-25.000€',
    r:['Inscripción Registro Entidades Deportivas CM (rede@madrid.org)','Domicilio social en Madrid acreditado','Memoria actividades con indicadores cuantitativos','Composición JD actualizada','Certificado de no deudas'],
  },
  {
    o:'Ayuntamiento de Madrid', l:'Madrid con el Deporte',
    p:'Abr 2026', i:'2.000-8.000€',
    r:['RNA + NIF definitivo','Actividades demostrables en municipio de Madrid','Presupuesto por actividad'],
  },
];

const LEGAL_DOCS = [
  { d:'Estatutos AEMT',           v:'FINAL · 35 arts · Mar 2026',     s:'✅ Listo',    c:'var(--grn)', a:'Imprimir y firmar. Presentar al RNA.' },
  { d:'Acta Fundacional',         v:'FINAL · 9 acuerdos · Mar 2026',  s:'✅ Lista',    c:'var(--grn)', a:'Firmar físicamente con los 4 fundadores.' },
  { d:'Reglamento Régimen Interno',v:'2026 · 24 arts.',               s:'✅ Operativo',c:'var(--grn)', a:'Aprobar en primera Asamblea Ordinaria.' },
  { d:'Contrato de Adhesión',     v:'Modelo oficial 2026',             s:'✅ Operativo',c:'var(--grn)', a:'Usar para cada nuevo abonado.' },
  { d:'Reglamento Competición',   v:'2026 · 17 arts.',                 s:'✅ Operativo',c:'var(--grn)', a:'Publicar en web antes del primer evento.' },
  { d:'Solicitud RNA',            v:'—',                               s:'⏳ Pendiente',c:'var(--gd)',  a:'sede.mjusticia.gob.es con cert. digital' },
  { d:'NIF / Modelo 036',         v:'—',                               s:'⏳ Pendiente',c:'var(--gd)',  a:'AEAT tras presentar RNA' },
  { d:'Cuenta bancaria AEMT',     v:'Presidente autonomía total',      s:'⏳ Pendiente',c:'var(--gd)',  a:'Abrir con NIF provisional' },
  { d:'AEMT Gestión SL',          v:'Capital mínimo 3.000€',           s:'📋 Mes 2',   c:'var(--n)',   a:'Notaría + Registro Mercantil Madrid' },
  { d:'Marca AEMT (OEPM)',        v:'Clases 41, 35, 36',               s:'📋 Mes 2-3', c:'var(--n)',   a:'oepm.es · ~550€' },
];

// ── PAGOS ─────────────────────────────────────────────────
async function renderPagos() {
  const cfg = await fetchConfig('pagos') || {};
  const t = cfg.transferencia || {};
  const stripe = cfg.stripe || {};
  const redsys = cfg.redsys || {};
  const m = cfg.metodos || { transferencia: true, domiciliacion: false, stripe: false, redsys: false };

  q('#admMain').innerHTML = `
    <div class="adm-topbar">
      <div class="adm-tt"><h2>Configuración de Pagos</h2><p>Métodos de pago y datos bancarios visibles en el formulario de adhesión</p></div>
      <button class="btn-adm-gold" onclick="savePagos()">Guardar cambios</button>
    </div>

    <div class="acard" style="margin-bottom:1rem">
      <div class="acard-hd"><div class="acard-ti">Métodos activos</div></div>
      <div class="acard-bd" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.8rem">
        <label style="display:flex;align-items:center;gap:.6rem;font-size:.85rem;cursor:pointer">
          <input type="checkbox" id="pg-m-tr" ${m.transferencia?'checked':''} style="accent-color:var(--n)"> Transferencia bancaria
        </label>
        <label style="display:flex;align-items:center;gap:.6rem;font-size:.85rem;cursor:pointer">
          <input type="checkbox" id="pg-m-do" ${m.domiciliacion?'checked':''} style="accent-color:var(--n)"> Domiciliación bancaria (SEPA)
        </label>
        <label style="display:flex;align-items:center;gap:.6rem;font-size:.85rem;cursor:pointer">
          <input type="checkbox" id="pg-m-st" ${m.stripe?'checked':''} style="accent-color:var(--n)"> Stripe (tarjeta)
        </label>
        <label style="display:flex;align-items:center;gap:.6rem;font-size:.85rem;cursor:pointer">
          <input type="checkbox" id="pg-m-re" ${m.redsys?'checked':''} style="accent-color:var(--n)"> Redsys (tarjeta)
        </label>
      </div>
    </div>

    <div class="acard" style="margin-bottom:1rem">
      <div class="acard-hd"><div class="acard-ti">Transferencia bancaria</div></div>
      <div class="acard-bd">
        <div class="fr">
          <div class="fg"><label>Titular de la cuenta</label><input type="text" id="pg-tr-titular" value="${t.titular||''}" placeholder="Ej: Asociación Española de Taekwondo Masters"></div>
          <div class="fg"><label>IBAN</label><input type="text" id="pg-tr-iban" value="${t.iban||''}" placeholder="ES00 0000 0000 00 0000000000"></div>
        </div>
        <div class="fr">
          <div class="fg"><label>Banco</label><input type="text" id="pg-tr-banco" value="${t.banco||''}" placeholder="Ej: CaixaBank"></div>
          <div class="fg"><label>Concepto de pago</label><input type="text" id="pg-tr-concepto" value="${t.concepto||'Cuota AEMT 2026 - [NOMBRE]'}" placeholder="Cuota AEMT 2026 - [NOMBRE]"></div>
        </div>
      </div>
    </div>

    <div class="acard" style="margin-bottom:1rem">
      <div class="acard-hd"><div class="acard-ti">Stripe</div></div>
      <div class="acard-bd">
        <div class="fg"><label>Enlace de pago Stripe (Payment Link)</label><input type="url" id="pg-st-link" value="${stripe.link||''}" placeholder="https://buy.stripe.com/..."></div>
        <p style="font-size:.75rem;color:var(--gr);margin-top:.3rem">Crea un Payment Link en dashboard.stripe.com → Payment Links. Importe: 60 €.</p>
      </div>
    </div>

    <div class="acard">
      <div class="acard-hd"><div class="acard-ti">Redsys</div></div>
      <div class="acard-bd">
        <div class="fg"><label>Enlace de pago Redsys</label><input type="url" id="pg-re-link" value="${redsys.link||''}" placeholder="https://sis.redsys.es/..."></div>
        <p style="font-size:.75rem;color:var(--gr);margin-top:.3rem">Introduce el enlace de tu terminal virtual Redsys. Solicítalo a tu banco.</p>
      </div>
    </div>`;
}

async function savePagos() {
  const cfg = {
    metodos: {
      transferencia: q('#pg-m-tr').checked,
      domiciliacion: q('#pg-m-do').checked,
      stripe:        q('#pg-m-st').checked,
      redsys:        q('#pg-m-re').checked,
    },
    transferencia: {
      titular:  q('#pg-tr-titular').value.trim(),
      iban:     q('#pg-tr-iban').value.trim().replace(/\s/g,'').toUpperCase(),
      banco:    q('#pg-tr-banco').value.trim(),
      concepto: q('#pg-tr-concepto').value.trim(),
    },
    stripe:  { link: q('#pg-st-link').value.trim() },
    redsys:  { link: q('#pg-re-link').value.trim() },
  };
  const { error } = await saveConfig('pagos', cfg);
  if (error) toast('❌ Error al guardar: ' + (error.message || 'desconocido'));
  else toast('✅ Configuración de pagos guardada');
}
window.savePagos = savePagos;

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  await checkAuth();
  renderTab('dash');
});
