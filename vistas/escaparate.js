// escaparate.js — Modulo de Navegacion de 27 Pestanas para Oficina ApliArte
const PESTANAS_ECOSISTEMA = [
  { slug: 'skills', titulo: 'Banco de Habilidades', ruta: '/vista/skills', publica: true },
  { slug: 'resenas', titulo: 'Reseñas de Tiendas', ruta: '/resenas', publica: true },
  { slug: 'instala-tu-oficina', titulo: 'Instala tu Oficina', ruta: '/vista/instala-tu-oficina', publica: true },
  { slug: 'propuestas', titulo: 'Bandeja de Propuestas', ruta: '/vista/propuestas', publica: false },
  { slug: 'aplichat', titulo: 'ApliChat y Buzón', ruta: '/vista/aplichat', publica: false },
  { slug: 'tiendas', titulo: 'Tiendas y Metadatos ASO', ruta: '/vista/tiendas', publica: false },
  { slug: 'diseno', titulo: 'Capturas Retina y Mockups', ruta: '/vista/diseno', publica: false },
  { slug: 'musica', titulo: 'Música Procedural Strudel', ruta: '/vista/musica', publica: false },
  { slug: 'mercado', titulo: 'Estudio de Mercado', ruta: '/vista/mercado', publica: false },
  { slug: 'locucion', titulo: 'Locución y Doblaje', ruta: '/vista/locucion', publica: false },
  { slug: 'facturas', titulo: 'Facturas y Gestoría', ruta: '/vista/facturas', publica: false },
  { slug: 'correos', titulo: 'Correos de Soporte', ruta: '/vista/correos', publica: false },
  { slug: 'pnl', titulo: 'Programación Neurolingüística', ruta: '/vista/pnl', publica: false },
  { slug: 'herramientas', titulo: 'Catálogo de Herramientas', ruta: '/vista/herramientas', publica: false },
  { slug: 'auditor-tiendas', titulo: 'Auditoría de Tiendas', ruta: '/vista/auditor-tiendas', publica: false },
  { slug: 'auditoria-web', titulo: 'Auditoría Web y SEO', ruta: '/vista/auditoria-web', publica: false },
  { slug: 'admob', titulo: 'AdMob y Publicidad Dual', ruta: '/vista/admob', publica: false },
  { slug: 'aislar-voces', titulo: 'Aislamiento Vocal', ruta: '/vista/aislar-voces', publica: false },
  { slug: 'campana-visual', titulo: 'Campaña Visual', ruta: '/vista/campana-visual', publica: false },
  { slug: 'edicion-video', titulo: 'Edición de Vídeo', ruta: '/vista/edicion-video', publica: false },
  { slug: 'presentaciones', titulo: 'Presentaciones Multilingües', ruta: '/vista/presentaciones', publica: false },
  { slug: 'blogger', titulo: 'Publicaciones en Blogger', ruta: '/vista/blogger', publica: false },
  { slug: 'conciliacion', titulo: 'Conciliación Bancaria', ruta: '/vista/conciliacion', publica: false },
  { slug: 'ses-hospedajes', titulo: 'Registro SES Hospedajes', ruta: '/vista/ses-hospedajes', publica: false },
  { slug: 'vps', titulo: 'Infraestructura VPS', ruta: '/vista/vps', publica: false },
  { slug: 'apliarte-bot', titulo: 'Supervisión ApliArteBot', ruta: '/vista/apliarte-bot', publica: false },
  { slug: 'directo', titulo: 'Monitor de Directo', ruta: '/vista/directo', publica: false }
];

function esModoEscaparate() {
  const host = window.location.hostname;
  return host.includes('github.io') || host.includes('pages') || host === 'localhost' || host === '127.0.0.1';
}

function renderizarBarraEscaparate(contenedorId, pestanaActiva) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  let html = '<div class="escaparate-nav-wrapper"><div class="escaparate-tabs-scroll">';
  PESTANAS_ECOSISTEMA.forEach(p => {
    const esActiva = pestanaActiva === p.slug;
    const clase = 'nav-tab' + (esActiva ? ' active' : '') + (!p.publica ? ' locked' : '');
    const badge = !p.publica ? ' <span style="font-size:0.7em;opacity:0.75;">(Privada)</span>' : '';
    html += `<a href="${p.ruta}" class="${clase}">${p.titulo}${badge}</a>`;
  });
  html += '</div></div>';
  contenedor.innerHTML = html;
}
