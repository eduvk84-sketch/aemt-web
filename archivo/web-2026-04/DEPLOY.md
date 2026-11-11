# Guía de Publicación AEMT

Tiempo estimado: **30-45 minutos**. Sigue los pasos en orden.

---

## PASO 1 — Crear proyecto en Supabase (backend/base de datos)

1. Ve a **https://supabase.com** → "Start your project"
2. Inicia sesión con tu cuenta de Google o crea una cuenta
3. Haz clic en **"New project"**
4. Rellena:
   - **Name:** `aemt`
   - **Database Password:** pon una contraseña segura y guárdala
   - **Region:** `West EU (Ireland)` — el más cercano a España
5. Haz clic en **"Create new project"** y espera ~2 minutos

### Ejecutar el schema SQL

6. En tu proyecto Supabase, ve al menú lateral → **"SQL Editor"**
7. Haz clic en **"New query"**
8. Abre el archivo `schema.sql` que está en la carpeta del proyecto
9. Copia todo el contenido y pégalo en el editor
10. Haz clic en **"Run"** (botón verde)
    - Verás "Success. No rows returned" — eso es correcto
    - Las tablas, políticas y datos de ejemplo ya están creados

### Obtener las credenciales

11. Ve al menú lateral → **"Settings"** → **"API"**
12. Copia y guarda estos dos valores:
    - **Project URL** — algo como `https://abcdefghij.supabase.co`
    - **anon public** (en "Project API Keys") — clave larga que empieza por `eyJ...`

---

## PASO 2 — Configurar las credenciales en el código

1. Abre el archivo `js/config.js` con cualquier editor de texto (Bloc de notas, VS Code, etc.)
2. Busca estas dos líneas al principio del archivo:
   ```
   const SUPABASE_URL  = 'https://TU_PROYECTO.supabase.co';
   const SUPABASE_ANON = 'TU_ANON_KEY_AQUI';
   ```
3. Reemplaza los valores con los que copiaste en el paso anterior:
   ```
   const SUPABASE_URL  = 'https://abcdefghij.supabase.co';
   const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';
   ```
4. Guarda el archivo

---

## PASO 3 — Subir el código a GitHub

> GitHub es el repositorio donde Netlify leerá tu código para publicarlo.

1. Ve a **https://github.com** → inicia sesión o crea cuenta
2. Haz clic en **"New repository"** (botón verde o el "+")
3. Rellena:
   - **Repository name:** `aemt-web`
   - **Visibility:** Private (recomendado — así nadie ve tu código)
4. Haz clic en **"Create repository"**
5. GitHub te mostrará instrucciones. Elige **"upload an existing file"**
6. Arrastra TODA la carpeta del proyecto al área de carga
   - Incluye: `index.html`, `admin.html`, `login.html`, `schema.sql`, `netlify.toml`, `_redirects`, las carpetas `css/`, `js/`
   - NO subas: los archivos `.docx`, la carpeta `.claude/`
7. En el campo "Commit message" escribe: `Initial commit`
8. Haz clic en **"Commit changes"**

---

## PASO 4 — Publicar en Netlify

1. Ve a **https://netlify.com** → "Sign up" o inicia sesión (puedes usar tu cuenta de GitHub)
2. En el dashboard, haz clic en **"Add new site"** → **"Import an existing project"**
3. Selecciona **"Deploy with GitHub"**
4. Autoriza Netlify para acceder a GitHub si te lo pide
5. Selecciona el repositorio `aemt-web`
6. En la configuración de despliegue:
   - **Branch to deploy:** `main`
   - **Base directory:** (dejar vacío)
   - **Publish directory:** `.` (un punto)
   - **Build command:** (dejar vacío)
7. Haz clic en **"Deploy site"**
8. Espera ~1 minuto. Netlify te dará una URL temporal como `https://amazing-site-123.netlify.app`
9. Abre esa URL y verifica que la web funciona

---

## PASO 5 — Comprar el dominio en Hostinger

1. Ve a **https://www.hostinger.es**
2. En el buscador de dominios, escribe `aemt.es` y busca
3. Si está disponible, añádelo al carrito (debería costar ~10-15€/año)
4. Completa la compra con tus datos y método de pago
5. Una vez comprado, entra en tu panel de Hostinger → **"Dominios"** → selecciona `aemt.es`
6. Ve a **"DNS / Nameservers"**

---

## PASO 6 — Conectar el dominio a Netlify

### En Netlify:
1. Ve a tu site en Netlify → **"Domain management"** → **"Add a domain"**
2. Escribe `aemt.es` y haz clic en **"Verify"**
3. Haz clic en **"Add domain"**
4. Netlify te mostrará los nameservers que necesitas configurar. Serán algo como:
   ```
   dns1.p0X.nsone.net
   dns2.p0X.nsone.net
   dns3.p0X.nsone.net
   dns4.p0X.nsone.net
   ```
   Cópialos.

### En Hostinger:
5. Vuelve a Hostinger → **"DNS / Nameservers"** → selecciona **"Nameservers personalizados"**
6. Pega los 4 nameservers de Netlify
7. Guarda los cambios

> La propagación DNS tarda entre **15 minutos y 48 horas**. Normalmente en 1-2 horas ya funciona.

---

## PASO 7 — Activar HTTPS (SSL gratuito)

Netlify activa el certificado SSL automáticamente una vez que el dominio propaga.

1. En Netlify → **"Domain management"** → busca la sección **"HTTPS"**
2. Haz clic en **"Verify DNS configuration"**
3. Si el DNS ya propagó, verás el botón **"Provision certificate"**
4. Haz clic y espera ~1 minuto
5. Tu web estará disponible en `https://aemt.es` con candado verde

---

## PASO 8 — Configurar el panel de administración

1. Ve a `https://aemt.es/admin` o `https://aemt.es/login`
2. El primer usuario admin debes crearlo en Supabase:
   - Supabase → **"Authentication"** → **"Users"** → **"Invite user"**
   - Introduce tu email y haz clic en **"Send invite"**
   - Recibirás un email con enlace para crear contraseña
3. Una vez creado, inicia sesión en `https://aemt.es/login` con ese email y contraseña
4. Ya tienes acceso al panel de administración completo

---

## Actualizaciones futuras

Cada vez que modifiques archivos y los subas a GitHub, Netlify redesplegará automáticamente en ~1 minuto.

1. En GitHub, ve al repositorio → selecciona el archivo que quieres editar
2. Haz clic en el lápiz (Edit) → modifica → "Commit changes"
3. Netlify detecta el cambio y actualiza la web automáticamente

---

## Resumen de URLs importantes

| Recurso | URL |
|---------|-----|
| Web pública | https://aemt.es |
| Panel admin | https://aemt.es/admin |
| Login | https://aemt.es/login |
| Supabase dashboard | https://supabase.com/dashboard |
| Netlify dashboard | https://app.netlify.com |
| GitHub repo | https://github.com/TU_USUARIO/aemt-web |

---

## Soporte

Si algo falla, comprueba:
- **La web no carga:** Verifica que el dominio propague con https://dnschecker.org
- **El admin no funciona:** Comprueba las credenciales en `js/config.js`
- **Los datos no se guardan:** Comprueba en Supabase → "Table Editor" que las tablas existen
- **Error de CORS:** En Supabase → "Settings" → "API" verifica que la URL es correcta
