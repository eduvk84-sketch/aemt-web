// ============================================================
// AEMT — js/config.js
// Supabase project credentials
//
// INSTRUCCIONES DE CONFIGURACIÓN:
// 1. Ve a https://supabase.com y crea un proyecto gratuito
// 2. En tu proyecto: Settings → API
// 3. Copia "Project URL" y "anon public key"
// 4. Reemplaza los valores de abajo
// 5. Ejecuta el SQL de schema.sql en el SQL Editor de Supabase
// ============================================================

const SUPABASE_URL  = 'https://oyhbdzefmofijaaerpkn.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aGJkemVmbW9maWphYWVycGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODM2MTksImV4cCI6MjA5MTE1OTYxOX0.FdmwlIhGs-bFO3tlMcXySXhYYAmNrbgmfaWe1QE7BQY';

// ── STATIC FALLBACK DATA ──────────────────────────────────
// Se usa cuando Supabase no está configurado todavía
// o cuando no hay conexión. La web funciona sin backend.

const STATIC_EVENTS = [
  { id:1, titulo:'AEMT Open Madrid 2026', lugar:'Pabellón Municipal Vallecas', fecha:'2026-03-15', tipo:'campeonato', destacado:true,  plazas_total:200, plazas_ocupadas:127, inscripciones_abiertas:true,  url_web:'https://aemt.es/open-madrid-2026', precio:'25€', categorias:'M35, M40, M45, M50, M55, M60', descripcion:'Primer campeonato oficial de la AEMT. Reglamento WT. Competición por categorías de edad.', circular:'Estimados competidores, os comunicamos los detalles del AEMT Open Madrid 2026...', inscritos:[] },
  { id:2, titulo:'Liga AEMT — Jornada 1',  lugar:'Centro Deportivo Madrid Sur', fecha:'2026-05-10', tipo:'campeonato', destacado:false, plazas_total:120, plazas_ocupadas:84,  inscripciones_abiertas:true,  url_web:'https://aemt.es/liga-2026-j1', precio:'15€', categorias:'M35, M40, M45, M50', descripcion:'Primera jornada de la Liga AEMT 2026. Puntos para el ranking oficial.', circular:'', inscritos:[] },
  { id:3, titulo:'USA Master Cup — Los Ángeles', lugar:'Los Ángeles, California (EE.UU.)', fecha:'2026-06-20', tipo:'expedicion', destacado:false, plazas_total:25, plazas_ocupadas:18, inscripciones_abiertas:true,  url_web:'https://usamastercup.com', precio:'Consultar', categorias:'Todas', descripcion:'Expedición oficial AEMT al torneo más importante de la categoría Master en EE.UU.', circular:'Circular de expedición USA Master Cup 2026. Plazas limitadas a 25 deportistas...', inscritos:[] },
  { id:4, titulo:'AEMT Summer Camp Internacional', lugar:'Residencia Blume, Madrid', fecha:'2026-08-02', tipo:'seminario', destacado:false, plazas_total:70, plazas_ocupadas:42, inscripciones_abiertas:true,  url_web:'https://aemt.es/summer-camp-2026', precio:'180€ (alojamiento incl.)', categorias:'Todas', descripcion:'Campus de tecnificación con entrenadores internacionales. 5 días en la Residencia Blume.', circular:'', inscritos:[] },
  { id:5, titulo:'European Masters Championships', lugar:'Rotterdam, Países Bajos', fecha:'2026-09-27', tipo:'expedicion', destacado:false, plazas_total:20, plazas_ocupadas:11, inscripciones_abiertas:false, url_web:'https://europeanmasters2026.eu', precio:'Consultar', categorias:'M40, M45, M50, M55', descripcion:'Campeonato Europeo de la categoría Masters. Representación oficial AEMT.', circular:'', inscritos:[] },
  { id:6, titulo:'Liga AEMT — Jornada 3', lugar:'Polideportivo Norte, Madrid', fecha:'2026-10-18', tipo:'campeonato', destacado:false, plazas_total:120, plazas_ocupadas:96, inscripciones_abiertas:false, url_web:'https://aemt.es/liga-2026-j3', precio:'15€', categorias:'M35, M40, M45, M50', descripcion:'Tercera jornada de la Liga AEMT 2026. Penúltima cita del ranking.', circular:'', inscritos:[] },
  { id:7, titulo:'Gran Final AEMT + Gala de Clausura', lugar:'Palacio de Exposiciones, Madrid', fecha:'2026-12-13', tipo:'social', destacado:false, plazas_total:300, plazas_ocupadas:175, inscripciones_abiertas:false, url_web:'https://aemt.es/gran-final-2026', precio:'Gala: 40€', categorias:'Todas', descripcion:'Gran Final de la temporada 2026 y entrega de trofeos del ranking anual. Gala de clausura.', circular:'', inscritos:[] },
];

const STATIC_RANKING = [
  { id:'r1', posicion:1, nombre:'Eduardo Lozano Moreno', club:'Club Kyoto Vallecas', categoria:'M40', comunidad:'Madrid',     eventos:4, puntos:1240, sexo:'M', nivel:'competitivo' },
  { id:'r2', posicion:2, nombre:'Carlos Mendez García',  club:'Club TKD Sevilla',    categoria:'M45', comunidad:'Andalucía',  eventos:3, puntos:980,  sexo:'M', nivel:'competitivo' },
  { id:'r3', posicion:3, nombre:'Javier Torres Ruiz',    club:'Club TKD Barcelona',  categoria:'M40', comunidad:'Cataluña',   eventos:4, puntos:870,  sexo:'M', nivel:'competitivo' },
  { id:'r4', posicion:4, nombre:'Agapito Gómez Pérez',   club:'Club Kyoto Vallecas', categoria:'M50', comunidad:'Madrid',     eventos:4, puntos:720,  sexo:'M', nivel:'competitivo' },
  { id:'r5', posicion:5, nombre:'Yasmin Chaouani',        club:'Club Kyoto Vallecas', categoria:'F35', comunidad:'Madrid',    eventos:3, puntos:680,  sexo:'F', nivel:'competitivo' },
  { id:'r6', posicion:6, nombre:'Roberto Fernández',      club:'Club TKD Bilbao',     categoria:'M45', comunidad:'País Vasco',eventos:2, puntos:540,  sexo:'M', nivel:'recreativo'  },
  { id:'r7', posicion:7, nombre:'Ana González Prado',     club:'Club TKD Vigo',       categoria:'F35', comunidad:'Galicia',   eventos:3, puntos:510,  sexo:'F', nivel:'competitivo' },
  { id:'r8', posicion:8, nombre:'Pedro Martínez Vidal',   club:'Club TKD Zaragoza',   categoria:'M40', comunidad:'Aragón',    eventos:2, puntos:420,  sexo:'M', nivel:'recreativo'  },
];

const STATIC_NEWS = [
  { id:1, categoria:'Campeón Mundial', fecha_publicacion:'2025-07-15', emoji:'🥇', publicada:true, titulo:'Eduardo Lozano se corona Campeón de los Juegos Mundiales Master en Taiwán', extracto:'El fundador de la AEMT alcanzó la cima de su carrera en Taipéi ante 25.000 atletas de 108 países. Una hazaña que catapulta el taekwondo Master español al mapa mundial.', contenido:'Eduardo Lozano Moreno, presidente y fundador de la AEMT, escribió la página más brillante de su carrera deportiva al proclamarse Campeón de los Juegos Mundiales Master de Taekwondo celebrados en Taipéi (Taiwán) en julio de 2025.\n\nEl torneo reunió a 25.000 atletas procedentes de 108 países, convirtiéndose en el mayor evento de taekwondo Master de la historia. Eduardo compitió en la categoría M40 y superó a rivales de Corea, EE.UU. y Brasil en las rondas finales.\n\nEsta medalla de oro no solo supone el mayor logro personal de Eduardo, sino un hito histórico para el taekwondo Master español, que por primera vez ve a uno de los suyos en lo más alto del podio mundial.\n\n«Este título es para todos los que creen que a los 40 años todavía puedes ser el mejor del mundo», declaró el campeón tras recoger su medalla.\n\nEl logro fue el detonante directo para la fundación de la AEMT en marzo de 2026, con la misión de dar estructura y visibilidad internacional al taekwondo Master en España.', destacada:true },
  { id:2, categoria:'Asociación',      fecha_publicacion:'2026-03-16', emoji:'📋', publicada:true, titulo:'Nace la AEMT: la primera asociación nacional del taekwondo Master español', extracto:'Los cuatro socios fundadores firman el Acta Fundacional en Madrid. 35 artículos estatutarios, 5 documentos fundacionales y una visión de largo alcance.', contenido:'El 16 de marzo de 2026, en Madrid, los cuatro socios fundadores de la Asociación Española de Taekwondo Masters (AEMT) firmaron el Acta Fundacional, un documento que marca el inicio de una nueva era para el taekwondo Master en España.\n\nEduardo Lozano (Presidente), Tatiana Martín (Secretaria), M.ª Luisa Lozano (Vicepresidenta) y Francisco Lozano (Tesorero) rubricaron juntos los cinco documentos fundacionales que dan forma jurídica y deportiva a la asociación.\n\nLa AEMT nace con unos Estatutos de 35 artículos, un Reglamento de Régimen Interno de 24 artículos, un Reglamento de Competición de 17 artículos, un Contrato de Adhesión oficial y un Acta Fundacional con 9 acuerdos.\n\nLa misión de la asociación es dar estructura, visibilidad y oportunidades de competición a los practicantes de taekwondo mayores de 35 años en España, con proyección internacional hacia los principales torneos Master del mundo.\n\nLa AEMT ya cuenta con abonados de múltiples comunidades autónomas y tiene previsto organizar su primer campeonato oficial, el AEMT Open Madrid, para el 15 de marzo de 2026.', destacada:false },
  { id:3, categoria:'Internacional',   fecha_publicacion:'2026-03-01', emoji:'✈️', publicada:true, titulo:'Confirmada expedición al USA Master Cup 2026 en Los Ángeles', extracto:'25 plazas disponibles para la primera expedición organizada de la historia de la AEMT al torneo más importante de la categoría Master en el mundo.', contenido:'La AEMT ha confirmado su primera expedición oficial al USA Master Cup 2026, que se celebrará en Los Ángeles (California) en junio de 2026. El torneo estadounidense es considerado el más importante del mundo en la categoría Master por número de participantes y nivel de competición.\n\nSe han habilitado 25 plazas para deportistas federados con licencia en vigor. La expedición incluye coordinación de viajes, alojamiento en bloque y acompañamiento técnico durante la competición.\n\nPara inscribirse en la expedición, los interesados deben estar dados de alta como abonados de la AEMT con el plan Estándar o Joven. Las plazas se asignarán por orden de solicitud.\n\nEl precio de la expedición cubre vuelo Madrid-Los Ángeles-Madrid, hotel (4 noches), traslados y cuota de inscripción al torneo. Consulta el precio actualizado en el panel de abonados o escribe a info@aemt.es.\n\nFecha límite de inscripción en la expedición: 15 de mayo de 2026.', destacada:false },
];

const STATIC_ABONADOS_COUNT = 47;

const NATIONS = [
  {f:'🇺🇸',n:'USA Masters Team'},{f:'🇸🇪',n:'Sweden Masters'},{f:'🇬🇧',n:'British Masters TKD'},
  {f:'🇩🇪',n:'Deutsche TKD Masters'},{f:'🇫🇷',n:'France Masters TKD'},{f:'🇳🇱',n:'Netherlands Masters'},
  {f:'🇰🇷',n:'Korea Masters'},{f:'🇧🇷',n:'Brasil Masters TKD'},{f:'🇯🇵',n:'Japan Masters'},
  {f:'🇦🇺',n:'Australia Masters'},{f:'🇮🇹',n:'Italy Masters TKD'},{f:'🇵🇹',n:'Portugal Masters'},
  {f:'🌐',n:'IMGA'},
];

const PLANS = [
  {
    nm:'Abonado Estándar', pr:'60€', pe:'/año', cl:'p-st',
    fs:['Acceso a todos los eventos AEMT','Ranking AEMT oficial','Expediciones internacionales organizadas','Newsletter y novedades exclusivas','Carné oficial AEMT + app digital','Descuentos con marcas patrocinadoras'],
    no:[],
  },
  {
    nm:'Abonado Joven (14-25)', pr:'60€', pe:'/año', cl:'p-pm',
    fs:['Todo lo del plan Estándar','Precio igual para mayor accesibilidad','Programa de jóvenes talentos AEMT','Mentoring con deportistas senior'],
    no:[],
  },
  {
    nm:'Colaborador', pr:'60€', pe:'/año', cl:'p-co',
    fs:['Apoyo institucional a la AEMT','Newsletter y comunicaciones','Carné colaborador AEMT'],
    no:['Sin acceso como competidor','Sin ranking AEMT'],
  },
];

const CCAA = ['Andalucía','Aragón','Asturias','Baleares','Canarias','Cantabria','Castilla-La Mancha','Castilla y León','Cataluña','Extremadura','Galicia','La Rioja','Madrid','Murcia','Navarra','País Vasco','Valencia','Ceuta','Melilla'];

const STATIC_ABONADOS = [
  { id:'1', nombre:'Eduardo',  apellidos:'Lozano Moreno',  email:'eduardo@kyotovallecas.es', telefono:'+34 625 59 39 98', plan:'estandar',    comunidad_autonoma:'Madrid',    cinturon:'6.º Dan',  estado:'activo',    fecha_solicitud:'2026-03-01T10:00:00Z', notas:'Presidente y fundador', nacionalidad:'Española', federacion:'RFTKD', club:'Club Kyoto Vallecas' },
  { id:'2', nombre:'Carlos',   apellidos:'Mendez García',  email:'carlos@email.com',          telefono:'+34 600 111 222', plan:'estandar',    comunidad_autonoma:'Andalucía', cinturon:'2.º Dan',  estado:'activo',    fecha_solicitud:'2026-03-10T11:00:00Z', notas:'', nacionalidad:'Española', federacion:'RFTKD', club:'Club TKD Sevilla' },
  { id:'3', nombre:'Javier',   apellidos:'Torres Ruiz',    email:'javier@email.com',          telefono:'+34 600 333 444', plan:'estandar',    comunidad_autonoma:'Cataluña',  cinturon:'3.º Dan',  estado:'activo',    fecha_solicitud:'2026-03-09T09:00:00Z', notas:'', nacionalidad:'Española', federacion:'RFTKD', club:'Club TKD Barcelona' },
  { id:'4', nombre:'Miguel',   apellidos:'Sánchez López',  email:'miguel@email.com',          telefono:'+34 600 555 666', plan:'estandar',    comunidad_autonoma:'Valencia',  cinturon:'1.º Dan',  estado:'activo',    fecha_solicitud:'2026-03-08T12:00:00Z', notas:'', nacionalidad:'Española', federacion:'RFTKD', club:'Club TKD Valencia' },
  { id:'5', nombre:'Laura',    apellidos:'Pérez Castro',   email:'laura@email.com',           telefono:'+34 600 777 888', plan:'joven',       comunidad_autonoma:'Madrid',    cinturon:'1.º Dan',  estado:'pendiente', fecha_solicitud:'2026-03-12T15:00:00Z', notas:'', nacionalidad:'Española', federacion:'RFTKD', club:'Club Kyoto Vallecas' },
  { id:'6', nombre:'Roberto',  apellidos:'Fernández Gil',  email:'roberto@email.com',         telefono:'+34 600 999 000', plan:'colaborador', comunidad_autonoma:'País Vasco',cinturon:'',         estado:'activo',    fecha_solicitud:'2026-03-07T08:00:00Z', notas:'', nacionalidad:'Española', federacion:'RFTKD', club:'Club TKD Bilbao' },
  { id:'7', nombre:'Ana',      apellidos:'González Prado', email:'ana@email.com',             telefono:'+34 600 123 456', plan:'estandar',    comunidad_autonoma:'Galicia',   cinturon:'2.º Dan',  estado:'activo',    fecha_solicitud:'2026-03-11T10:00:00Z', notas:'', nacionalidad:'Española', federacion:'RFTKD', club:'Club TKD Vigo' },
  { id:'8', nombre:'Pedro',    apellidos:'Martínez Vidal', email:'pedro@email.com',           telefono:'+34 600 654 321', plan:'estandar',    comunidad_autonoma:'Aragón',    cinturon:'1.º Dan',  estado:'pendiente', fecha_solicitud:'2026-03-13T16:00:00Z', notas:'', nacionalidad:'Española', federacion:'RFTKD', club:'Club TKD Zaragoza' },
];
