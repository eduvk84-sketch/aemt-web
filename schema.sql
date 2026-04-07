-- ============================================================
-- AEMT — schema.sql
-- Ejecuta este SQL en Supabase: SQL Editor → New query → Run
-- ============================================================

-- ── EXTENSIONES ───────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── TABLA: abonados ───────────────────────────────────────
create table if not exists public.abonados (
  id                  uuid primary key default uuid_generate_v4(),
  nombre              text not null,
  apellidos           text not null,
  email               text not null,
  telefono            text,
  plan                text not null check (plan in ('estandar','joven','colaborador')),
  comunidad_autonoma  text,
  cinturon            text,
  nacionalidad        text default 'Española',
  federacion          text default 'RFTKD',
  club                text,
  estado              text not null default 'pendiente' check (estado in ('activo','pendiente','inactivo')),
  notas               text,
  fecha_solicitud     timestamptz default now(),
  created_at          timestamptz default now()
);

-- ── TABLA: eventos ────────────────────────────────────────
create table if not exists public.eventos (
  id                    bigint primary key generated always as identity,
  titulo                text not null,
  lugar                 text,
  fecha                 date,
  tipo                  text check (tipo in ('campeonato','liga','expedicion','seminario','social')),
  url_web               text,
  precio                text,
  categorias            text,
  descripcion           text,
  circular              text,
  plazas_total          int default 0,
  plazas_ocupadas       int default 0,
  inscripciones_abiertas boolean default true,
  destacado             boolean default false,
  publicado             boolean default true,
  inscritos             jsonb default '[]'::jsonb,
  created_at            timestamptz default now()
);

-- ── TABLA: ranking ────────────────────────────────────────
create table if not exists public.ranking (
  id          text primary key,
  posicion    int not null,
  nombre      text not null,
  club        text,
  categoria   text,
  sexo        text default 'M' check (sexo in ('M','F')),
  nivel       text default 'competitivo',
  comunidad   text,
  eventos     int default 0,
  puntos      int default 0,
  created_at  timestamptz default now()
);

-- ── TABLA: noticias ───────────────────────────────────────
create table if not exists public.noticias (
  id                  bigint primary key generated always as identity,
  titulo              text not null,
  categoria           text,
  emoji               text default '📰',
  extracto            text,
  contenido           text,
  publicada           boolean default false,
  destacada           boolean default false,
  fecha_publicacion   date default current_date,
  created_at          timestamptz default now()
);

-- ── TABLA: contactos ──────────────────────────────────────
create table if not exists public.contactos (
  id        bigint primary key generated always as identity,
  nombre    text,
  email     text,
  asunto    text,
  mensaje   text,
  leido     boolean default false,
  fecha     timestamptz default now()
);

-- ── TABLA: configuracion ──────────────────────────────────
-- Guarda configuración de portada, puntos, acceso, etc.
create table if not exists public.configuracion (
  clave   text primary key,
  valor   jsonb not null,
  updated_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
alter table public.abonados     enable row level security;
alter table public.eventos      enable row level security;
alter table public.ranking      enable row level security;
alter table public.noticias     enable row level security;
alter table public.contactos    enable row level security;
alter table public.configuracion enable row level security;

-- EVENTOS: lectura pública de eventos publicados
create policy "Eventos públicos visibles"
  on public.eventos for select
  using (publicado = true);

-- RANKING: lectura pública total
create policy "Ranking público"
  on public.ranking for select
  using (true);

-- NOTICIAS: lectura pública de noticias publicadas
create policy "Noticias públicas"
  on public.noticias for select
  using (publicada = true);

-- ABONADOS: solo autenticados pueden leer
create policy "Abonados solo admins"
  on public.abonados for select
  to authenticated
  using (true);

create policy "Abonados insert autenticados"
  on public.abonados for insert
  to authenticated
  with check (true);

create policy "Abonados update autenticados"
  on public.abonados for update
  to authenticated
  using (true);

create policy "Abonados delete autenticados"
  on public.abonados for delete
  to authenticated
  using (true);

-- ABONADOS: el propio visitante puede insertar su solicitud (anon)
create policy "Solicitud adhesion publica"
  on public.abonados for insert
  to anon
  with check (estado = 'pendiente');

-- CONTACTOS: cualquiera puede insertar
create policy "Contactos insert publico"
  on public.contactos for insert
  to anon, authenticated
  with check (true);

-- CONTACTOS: solo admins leen
create policy "Contactos solo admins"
  on public.contactos for select
  to authenticated
  using (true);

-- EVENTOS: admins gestionan
create policy "Eventos admin insert"
  on public.eventos for insert to authenticated with check (true);
create policy "Eventos admin update"
  on public.eventos for update to authenticated using (true);
create policy "Eventos admin delete"
  on public.eventos for delete to authenticated using (true);

-- RANKING: admins gestionan
create policy "Ranking admin insert"
  on public.ranking for insert to authenticated with check (true);
create policy "Ranking admin update"
  on public.ranking for update to authenticated using (true);
create policy "Ranking admin delete"
  on public.ranking for delete to authenticated using (true);

-- NOTICIAS: admins gestionan
create policy "Noticias admin insert"
  on public.noticias for insert to authenticated with check (true);
create policy "Noticias admin update"
  on public.noticias for update to authenticated using (true);
create policy "Noticias admin delete"
  on public.noticias for delete to authenticated using (true);

-- CONFIGURACION: admins leen y escriben
create policy "Config admin select"
  on public.configuracion for select to authenticated using (true);
create policy "Config admin upsert"
  on public.configuracion for insert to authenticated with check (true);
create policy "Config admin update"
  on public.configuracion for update to authenticated using (true);

-- ── DATOS INICIALES ───────────────────────────────────────
-- Eventos de ejemplo
insert into public.eventos (titulo, lugar, fecha, tipo, url_web, precio, categorias, descripcion, plazas_total, plazas_ocupadas, inscripciones_abiertas, destacado, publicado) values
  ('AEMT Open Madrid 2026', 'Pabellón Municipal Vallecas', '2026-03-15', 'campeonato', 'https://aemt.es/open-madrid-2026', '25€', 'M35, M40, M45, M50, M55, M60', 'Primer campeonato oficial de la AEMT. Reglamento WT.', 200, 127, true, true, true),
  ('Liga AEMT — Jornada 1', 'Centro Deportivo Madrid Sur', '2026-05-10', 'campeonato', '', '15€', 'M35, M40, M45, M50', 'Primera jornada de la Liga AEMT 2026.', 120, 84, true, false, true),
  ('USA Master Cup — Los Ángeles', 'Los Ángeles, California', '2026-06-20', 'expedicion', 'https://usamastercup.com', 'Consultar', 'Todas', 'Expedición oficial AEMT al torneo más importante de la categoría Master en EE.UU.', 25, 18, true, false, true),
  ('AEMT Summer Camp Internacional', 'Residencia Blume, Madrid', '2026-08-02', 'seminario', '', '180€', 'Todas', 'Campus de tecnificación con entrenadores internacionales. 5 días en la Residencia Blume.', 70, 42, true, false, true),
  ('European Masters Championships', 'Rotterdam, Países Bajos', '2026-09-27', 'expedicion', '', 'Consultar', 'M40, M45, M50, M55', 'Campeonato Europeo de la categoría Masters.', 20, 11, false, false, true),
  ('Gran Final AEMT + Gala de Clausura', 'Palacio de Exposiciones, Madrid', '2026-12-13', 'social', '', 'Gala: 40€', 'Todas', 'Gran Final de la temporada 2026 y entrega de trofeos.', 300, 175, false, false, true)
on conflict do nothing;

-- Ranking inicial
insert into public.ranking (id, posicion, nombre, club, categoria, sexo, nivel, comunidad, eventos, puntos) values
  ('r1', 1, 'Eduardo Lozano Moreno', 'Club Kyoto Vallecas', 'M40', 'M', 'competitivo', 'Madrid', 4, 1240),
  ('r2', 2, 'Carlos Mendez García',  'Club TKD Sevilla',    'M45', 'M', 'competitivo', 'Andalucía', 3, 980),
  ('r3', 3, 'Javier Torres Ruiz',    'Club TKD Barcelona',  'M40', 'M', 'competitivo', 'Cataluña', 4, 870),
  ('r4', 4, 'Agapito Gómez Pérez',   'Club Kyoto Vallecas', 'M50', 'M', 'competitivo', 'Madrid', 4, 720),
  ('r5', 5, 'Yasmin Chaouani',        'Club Kyoto Vallecas', 'F35', 'F', 'competitivo', 'Madrid', 3, 680),
  ('r6', 6, 'Roberto Fernández',      'Club TKD Bilbao',     'M45', 'M', 'recreativo',  'País Vasco', 2, 540),
  ('r7', 7, 'Ana González Prado',     'Club TKD Vigo',       'F35', 'F', 'competitivo', 'Galicia', 3, 510),
  ('r8', 8, 'Pedro Martínez Vidal',   'Club TKD Zaragoza',   'M40', 'M', 'recreativo',  'Aragón', 2, 420)
on conflict (id) do nothing;

-- Noticias iniciales
insert into public.noticias (titulo, categoria, emoji, extracto, contenido, publicada, destacada, fecha_publicacion) values
  ('Eduardo Lozano se corona Campeón de los Juegos Mundiales Master en Taiwán', 'Campeón Mundial', '🥇',
   'El fundador de la AEMT alcanzó la cima de su carrera en Taipéi ante 25.000 atletas de 108 países.',
   'Eduardo Lozano Moreno, presidente y fundador de la AEMT, escribió la página más brillante de su carrera deportiva al proclamarse Campeón de los Juegos Mundiales Master de Taekwondo celebrados en Taipéi (Taiwán) en julio de 2025.\n\nEl torneo reunió a 25.000 atletas procedentes de 108 países. Eduardo compitió en la categoría M40 y superó a rivales de Corea, EE.UU. y Brasil en las rondas finales.\n\n«Este título es para todos los que creen que a los 40 años todavía puedes ser el mejor del mundo.»',
   true, true, '2025-07-15'),
  ('Nace la AEMT: la primera asociación nacional del taekwondo Master español', 'Asociación', '📋',
   'Los cuatro socios fundadores firman el Acta Fundacional en Madrid. 35 artículos estatutarios.',
   'El 16 de marzo de 2026, en Madrid, los cuatro socios fundadores firmaron el Acta Fundacional de la AEMT.\n\nLa asociación nace con Estatutos de 35 artículos, un Reglamento de Régimen Interno de 24 artículos, un Reglamento de Competición de 17 artículos y un Acta Fundacional con 9 acuerdos.\n\nLa misión: dar estructura, visibilidad y oportunidades a los practicantes de taekwondo mayores de 35 años en España.',
   true, false, '2026-03-16'),
  ('Confirmada expedición al USA Master Cup 2026 en Los Ángeles', 'Internacional', '✈️',
   '25 plazas disponibles para la primera expedición organizada de la historia de la AEMT.',
   'La AEMT ha confirmado su primera expedición oficial al USA Master Cup 2026 en Los Ángeles.\n\nSe han habilitado 25 plazas para deportistas federados. La expedición incluye coordinación de viajes, alojamiento y acompañamiento técnico durante la competición.\n\nFecha límite de inscripción: 15 de mayo de 2026.',
   true, false, '2026-03-01')
on conflict do nothing;
