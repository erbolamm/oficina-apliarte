// escaparate.js — Cliente Web Universal Tri-Modo para Oficina ApliArte
// Modo 1: Escaparate Autonomo (datos estaticos JSON sin servidor)
// Modo 2: Conectado a Servidor Local (http://127.0.0.1:8791)
// Modo 3: Conectado a Servidor en la Nube (Hostinger VPS)

const PESTANAS_ECOSISTEMA = [
  { slug: 'oficina', titulo: 'Oficina', subtitulo: 'Tablero de tareas', archivo: 'tareas.html', ruta: '/vista/tareas', publica: true, activa: true, icono: '⌂' },
  { slug: 'propuestas', titulo: 'Propuestas', subtitulo: 'Bandeja comunitaria', archivo: 'propuestas.html', ruta: '/vista/propuestas', publica: true, activa: true, icono: '💡' },
  { slug: 'aplicaciones', titulo: 'Aplicaciones', subtitulo: 'Catálogo oficial', archivo: 'aplicaciones.html', ruta: '/vista/aplicaciones', publica: true, activa: true, icono: '📱' },
  { slug: 'paquetes', titulo: 'Paquetes', subtitulo: 'Librerías Flutter', archivo: 'paquetes.html', ruta: '/vista/paquetes', publica: true, activa: true, icono: '📦' },
  { slug: 'skills', titulo: 'Skills', subtitulo: 'Botonera y catálogo', archivo: 'skills.html', ruta: '/vista/skills', publica: true, activa: true, icono: '⌘' },
  { slug: 'javier', titulo: 'Espacio Javier', subtitulo: 'Control personal y ja--', archivo: 'instala-tu-oficina.html', ruta: '/vista/javier', publica: false, activa: false, icono: '👤' },
  { slug: 'inicio-dia', titulo: 'Inicio del día', subtitulo: 'Checklist matutino', archivo: 'instala-tu-oficina.html', ruta: '/vista/inicio-dia', publica: false, activa: false, icono: '☼' },
  { slug: 'aplichat', titulo: 'ApliChat', subtitulo: 'Chat accesible', archivo: 'instala-tu-oficina.html', ruta: '/vista/aplichat', publica: false, activa: false, icono: '💬' },
  { slug: 'conectores', titulo: 'Conectores', subtitulo: 'Servicios y credenciales', archivo: 'instala-tu-oficina.html', ruta: '/vista/conectores', publica: false, activa: false, icono: '⇄' },
  { slug: 'plugins', titulo: 'Plugins', subtitulo: 'Módulos de la Oficina', archivo: 'instala-tu-oficina.html', ruta: '/vista/plugins', publica: false, activa: false, icono: '⊞' },
  { slug: 'reflect', titulo: 'Reflect', subtitulo: 'Directivas y memoria', archivo: 'instala-tu-oficina.html', ruta: '/vista/reflect', publica: false, activa: false, icono: '◐' },
  { slug: 'diseno', titulo: 'Estudio de Diseño', subtitulo: 'Vídeo, marcos y SFX', archivo: 'instala-tu-oficina.html', ruta: '/vista/diseno', publica: false, activa: false, icono: '🎨' },
  { slug: 'tiendas', titulo: 'Tiendas y ASO', subtitulo: 'Auditoría y keywords', archivo: 'instala-tu-oficina.html', ruta: '/vista/tiendas', publica: false, activa: false, icono: '🎯' },
  { slug: 'mercado', titulo: 'Radar de Mercado', subtitulo: 'Tendencias y noticias', archivo: 'instala-tu-oficina.html', ruta: '/vista/mercado', publica: false, activa: false, icono: '📊' },
  { slug: 'correos', titulo: 'Correos y Alertas', subtitulo: 'erbolamm y javier', archivo: 'instala-tu-oficina.html', ruta: '/vista/correos', publica: false, activa: false, icono: '✉' },
  { slug: 'pnl', titulo: 'Estudio PNL', subtitulo: 'Enganche y microcopy', archivo: 'instala-tu-oficina.html', ruta: '/vista/pnl', publica: false, activa: false, icono: '🧠' },
  { slug: 'musica', titulo: 'Estudio Musical', subtitulo: 'Música procedural', archivo: 'instala-tu-oficina.html', ruta: '/vista/musica', publica: false, activa: false, icono: '🎵' },
  { slug: 'locucion', titulo: 'Locución y Guiones', subtitulo: 'TTS y guiones cortos', archivo: 'instala-tu-oficina.html', ruta: '/vista/locucion', publica: false, activa: false, icono: '🎙' },
  { slug: 'voicestudio', titulo: 'Voice Studio', subtitulo: 'Clonación ultrarrápida', archivo: 'instala-tu-oficina.html', ruta: '/vista/voicestudio', publica: false, activa: false, icono: '⚡' },
  { slug: 'terminales', titulo: 'Terminales', subtitulo: 'Lanzadores locales', archivo: 'instala-tu-oficina.html', ruta: '/vista/terminales', publica: false, activa: false, icono: '▣' },
  { slug: 'facturas', titulo: 'Facturas', subtitulo: 'Gestor de facturas', archivo: 'instala-tu-oficina.html', ruta: '/vista/facturas', publica: false, activa: false, icono: '€' },
  { slug: 'blogger', titulo: 'Blogger', subtitulo: 'Monitor y difusión', archivo: 'instala-tu-oficina.html', ruta: '/vista/blogger', publica: false, activa: false, icono: '✎' },
  { slug: 'bitacora', titulo: 'Bitácora', subtitulo: 'Proyectos y enlaces', archivo: 'instala-tu-oficina.html', ruta: '/vista/bitacora', publica: false, activa: false, icono: '☰' },
  { slug: 'directo', titulo: 'Directo', subtitulo: 'Centro de retransmisión', archivo: 'instala-tu-oficina.html', ruta: '/vista/directo', publica: false, activa: false, icono: '▶' },
  { slug: 'diapositivas', titulo: 'Diapositivas', subtitulo: 'Presentaciones y difusión', archivo: 'instala-tu-oficina.html', ruta: '/vista/diapositivas', publica: false, activa: false, icono: '⎘' },
  { slug: 'shorts', titulo: 'Shorts', subtitulo: 'Vídeo acelerado a 60 s', archivo: 'instala-tu-oficina.html', ruta: '/vista/shorts', publica: false, activa: false, icono: '⏩' },
  { slug: 'resenas', titulo: 'Reseñas', subtitulo: 'Contestador inteligente', archivo: 'resenas.html', ruta: '/resenas', publica: false, activa: false, icono: '★' }
];

const CLAVE_ALMACEN_BACKEND = 'oficina_backend_url';

function esEntornoGitHubPages() {
  return window.location.hostname.includes('github.io');
}

function obtenerBackendUrl() {
  // En GitHub Pages, regla de seguridad estricta: cero sondeo automatico a 127.0.0.1; arranca siempre en escaparate puro
  if (esEntornoGitHubPages()) {
    return sessionStorage.getItem(CLAVE_ALMACEN_BACKEND) || '';
  }
  return localStorage.getItem(CLAVE_ALMACEN_BACKEND) || '';
}

function fijarBackendUrl(url) {
  if (url) {
    const urlLimpia = url.replace(/\/+$/, '');
    if (esEntornoGitHubPages()) {
      sessionStorage.setItem(CLAVE_ALMACEN_BACKEND, urlLimpia);
    } else {
      localStorage.setItem(CLAVE_ALMACEN_BACKEND, urlLimpia);
    }
  } else {
    sessionStorage.removeItem(CLAVE_ALMACEN_BACKEND);
    localStorage.removeItem(CLAVE_ALMACEN_BACKEND);
  }
}

function esRutaEnSubcarpetaVistas() {
  return window.location.pathname.includes('/vistas/') || window.location.pathname.endsWith('.html');
}

function calcularRutaRelativa(rutaDestino) {
  const enVistas = window.location.pathname.includes('/vistas/');
  if (enVistas) {
    if (rutaDestino.startsWith('vistas/')) {
      return rutaDestino.replace('vistas/', '');
    }
    if (rutaDestino === 'index.html' || rutaDestino === '/') {
      return '../index.html';
    }
    if (rutaDestino.startsWith('datos/')) {
      return '../' + rutaDestino;
    }
  }
  return rutaDestino;
}

// Peticion unificada con conmutacion automatica entre Servidor y Datos Estaticos
async function hacerPeticionUniversal(endpointApi, rutaFallbackEstatica) {
  const backend = obtenerBackendUrl();
  
  // Regla de seguridad: en GitHub Pages con HTTPS no conectar a 127.0.0.1 salvo sesion iniciada expresamente
  if (backend) {
    const esLocal = backend.includes('127.0.0.1') || backend.includes('localhost');
    const esHttps = window.location.protocol === 'https:';
    if (!esHttps || !esLocal) {
      try {
        const urlCompleta = `${backend}${endpointApi}`;
        const res = await fetch(urlCompleta, { method: 'GET', mode: 'cors' });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Fallo al conectar con backend configurado, recurriendo a datos estaticos:', e);
      }
    }
  }

  // Fallback estatico para GitHub Pages o modo escaparate puro
  const rutaFinal = calcularRutaRelativa(rutaFallbackEstatica);
  const resFallback = await fetch(rutaFinal);
  if (!resFallback.ok) {
    throw new Error(`No se pudo cargar datos estaticos desde ${rutaFinal}`);
  }
  return await resFallback.json();
}

// Selector de conexion de 3 modos para la cabecera
function renderizarBarraConexion(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const backend = obtenerBackendUrl();
  let modoBadge = '';
  let botonesAccion = '';

  if (!backend) {
    modoBadge = '<span class="badge" style="background:rgba(56,189,248,0.15);color:var(--primary);border:1px solid var(--primary);">Modo 1: Escaparate Autonomo</span>';
    botonesAccion = `
      <button class="btn-sm" onclick="conectarLocal()" title="Conectar con tu servidor en http://127.0.0.1:8791">Conectar Servidor Local</button>
      <button class="btn-sm" onclick="solicitarUrlNube()" title="Conectar con tu servidor en Hostinger">Conectar Nube</button>
    `;
  } else if (backend.includes('127.0.0.1') || backend.includes('localhost')) {
    modoBadge = '<span class="badge" style="background:rgba(52,211,153,0.15);color:var(--success);border:1px solid var(--success);">Modo 2: Conectado a Servidor Local</span>';
    botonesAccion = `
      <span style="font-size:0.75rem;color:var(--text-muted);">${backend}</span>
      <button class="btn-sm" onclick="desconectarBackend()">Desconectar</button>
    `;
  } else {
    modoBadge = '<span class="badge" style="background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid #c084fc;">Modo 3: Conectado a Nube (Hostinger)</span>';
    botonesAccion = `
      <span style="font-size:0.75rem;color:var(--text-muted);">${backend}</span>
      <button class="btn-sm" onclick="desconectarBackend()">Desconectar</button>
    `;
  }

  contenedor.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
      ${modoBadge}
      ${botonesAccion}
    </div>
  `;
}

async function conectarLocal() {
  const urlLocal = 'http://127.0.0.1:8791';
  if (window.location.protocol === 'https:' && esEntornoGitHubPages()) {
    alert('Aviso de seguridad del navegador: Desde un sitio HTTPS (como GitHub Pages), las peticiones directas a un servidor HTTP local en 127.0.0.1 suelen ser bloqueadas por politicas de contenido mixto del navegador. Para conectar con tu entorno local, puedes abrir http://127.0.0.1:8791 directamente en tu navegador o conectar un servidor en la nube con HTTPS.');
  }
  try {
    const res = await fetch(`${urlLocal}/api/estado`, { mode: 'cors' });
    if (res.ok) {
      fijarBackendUrl(urlLocal);
      alert('Conectado con exito a tu Servidor Local en 127.0.0.1:8791');
      window.location.reload();
      return;
    }
  } catch (e) {
    alert('No se detecto ningun servidor activo en http://127.0.0.1:8791. Asegurate de haber arrancado python3 servidor/servidor_oficina.py o el contenedor Docker.');
  }
}

async function solicitarUrlNube() {
  const url = prompt('Introduce la direccion de tu Servidor en Hostinger (ejemplo: http://tu-ip:8791):');
  if (!url) return;
  const urlLimpia = url.trim().replace(/\/+$/, '');
  try {
    const res = await fetch(`${urlLimpia}/api/estado`, { mode: 'cors' });
    if (res.ok) {
      fijarBackendUrl(urlLimpia);
      alert('Conectado con exito a tu Servidor en la Nube: ' + urlLimpia);
      window.location.reload();
      return;
    }
  } catch (e) {
    alert('No se pudo verificar el estado en ' + urlLimpia + '. Comprueba que el puerto 8791 este abierto en el cortafuegos de Hostinger.');
  }
}

function desconectarBackend() {
  fijarBackendUrl('');
  alert('Desconectado. Regresando a Modo Escaparate Autonomo.');
  window.location.reload();
}

function renderizarBarraEscaparate(contenedorId, pestanaActiva) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const enVistas = window.location.pathname.includes('/vistas/');
  let html = '<div class="escaparate-nav-wrapper"><div class="escaparate-tabs-scroll" style="display:flex;gap:0.5rem;overflow-x:auto;padding-bottom:0.5rem;">';
  
  PESTANAS_ECOSISTEMA.forEach(p => {
    const esActiva = pestanaActiva === p.slug;
    const clase = 'nav-tab' + (esActiva ? ' active' : '') + (!p.publica ? ' locked' : '');
    const badge = !p.publica ? ' <span style="font-size:0.7em;opacity:0.75;">(Privada)</span>' : '';
    
    let href = p.publica ? p.archivo : (enVistas ? 'instala-tu-oficina.html' : 'vistas/instala-tu-oficina.html');
    if (!enVistas && p.publica) {
      href = 'vistas/' + p.archivo;
    }
    
    html += `<a href="${href}" class="${clase}">${p.titulo}${badge}</a>`;
  });
  
  html += '</div></div>';
  contenedor.innerHTML = html;
}
