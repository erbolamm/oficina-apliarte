// escaparate.js — Cliente Web Universal Tri-Modo para Oficina ApliArte
// Modo 1: Escaparate Autonomo (datos estaticos JSON sin servidor)
// Modo 2: Conectado a Servidor Local (http://127.0.0.1:8791)
// Modo 3: Conectado a Servidor en la Nube (Hostinger VPS)

const PESTANAS_ECOSISTEMA = [
  { slug: 'tareas', titulo: 'Tareas del Ecosistema', archivo: 'tareas.html', ruta: '/vista/tareas', publica: true },
  { slug: 'propuestas', titulo: 'Propuestas Comunitarias', archivo: 'propuestas.html', ruta: '/vista/propuestas', publica: true },
  { slug: 'aplicaciones', titulo: 'Aplicaciones Oficiales', archivo: 'aplicaciones.html', ruta: '/vista/aplicaciones', publica: true },
  { slug: 'paquetes', titulo: 'Paquetes Flutter', archivo: 'paquetes.html', ruta: '/vista/paquetes', publica: true },
  { slug: 'skills', titulo: 'Banco de Habilidades', archivo: 'skills.html', ruta: '/vista/skills', publica: true },
  { slug: 'resenas', titulo: 'Reseñas de Tiendas', archivo: 'resenas.html', ruta: '/resenas', publica: true },
  { slug: 'instala-tu-oficina', titulo: 'Instala tu Oficina', archivo: 'instala-tu-oficina.html', ruta: '/vista/instala-tu-oficina', publica: true },
  { slug: 'aplichat', titulo: 'ApliChat y Buzón de Conversación', archivo: 'instala-tu-oficina.html', ruta: '/vista/aplichat', publica: false },
  { slug: 'tiendas', titulo: 'Tiendas y Metadatos ASO', archivo: 'instala-tu-oficina.html', ruta: '/vista/tiendas', publica: false },
  { slug: 'diseno', titulo: 'Capturas Retina y Mockups', archivo: 'instala-tu-oficina.html', ruta: '/vista/diseno', publica: false },
  { slug: 'musica', titulo: 'Música Procedural Strudel', archivo: 'instala-tu-oficina.html', ruta: '/vista/musica', publica: false },
  { slug: 'mercado', titulo: 'Estudio de Mercado y Tendencias', archivo: 'instala-tu-oficina.html', ruta: '/vista/mercado', publica: false },
  { slug: 'locucion', titulo: 'Locución y Doblaje', archivo: 'instala-tu-oficina.html', ruta: '/vista/locucion', publica: false },
  { slug: 'facturas', titulo: 'Facturas y Gestoría Trimestral', archivo: 'instala-tu-oficina.html', ruta: '/vista/facturas', publica: false },
  { slug: 'correos', titulo: 'Correos de Soporte de Usuarios', archivo: 'instala-tu-oficina.html', ruta: '/vista/correos', publica: false },
  { slug: 'pnl', titulo: 'Programación Neurolingüística (PNL)', archivo: 'instala-tu-oficina.html', ruta: '/vista/pnl', publica: false },
  { slug: 'herramientas', titulo: 'Catálogo de Herramientas', archivo: 'instala-tu-oficina.html', ruta: '/vista/herramientas', publica: false },
  { slug: 'auditor-tiendas', titulo: 'Auditoría de Tiendas y Versiones', archivo: 'instala-tu-oficina.html', ruta: '/vista/auditor-tiendas', publica: false },
  { slug: 'auditoria-web', titulo: 'Auditoría Web y Conversión', archivo: 'instala-tu-oficina.html', ruta: '/vista/auditoria-web', publica: false },
  { slug: 'admob', titulo: 'AdMob y Publicidad Dual', archivo: 'instala-tu-oficina.html', ruta: '/vista/admob', publica: false },
  { slug: 'aislar-voces', titulo: 'Aislamiento Vocal y Peritaje', archivo: 'instala-tu-oficina.html', ruta: '/vista/aislar-voces', publica: false },
  { slug: 'campana-visual', titulo: 'Campaña Visual Multiformato', archivo: 'instala-tu-oficina.html', ruta: '/vista/campana-visual', publica: false },
  { slug: 'edicion-video', titulo: 'Edición y Mezcla de Vídeo', archivo: 'instala-tu-oficina.html', ruta: '/vista/edicion-video', publica: false },
  { slug: 'presentaciones', titulo: 'Presentaciones Multilingües', archivo: 'instala-tu-oficina.html', ruta: '/vista/presentaciones', publica: false },
  { slug: 'blogger', titulo: 'Publicaciones en Blogger', archivo: 'instala-tu-oficina.html', ruta: '/vista/blogger', publica: false },
  { slug: 'conciliacion', titulo: 'Conciliación Bancaria', archivo: 'instala-tu-oficina.html', ruta: '/vista/conciliacion', publica: false },
  { slug: 'ses-hospedajes', titulo: 'Registro SES Hospedajes', archivo: 'instala-tu-oficina.html', ruta: '/vista/ses-hospedajes', publica: false },
  { slug: 'vps', titulo: 'Estado de Infraestructura VPS', archivo: 'instala-tu-oficina.html', ruta: '/vista/vps', publica: false },
  { slug: 'apliarte-bot', titulo: 'Supervisión de ApliArteBot', archivo: 'instala-tu-oficina.html', ruta: '/vista/apliarte-bot', publica: false },
  { slug: 'directo', titulo: 'Monitor de Directo y Streaming', archivo: 'instala-tu-oficina.html', ruta: '/vista/directo', publica: false }
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
