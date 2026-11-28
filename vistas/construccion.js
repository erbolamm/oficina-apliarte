(() => {
  const $ = (s) => document.querySelector(s);

  // Sincronización del tema visual (claro / oscuro)
  try {
    const t = window.parent.document.documentElement.dataset.theme || localStorage.getItem('erbolamm-panel-theme');
    if (t) document.documentElement.dataset.theme = t;
  } catch {}

  const params = new URLSearchParams(location.search);
  const assetBase = location.pathname.startsWith('/oficina-apliarte') ? '/oficina-apliarte' : '';
  let slug = document.body.dataset.slug || '';
  if (!slug || slug === '{{SLUG}}') {
    slug = params.get('slug') || 'en-construccion';
    document.body.dataset.slug = slug;
  }
  const paramTitulo = params.get('titulo');
  const paramSubtitulo = params.get('subtitulo');

  // Catálogo completo de módulos y explicaciones canónicas
  const MODULOS_CATALOGO = {
    "descargas": {
      titulo: "Descargas · Componentes Soberanos ApliArte",
      subtitulo: "Asistente ApliArte, Motor ApliArte y Orquestador ApliArte en preparación para distribución local",
      resumen: "Paquetes independientes y soberanos para ejecutar la Oficina, el Asistente y los Agentes en tu propia máquina.",
      para_que_sirve: "El ecosistema ApliArte se divide en tres piezas soberanas e independientes que pueden ejecutarse en local sin depender de la nube. Cada componente se publicará en código abierto y empaquetado descargable una vez completada la auditoría de seguridad y limpieza desde carpeta vacía por lista blanca estricta.",
      que_puedes_hacer: [
        "Asistente ApliArte: Interfaz soberana y asistente de escritorio con soporte de dictado, voz y accesibilidad.",
        "Motor ApliArte: Núcleo determinista de cálculo numérico al céntimo, catálogo de skills e inferencia desacoplada.",
        "Orquestador ApliArte: Agente local de repositorio para desarrollo guiado por resultados (ODD) y control estricto de Git."
      ],
      automatizaciones: "Gobernanza ADR-0013: Ninguna descarga se habilita hasta verificar el aislamiento estricto de datos privados y el funcionamiento autónomo en máquina limpia."
    },
    "seo": {
      titulo: "Espacio SEO (Auditoría, posicionamiento y metadatos)",
      subtitulo: "Auditoría técnica de posicionamiento web, optimización on-page y visibilidad orgánica",
      resumen: "Auditoría técnica de posicionamiento web, optimización on-page y visibilidad orgánica sin cuotas externas.",
      para_que_sirve: "Espacio especializado para auditar páginas web y aplicaciones del ecosistema, verificando títulos, descripciones, etiquetas canónicas, marcado estructurado, rendimiento y cumplimiento de directrices de indexación sin depender de servicios externos de pago.",
      que_puedes_hacer: [
        "Auditar metadatos, títulos y descripciones de cualquier página del ecosistema.",
        "Comprobar etiquetas Open Graph, Twitter Cards y marcado schema.org.",
        "Verificar accesibilidad básica y factores de rastreo que influyen en indexación.",
        "Detectar enlaces rotos, redirecciones incorrectas y fricciones de carga.",
        "Exportar informes técnicos de optimización con recomendaciones verificables."
      ],
      automatizaciones: "Inspección local y análisis de código fuente sin consumo de cuotas externas ni exposición de datos."
    },
    "inicio-dia": {
      titulo: "Inicio de Día (Radar de servicios)",
      subtitulo: "Radar de arranque matutino: estado de puertos locales, radar VPS y servicios",
      resumen: "Comprobación matutina unificada del estado del ecosistema, puertos y recursos en VPS.",
      para_que_sirve: "Permite auditar el estado general de tu ecosistema cada mañana antes de empezar la jornada. Comprueba los puertos locales (:8790, :8791), la memoria RAM, los contenedores Docker en tu VPS remote-72 y te permite encender o parar servicios de forma ordenada.",
      que_puedes_hacer: [
        "Ver de un vistazo si la Oficina, el Directo o los servicios locales están encendidos o parados.",
        "Comprobar los recursos libres en tu servidor VPS (RAM libre, contenedores activos).",
        "Arrancar los servicios necesarios con un solo clic según el plan del día."
      ],
      automatizaciones: "Se comunica con el script radar-ecosistema y el endpoint /api/vps/estado con caché inteligente para no saturar conexiones."
    },
    "aplichat": {
      titulo: "ApliChat (Chat accesible)",
      subtitulo: "Canal de chat accesible y limpio entre Javier y el Intérprete",
      resumen: "Mensajería accesible con tamaño de letra regulable, síntesis de voz (TTS) y confirmación formal.",
      para_que_sirve: "Canal de comunicación directo, cómodo y libre de tecnicismos entre Javier y el Intérprete en ApliChat. Presenta una interfaz de mensajería limpia tipo chat con fuentes ampliables (Normal, Grande, Gigante), lectura por voz (TTS) a varias velocidades, cita rápida de respuestas, conformidad ('✓ Leído y de acuerdo') y adjuntos con galería y portapapeles.",
      que_puedes_hacer: [
        "Conversar con el Intérprete sin ver comandos de terminal ni ruido técnico.",
        "Cambiar el tamaño de letra con el botón 'A' para leer sin fatiga visual.",
        "Escuchar los mensajes con el botón de voz (TTS) a 1.0x, 1.25x, 1.5x o 2.0x.",
        "Pulsar '✓ Leído y de acuerdo' en las propuestas del Intérprete para enviar conformidad verificada.",
        "Citar mensajes anteriores con un clic para puntualizar o responder con contexto.",
        "Capturar y compartir paneles de Herdr con secretos enmascarados."
      ],
      automatizaciones: "Almacén local /api/chat sin servicios de terceros ni fugas de privacidad, compatible con red local y Tailscale."
    },
    "conectores": {
      titulo: "Conectores (Servicios y credenciales)",
      subtitulo: "Servicios externos del ecosistema: uso, credenciales y verificación",
      resumen: "Inventario seguro de conectores externos con enmascaramiento estricto de secretos.",
      para_que_sirve: "Reúne en una lista los servicios de los que dependen los proyectos (Blogger, Google Play Console, App Store Connect, AdMob, RevenueCat, GitHub, Firebase y otros). De cada uno dice dónde se usa, el nombre de la variable que necesita y el comando para comprobarlo a mano. Nunca muestra ni guarda el valor de una clave.",
      que_puedes_hacer: [
        "Buscar un servicio por nombre o por el nombre de su variable de entorno.",
        "Marcar con un interruptor los servicios que tienes en uso y filtrar por esa marca.",
        "Abrir la configuración de cada conector para ver dónde se usa y qué credencial necesita.",
        "Copiar el comando de comprobación manual para auditar la conexión desde terminal."
      ],
      automatizaciones: "Verificación determinista local: el navegador guarda solo las preferencias de visualización y nunca almacena tokens."
    },
    "plugins": {
      titulo: "Plugins (Módulos de la Oficina)",
      subtitulo: "Personalización de módulos activos en la barra lateral de la Oficina",
      resumen: "Enciende o apaga las pestañas de la barra lateral para dejar a la vista solo los módulos que usas.",
      para_que_sirve: "Cada módulo de la Oficina es una pestaña de la barra lateral. Desde aquí se ocultan las que no se usan y se vuelven a mostrar cuando hagan falta. Ocultar una pestaña no borra nada: la página sigue existiendo.",
      que_puedes_hacer: [
        "Ocultar o mostrar cualquier pestaña de la barra lateral según tu flujo de trabajo.",
        "Mantener siempre protegidas las pestañas maestras (Oficina, Plugins, Talent Land).",
        "Restablecer la barra lateral completa a su estado canónico con un solo clic.",
        "Conservar tu selección de módulos en tu navegador de forma persistente."
      ],
      automatizaciones: "Persistencia en localStorage (erbolamm-panel-hidden-nav) sin necesidad de reiniciar el servidor."
    },
    "reflect": {
      titulo: "Reflect (Directivas y memoria)",
      subtitulo: "Gobernanza de directivas, memoria neurosimbólica y balanceo de modelos",
      resumen: "Auditoría de directivas, memoria persistente Engram y comparativa empírica de capacidades de modelos.",
      para_que_sirve: "Centro neurálgico para supervisar las directivas de comportamiento, reglas de arquitectura (ADR-0013, ADR-0014) y la memoria episódica compartida. Integra la evaluación comparativa entre modelos ligeros locales y modelos de razonamiento profundo.",
      que_puedes_hacer: [
        "Consultar las directivas y acuerdos de sesión activos sin salir de la Oficina.",
        "Verificar la memoria compartida persistente y lecciones aprendidas.",
        "Comparar empíricamente la generación de componentes entre modelos pequeños y modelos grandes.",
        "Comprobar las salvaguardas de confirmación humana obligatoria antes de acciones irreversibles."
      ],
      automatizaciones: "Sincronización bidireccional con la memoria Engram y auditoría automática de contratos JSON."
    },
    "diseno": {
      titulo: "Estudio de Diseño (Vídeo, marcos y SFX)",
      subtitulo: "Motor de diseño, animación y vídeo promocional para difusión técnica",
      resumen: "Generación de creatividades visuales, marcos de dispositivos y clips promocionales.",
      para_que_sirve: "Permite maquetar y previsualizar piezas visuales para redes, tiendas y diapositivas. Integra generación de marcos de dispositivos móviles, clips acelerados y efectos de sonido para enriquecer las demostraciones.",
      que_puedes_hacer: [
        "Generar marcos promocionales para capturas de iOS y Android en alta resolución.",
        "Previsualizar animaciones y efectos de transición en formatos 16:9, 9:16 y 1:1.",
        "Acceder a la librería de efectos de sonido procedurales para presentaciones.",
        "Exportar fichas de diseño listas para las tiendas de aplicaciones."
      ],
      automatizaciones: "Renderizado declarativo con Playwright, canvas y ffmpeg sin librerías pesadas en la nube."
    },
    "tiendas": {
      titulo: "Tiendas y ASO (Auditoría y metadatos)",
      subtitulo: "Optimización de fichas de App Store y Google Play bajo directrices oficiales",
      resumen: "Auditoría de metadatos, límites de caracteres y notas de versión multilingües.",
      para_que_sirve: "Ayuda a preparar y validar las fichas de tienda para App Store y Google Play. Audita el límite estricto de 100 caracteres en palabras clave de Apple, comprueba el cumplimiento de la Guideline 2.3.3 y redacta notas de versión en 24 idiomas.",
      que_puedes_hacer: [
        "Verificar que el campo de keywords de iOS no supere 100 caracteres sin espacios.",
        "Comprobar la longitud y claridad de descripciones cortas en Google Play.",
        "Generar notas de versión sincronizadas en español, inglés, alemán y francés.",
        "Validar la transparencia de precios y ausencia de afirmaciones engañosas."
      ],
      automatizaciones: "Genera automáticamente las carpetas de metadatos bajo control-erbolamm/tiendas/ y fastlane/."
    },
    "mercado": {
      titulo: "Radar de Mercado (Tendencias y noticias)",
      subtitulo: "Seguimiento de tendencias tecnológicas y ganchos de difusión en directo",
      resumen: "Monitorización de novedades del ecosistema, bibliotecas abiertas y oportunidades.",
      para_que_sirve: "Rastrea fuentes públicas, lanzamientos de librerías en pub.dev, cambios en políticas de Google Play y Apple, y genera ideas de contenido técnico y directos temáticos basados en la actualidad.",
      que_puedes_hacer: [
        "Identificar tendencias emergentes en desarrollo Flutter y modelos de IA locales.",
        "Comparar soluciones de mercado con alternativas de código abierto y coste cero.",
        "Generar ganchos narrativos para artículos de blog y transmisiones en Twitch.",
        "Guardar notas de investigación para futuros proyectos y verticales."
      ],
      automatizaciones: "Agregación sin rastreo publicitario ni almacenamiento de perfiles de usuario."
    },
    "musica": {
      titulo: "Estudio Musical (Música procedural Strudel)",
      subtitulo: "Generación de pistas musicales algorítmicas en código abierto para directos",
      resumen: "Composición musical procedural en vivo mediante Strudel y Web Audio API.",
      para_que_sirve: "Permite componer, reproducir y exportar fondos musicales algorítmicos para directos de Twitch y vídeos de difusión sin derechos de autor de terceros ni costes de licencia recurrentes.",
      que_puedes_hacer: [
        "Ejecutar patrones musicales interactivos directamente en el navegador.",
        "Ajustar el tempo (BPM), instrumentos y escalas en tiempo real.",
        "Previsualizar formas de onda y mezclas de sonido procedural.",
        "Exportar secuencias de código listas para el reproductor autónomo."
      ],
      automatizaciones: "Síntesis procedural basada en código ejecutable ligero entregado en control-erbolamm/difusion/musica/."
    },
    "locucion": {
      titulo: "Locución y Guiones (TTS y guiones)",
      subtitulo: "Estudio de redacción de guiones cortos y síntesis de voz natural",
      resumen: "Cálculo de ritmo de lectura (PPM), síntesis de voz y ajuste de guiones para vídeo.",
      para_que_sirve: "Herramienta para redactar y calibrar guiones de vídeo y presentaciones. Calcula automáticamente el tiempo estimado de locución según el número de palabras y permite generar pruebas de voz con motores locales y Web Speech.",
      que_puedes_hacer: [
        "Medir el tiempo exacto que tardará un locutor o motor TTS al ritmo estándar (150 PPM).",
        "Ajustar pausas, énfasis y estructura de guiones para encajar en 60 segundos.",
        "Probar la síntesis de voz con distintas voces y tonos en el navegador.",
        "Exportar escaletas técnicas para diapositivas y directos."
      ],
      automatizaciones: "Cálculo algorítmico inmediato de palabras por minuto sin llamadas de red."
    },
    "voicestudio": {
      titulo: "Voces ApliArte (Clonación ultrarrápida)",
      subtitulo: "Clonación y síntesis de voz acelerada en Apple Silicon sin dependencias cloud",
      resumen: "Motor de inferencia de voz local de alta fidelidad y latencia ultrabaja.",
      para_que_sirve: "Permite generar locuciones con perfiles de voz personalizados de Javier Mateo utilizando la aceleración por hardware de Apple Silicon (MPS). Garantiza privacidad absoluta al no enviar muestras vocales a servidores en la nube.",
      que_puedes_hacer: [
        "Visualizar perfiles espectrales de audio y curvas de entonación.",
        "Monitorear la latencia de síntesis en tiempo real (<120 ms por frase).",
        "Generar audios de prueba a partir de texto con timbre coherente.",
        "Verificar el aislamiento estricto de archivos de audio residuales."
      ],
      automatizaciones: "Inferencia local determinista con HTDemucs y modelos optimizados para Metal Performance Shaders."
    },
    "terminales": {
      titulo: "Terminales (Lanzadores locales)",
      subtitulo: "Panel de control de procesos locales, puertos activos y herramientas de apoyo",
      resumen: "Lanzador y monitor visual de servicios locales (Oficina, Directo, Herdr, Motor).",
      para_que_sirve: "Ofrece un cuadro de mandos para supervisar los procesos de soporte de la Oficina ApliArte, comprobar qué puertos están escuchando y ejecutar diagnósticos rápidos sin necesidad de abrir múltiples pestañas de terminal.",
      que_puedes_hacer: [
        "Verificar el estado y PID de cada servidor local del ecosistema.",
        "Comprobar si los puertos :8790 y :8791 están respondiendo.",
        "Lanzar scripts de sincronización (bin/sync.py) con un clic.",
        "Inspeccionar registros de actividad recientes sin ensuciar la consola."
      ],
      automatizaciones: "Lectura de procesos en segundo plano con protección contra reinicios accidentales."
    },
    "blogger": {
      titulo: "Blogger (Monitor y difusión)",
      subtitulo: "Gestor de publicaciones técnicas, artículos de divulgación y webhooks",
      resumen: "Monitorización de artículos publicados, imágenes en CDN y despacho desatendido.",
      para_que_sirve: "Permite redactar, maquetar y hacer seguimiento de las crónicas técnicas y artículos publicados en Blogger y redes. Valida que las capturas estén en CDN permanente y despacha avisos vía n8n webhook.",
      que_puedes_hacer: [
        "Ver el listado de publicaciones recientes y borradores en preparación.",
        "Comprobar la disponibilidad permanente de imágenes y capturas de pantalla.",
        "Simular el envío de webhooks para notificar nuevas publicaciones.",
        "Revisar el formato HTML limpio antes de la subida definitiva."
      ],
      automatizaciones: "Despacho automatizado mediante n8n webhook y sincronización con el feed RSS de ApliArte."
    },
    "bitacora": {
      titulo: "Bitácora (Proyectos y enlaces)",
      subtitulo: "Directorio soberano de repositorios, documentación y enlaces canónicos",
      resumen: "Índice navegable de proyectos del ecosistema organizado por categorías.",
      para_que_sirve: "Centraliza los enlaces a todos los repositorios de ErBolamm y ApliArte (aplicaciones móviles, webapps, bots, paquetes y módulos de apoyo), permitiendo consultar de un vistazo su estado de Git, ficha técnica y documentación viva.",
      que_puedes_hacer: [
        "Filtrar proyectos por categoría (App móvil, Webapp, Paquete, Bot).",
        "Acceder rápidamente a los repositorios de GitHub y a su documentación.",
        "Verificar qué repositorios tienen activado el estándar soberano ADR-0013.",
        "Consultar los ingredientes canónicos de cada categoría técnica."
      ],
      automatizaciones: "Lectura de metadatos estáticos desde el registro central de proyectos del ecosistema."
    },
    "diapositivas": {
      titulo: "Diapositivas y Difusión Multilingüe",
      subtitulo: "Mazo interactivo de diapositivas y pistas de audio sincronizadas para directos",
      resumen: "Presentaciones interactivas en HTML5 con locución sincronizada en 7 idiomas.",
      para_que_sirve: "Permite visualizar y controlar las presentaciones técnicas de cada aplicación de forma autónoma. Cada repositorio aloja soberanamente su mazo HTML5, su escaleta técnica (guion-directo.md) y sus pistas de audio multilingües (ES, EN, DE, FR, IT, PT, RU) bajo control-erbolamm/difusion/directo/presentacion/ sin añadir dependencias en producción.",
      que_puedes_hacer: [
        "Seleccionar el repositorio que deseas presentar con un solo clic.",
        "Navegar entre las diapositivas con teclado o con la botonera táctil.",
        "Cambiar el idioma de la locución en tiempo real entre 7 idiomas soportados.",
        "Pausar o reanudar la reproducción de audio de la diapositiva en pantalla.",
        "Activar pantalla completa para emisión limpia en OBS o emisiones en vivo.",
        "Inicializar plantillas soberanas de diapositivas en proyectos nuevos."
      ],
      automatizaciones: "Lectura soberana de recursos en disco sin dependencias externas ni servicios en la nube."
    },
    "shorts": {
      titulo: "Shorts (Vídeo acelerado a 60 s)",
      subtitulo: "Transformación de directos y vídeos extensos en resúmenes acelerados de 60 segundos",
      resumen: "Generación automatizada de vídeos cortos verticales con ffmpeg local.",
      para_que_sirve: "Lista los vídeos de una carpeta local de entrada, lee su duración con ffprobe, calcula el factor (duración / 60) y genera con ffmpeg un vídeo acelerado de 60 segundos en una carpeta de salida. Antes de ejecutar muestra la duración, el factor, la resolución y el comando exacto, y pide confirmación. El original nunca se modifica, mueve ni borra.",
      que_puedes_hacer: [
        "Elegir el vídeo de la carpeta de entrada y recortar un tramo si es necesario.",
        "Calcular al instante el factor exacto de aceleración para llegar a 60 s.",
        "Elegir el formato: horizontal original, vertical 9:16 con recorte o giro.",
        "Superponer textos informativos y marcas de agua sin dependencias externas.",
        "Ver el plan completo y el comando de ffmpeg antes de ejecutar nada."
      ],
      automatizaciones: "Uso exclusivo de ffmpeg y ffprobe locales, sin subir archivos a servidores externos ni tocar Google Drive."
    },
    "resenas": {
      titulo: "Reseñas (Contestador inteligente)",
      subtitulo: "Atención al usuario y respuestas automáticas para apps en Google Play y App Store",
      resumen: "Descarga, traducción instantánea y propuestas de respuesta para opiniones de usuarios.",
      para_que_sirve: "Descarga y organiza las opiniones que los usuarios dejan en tus aplicaciones de Google Play y App Store. Traduce al momento cualquier reseña escrita en otro idioma y te prepara una propuesta de respuesta respetuosa, profesional y adaptada a tus normas.",
      que_puedes_hacer: [
        "Filtrar valoraciones por estrellas (1 a 5) o por aplicación.",
        "Leer la traducción en español de comentarios en inglés, francés, alemán u otros idiomas.",
        "Generar un borrador de respuesta con inteligencia artificial y retocarlo a tu gusto.",
        "Elegir el tono de contestación (amable, técnico o directo) según tu criterio."
      ],
      automatizaciones: "Bloquea el uso de claves externas inseguras y guarda las configuraciones en tu carpeta privada local de forma segura."
    },
    "settings": {
      titulo: "Ajustes (Opciones por defecto)",
      subtitulo: "Panel centralizado de opciones y valores por defecto de la Oficina ApliArte",
      resumen: "Configuración global de preferencias, duraciones y tokens de acción seguros.",
      para_que_sirve: "Permite configurar y sincronizar de forma persistente y soberana los valores por defecto de todas las vistas de la Oficina (duración de Shorts, subtítulos, modelos de voz, tema visual y credenciales).",
      que_puedes_hacer: [
        "Ajustar la duración por defecto de generación de Shorts.",
        "Configurar el formato y visibilidad de subtítulos.",
        "Definir el modelo y voz por defecto para síntesis.",
        "Guardar los cambios de forma centralizada con token de acción seguro."
      ],
      automatizaciones: "Almacenamiento soberano en tareas/configuracion-oficina.json con soporte de fallback y validación de tokens de acción."
    }
  };

  // Normalización del slug
  const info = MODULOS_CATALOGO[slug] || {
    titulo: paramTitulo || "Módulo de la Oficina",
    subtitulo: paramSubtitulo || "Demostración visual y ficha explicativa",
    resumen: "Vista explicativa del módulo con datos simulados de ejemplo.",
    para_que_sirve: "Permite interactuar con las capacidades operativas de la herramienta y conocer sus directivas de integración.",
    que_puedes_hacer: [
      "Explorar la interfaz simulada de la herramienta.",
      "Verificar directivas de aislamiento y modo de solo lectura.",
      "Enviar propuestas o comentarios en el tablón público de GitHub."
    ],
    automatizaciones: "Operación determinista local con datos simulados de ejemplo."
  };

  // Actualizar títulos del documento
  document.title = `${info.titulo} · Oficina ApliArte`;
  const h1 = $('#view-title');
  if (h1) h1.textContent = info.titulo;
  const lead = $('#view-subtitle');
  if (lead) lead.textContent = info.subtitulo;

  const badgeEstado = $('#badge-estado');
  const artPlaceholder = $('#art-placeholder');
  if (artPlaceholder) artPlaceholder.style.display = 'none';

  const feedbackBtn = $('.btn-contextual-feedback');
  if (feedbackBtn) {
    const estadoLabel = slug === 'descargas' ? 'En preparación' : 'Demostración visual';
    const cleanTitle = info.titulo.split('(')[0].trim();
    const issueTitle = `[Propuesta] ${cleanTitle} (${estadoLabel}): `;
    const issueBody = `### Contexto\n- **Sección**: ${cleanTitle}\n- **Estado**: ${estadoLabel}\n- **Slug**: ${slug}\n\n### Comentario o propuesta\n`;
    feedbackBtn.href = `https://github.com/erbolamm/oficina-apliarte/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
    const aria = `Comentar o proponer una idea sobre ${cleanTitle} (${estadoLabel})`;
    feedbackBtn.title = aria;
    feedbackBtn.setAttribute('aria-label', aria);
  }

  const issueBtn = $('.btn-issues');
  if (issueBtn) {
    issueBtn.href = `https://github.com/erbolamm/oficina-apliarte/issues/new?title=${encodeURIComponent('[' + info.titulo + '] ')}`;
    const span = issueBtn.querySelector('span');
    if (span) span.textContent = `Enviar idea o propuesta sobre ${info.titulo.split('(')[0].trim()}`;
  }
  const issueStrong = $('.issues-copy strong');
  if (issueStrong) {
    issueStrong.textContent = `¿Tienes una idea o propuesta para ${info.titulo.split('(')[0].trim()}?`;
  }

  const container = $('#showcase-container');
  if (!container) return;

  // Si es la sección de Descargas: único bloque marcado «En preparación»
  if (slug === 'descargas') {
    if (badgeEstado) {
      badgeEstado.className = 'badge-preparacion';
      badgeEstado.textContent = 'En preparación · Lista blanca de salida';
    }

    container.innerHTML = `
      <div class="showcase-grid">
        <div class="showcase-info-card">
          <h3><span>📦</span> Distribución Soberana</h3>
          <p>${info.para_que_sirve}</p>
        </div>
        <div class="showcase-info-card">
          <h3><span>🛡️</span> Garantía de Seguridad</h3>
          <p>${info.automatizaciones}</p>
        </div>
      </div>

      <div class="demo-sandbox">
        <div class="demo-sandbox-header">
          <h2 class="demo-sandbox-title"><span>⬇</span> Componentes Soberanos en Preparación</h2>
          <span class="badge-preparacion">En preparación</span>
        </div>
        <p style="margin:0 0 16px; font-size:14px; color:var(--ink-muted); line-height:1.5;">
          Cada componente se entrega en empaquetado autónomo para macOS, Linux y Windows, con instalación limpia sin telemetría ni suscripciones forzosas.
        </p>

        <div class="downloads-grid">
          <div class="download-card">
            <div>
              <div class="download-card-icon">🎙</div>
              <h3>Asistente ApliArte</h3>
              <p>Interfaz de escritorio soberana con dictado por voz, accesibilidad visual (fuentes gigantes), lectura TTS y comunicación sin fatiga.</p>
            </div>
            <div>
              <span class="demo-status-pill" style="margin-bottom:12px; display:inline-block;">macOS · Windows · Linux</span>
              <a href="#" class="download-btn-disabled" onclick="event.preventDefault(); alert('Asistente ApliArte está en preparación. Se publicará tras la auditoría de empaquetado autónomo.');">
                <span>En preparación (v0.1)</span>
              </a>
            </div>
          </div>

          <div class="download-card">
            <div>
              <div class="download-card-icon">⚙</div>
              <h3>Motor ApliArte</h3>
              <p>Núcleo de cálculo numérico exacto al céntimo (gestoría, autónomos, SES.Hospedajes), catálogo unificado de skills y orquestación local.</p>
            </div>
            <div>
              <span class="demo-status-pill" style="margin-bottom:12px; display:inline-block;">CLI universal · Python / Dart</span>
              <a href="#" class="download-btn-disabled" onclick="event.preventDefault(); alert('Motor ApliArte está en preparación. Se publicará tras verificar la lista blanca estricta de salida.');">
                <span>En preparación (v0.1)</span>
              </a>
            </div>
          </div>

          <div class="download-card">
            <div>
              <div class="download-card-icon">🤖</div>
              <h3>Orquestador ApliArte</h3>
              <p>Agente soberano de repositorio con metodología ODD (Desarrollo Guiado por Opciones), staging quirúrgico y revisión humana en 1 clic.</p>
            </div>
            <div>
              <span class="demo-status-pill" style="margin-bottom:12px; display:inline-block;">Plantilla Git autónoma</span>
              <a href="#" class="download-btn-disabled" onclick="event.preventDefault(); alert('Orquestador ApliArte está en preparación. Se publicará con la plantilla homologada de repositorio.');">
                <span>En preparación (v0.1)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Para los 19 escaparates: badge discreto de demostración visual
  if (badgeEstado) {
    badgeEstado.className = 'badge-demo';
    badgeEstado.textContent = 'Demostración visual · Datos simulados de ejemplo';
  }

  // Generador de widget interactivo específico por módulo
  function renderDemoSandbox(currentSlug) {
    switch (currentSlug) {
      case 'reflect':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>◐</span> Comparativa de Modelos: Modelo Pequeño vs. Modelo Grande</h2>
              <span class="demo-live-badge">Demostración interactiva</span>
            </div>
            <p style="margin:0 0 16px; font-size:14px; color:var(--ink-muted); line-height:1.5;">
              Evaluación empírica neurosimbólica: comparativa real de generación gráfica ante una misma petición. Demuestra cómo un modelo pequeño produce un acabado plano y básico, mientras un modelo grande logra volumen tridimensional, reflejos de cristal y tipografía caligráfica integrada.
            </p>

            <div class="heart-compare-container">
              <!-- Modelo Ligero / Local -->
              <div class="heart-card">
                <div>
                  <h3 class="heart-model-title">Modelo Ligero / Local</h3>
                  <span class="heart-model-badge">Coste 0 · Baja latencia · Acabado plano</span>
                </div>
                <div class="heart-svg-wrapper">
                  <img id="heart-simple-img" class="heart-img heart-svg-pulse-simple" src="${assetBase}/assets/reflect/corazon-modelo-basico.jpg" alt="Resultado gráfico de modelo ligero con acabado plano" width="180" height="180" loading="lazy">
                </div>
                <div class="heart-metrics">
                  <div class="metric-row"><span>Acabado visual:</span><strong>Vector plano básico</strong></div>
                  <div class="metric-row"><span>Iluminación y volumen:</span><strong>Sin profundidad 3D</strong></div>
                  <div class="metric-row"><span>Peso optimizado:</span><strong>36 KB (sin metadatos)</strong></div>
                  <div class="metric-row"><span>Uso óptimo:</span><strong>Borradores rápidos</strong></div>
                </div>
              </div>

              <!-- Modelo Grande / Razonamiento -->
              <div class="heart-card">
                <div>
                  <h3 class="heart-model-title">Modelo Avanzado</h3>
                  <span class="heart-model-badge">Alta fidelidad · Volumen 3D e iluminación</span>
                </div>
                <div class="heart-svg-wrapper">
                  <img id="heart-complex-img" class="heart-img heart-svg-pulse-complex" src="${assetBase}/assets/reflect/corazon-modelo-avanzado.jpg" alt="Resultado gráfico de modelo avanzado con volumen tridimensional" width="180" height="180" loading="lazy">
                </div>
                <div class="heart-metrics">
                  <div class="metric-row"><span>Acabado visual:</span><strong>Cristal 3D y filigrana</strong></div>
                  <div class="metric-row"><span>Iluminación y volumen:</span><strong>Reflejos y partículas</strong></div>
                  <div class="metric-row"><span>Peso optimizado:</span><strong>63 KB (sin metadatos)</strong></div>
                  <div class="metric-row"><span>Uso óptimo:</span><strong>Piezas finales de calidad</strong></div>
                </div>
              </div>
            </div>

            <div class="demo-control-row" style="justify-content:center; margin-top:20px;">
              <button type="button" class="demo-btn" id="btn-toggle-pulse">Pausar pulso</button>
            </div>
          </div>
        `;

      case 'seo':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>🔍</span> Auditoría On-Page en Vivo (Simulador SEO)</h2>
              <span class="demo-live-badge">Puntuación: 98 / 100</span>
            </div>
            <p style="margin:0 0 14px; font-size:14px; color:var(--ink-muted);">URL analizada: <code>https://apliarte.com</code> (Entorno de pruebas estático)</p>
            <table class="demo-table">
              <thead><tr><th>Elemento</th><th>Estado</th><th>Detalle verificado</th></tr></thead>
              <tbody>
                <tr><td><strong>Meta Title</strong></td><td><span style="color:#059669;">✓ Válido</span></td><td>52 / 60 caracteres (ApliArte · Software Artesanal Soberano)</td></tr>
                <tr><td><strong>Meta Description</strong></td><td><span style="color:#059669;">✓ Válido</span></td><td>148 / 160 caracteres con llamada a la acción clara</td></tr>
                <tr><td><strong>Open Graph Card</strong></td><td><span style="color:#059669;">✓ Completo</span></td><td>og:title, og:description, og:image (1200x630 px) detectados</td></tr>
                <tr><td><strong>Marcado Schema.org</strong></td><td><span style="color:#059669;">✓ Válido</span></td><td>JSON-LD de tipo SoftwareApplication sin errores de sintaxis</td></tr>
                <tr><td><strong>Etiqueta Canonical</strong></td><td><span style="color:#059669;">✓ Canónica</span></td><td>Evita duplicidades en subrutas y parámetros de sesión</td></tr>
              </tbody>
            </table>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" onclick="alert('Simulación: Auditoría SEO completada con éxito. 0 advertencias críticas.');">Re-evaluar metadatos (Simulado)</button>
              <span class="demo-status-pill">Tiempo de análisis: 42 ms</span>
            </div>
          </div>
        `;

      case 'inicio-dia':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>☼</span> Radar Matutino del Ecosistema</h2>
              <span class="demo-live-badge">Todos los servicios en orden</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; margin:14px 0;">
              <div style="background:var(--surface); padding:14px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Puerto :8791 (Oficina)</strong>
                <p style="margin:4px 0 0; color:#059669; font-size:13px;">● Activo (Escaparate web)</p>
              </div>
              <div style="background:var(--surface); padding:14px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Puerto :8790 (Directo)</strong>
                <p style="margin:4px 0 0; color:var(--ink-muted); font-size:13px;">○ En reposo (Listo para streaming)</p>
              </div>
              <div style="background:var(--surface); padding:14px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>VPS remote-72</strong>
                <p style="margin:4px 0 0; color:#059669; font-size:13px;">● RAM 38% libre · 28 contenedores</p>
              </div>
            </div>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" onclick="alert('Simulación matutina: Servicios verificados. Sin bloqueos pendientes.');">Comprobar checklist matutino</button>
            </div>
          </div>
        `;

      case 'aplichat':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>💬</span> Simulador de Interfaz ApliChat</h2>
              <span class="demo-live-badge">Accesibilidad activa</span>
            </div>
            <div style="background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:14px; margin:12px 0;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--light); padding-bottom:8px; margin-bottom:10px;">
                <span style="font-weight:700; color:var(--ink);">Conversación con el Intérprete</span>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="demo-btn demo-btn-secondary" style="padding:2px 8px; font-size:11px;">A</button>
                  <button type="button" class="demo-btn demo-btn-secondary" style="padding:2px 8px; font-size:11px;">A+</button>
                  <button type="button" class="demo-btn demo-btn-secondary" style="padding:2px 8px; font-size:11px;">TTS 1.25x</button>
                </div>
              </div>
              <div style="background:var(--subtle); padding:10px 14px; border-radius:8px; margin-bottom:8px;">
                <small style="color:var(--ink-muted); display:block; margin-bottom:4px;">Intérprete · 09:40 CET</small>
                <span style="color:var(--ink);">Revisión lista para comprobación visual en local. Todos los módulos disponen de escaparate y datos simulados.</span>
              </div>
              <div style="display:flex; justify-content:flex-end;">
                <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:#059669; background:rgba(16,185,129,0.1); padding:4px 10px; border-radius:999px;">
                  ✓ Leído y de acuerdo por Javier
                </span>
              </div>
            </div>
          </div>
        `;

      case 'conectores':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>⇄</span> Inventario de Conectores Seguros</h2>
              <span class="demo-live-badge">Secretos enmascarados</span>
            </div>
            <table class="demo-table">
              <thead><tr><th>Servicio</th><th>Uso principal</th><th>Estado de credencial</th></tr></thead>
              <tbody>
                <tr><td><strong>Blogger API</strong></td><td>Publicación automática de artículos</td><td><span style="color:#059669;">● En uso</span> (Configurado en entorno local)</td></tr>
                <tr><td><strong>App Store Connect</strong></td><td>Fichas y TestFlight con Fastlane</td><td><span style="color:#059669;">● En uso</span> (API Key privada .p8)</td></tr>
                <tr><td><strong>Google Play</strong></td><td>Auditoría de versiones y fichas</td><td><span style="color:#059669;">● En uso</span> (Service Account JSON)</td></tr>
                <tr><td><strong>AdMob</strong></td><td>Gestión de bloques publicitarios y app-ads.txt</td><td><span style="color:#059669;">● En uso</span> (Identificador de app verificado)</td></tr>
              </tbody>
            </table>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" onclick="alert('Simulación: Comando copiado al portapapeles: dart run bin/trabajo.dart conectores auditar');">Copiar comando de auditoría</button>
            </div>
          </div>
        `;

      case 'plugins':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>⊞</span> Gestor de Pestañas de la Barra Lateral</h2>
              <span class="demo-live-badge">Persistencia en navegador</span>
            </div>
            <p style="margin:0 0 12px; font-size:14px; color:var(--ink-muted);">Marca las pestañas que deseas visibles en tu sesión actual:</p>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked disabled> Oficina (Protegida)</label>
              <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked disabled> Talent Land (Protegida)</label>
              <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked> Radar Multi-agente</label>
              <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked> Módulos Verticales</label>
              <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked> Estudio de Diseño</label>
              <label style="display:flex; align-items:center; gap:8px; font-size:13px;"><input type="checkbox" checked> Tiendas y ASO</label>
            </div>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" onclick="alert('Preferencia guardada en tu navegador (localStorage).');">Guardar selección</button>
            </div>
          </div>
        `;

      case 'diseno':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>🎨</span> Banco de Vídeo y Marcos de Dispositivos</h2>
              <span class="demo-live-badge">Canvas Reactivo</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:14px; margin:14px 0;">
              <div style="flex:1 1 260px; background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:16px; text-align:center;">
                <div style="width:100%; height:120px; background:linear-gradient(135deg, rgba(0,95,169,0.15), rgba(94,206,245,0.25)); border-radius:8px; display:grid; place-items:center; font-weight:700; color:var(--navy);">
                  Formato 16:9 (Horizontal)
                </div>
                <small style="color:var(--ink-muted); display:block; margin-top:8px;">1920x1080 px · Directos y Twitch</small>
              </div>
              <div style="flex:1 1 260px; background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:16px; text-align:center;">
                <div style="width:100%; height:120px; background:linear-gradient(135deg, rgba(232,149,94,0.15), rgba(245,158,11,0.25)); border-radius:8px; display:grid; place-items:center; font-weight:700; color:var(--brown);">
                  Formato 9:16 (Vertical)
                </div>
                <small style="color:var(--ink-muted); display:block; margin-top:8px;">1080x1920 px · Shorts y Reels</small>
              </div>
            </div>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" onclick="alert('Generador de marcos iniciado en modo simulado.');">Simular render de marco</button>
            </div>
          </div>
        `;

      case 'tiendas':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>🎯</span> Validador de Metadatos y Contador ASO</h2>
              <span class="demo-live-badge">Anti-rechazo Guideline 2.3.3</span>
            </div>
            <div style="background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:14px; margin:12px 0;">
              <label style="display:block; font-size:13px; font-weight:700; color:var(--ink); margin-bottom:6px;">
                Campo Palabras Clave Apple (Límite: 100 caracteres sin espacios tras comas):
              </label>
              <div class="demo-code" style="margin:4px 0 8px;">
                musica,procedural,composicion,audio,sintesis,ondas,estudio,ritmo,melodia,instrumentos,sonido
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px; color:#059669;">
                <span>✓ Longitud: 96 / 100 caracteres</span>
                <span>✓ Cumple directiva sin palabras prohibidas</span>
              </div>
            </div>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" onclick="alert('Simulación: Conjunto de keywords verificado y apto para App Store.');">Comprobar reglas de tienda</button>
            </div>
          </div>
        `;

      case 'mercado':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>📊</span> Radar de Tendencias y Oportunidades</h2>
              <span class="demo-live-badge">Datos sincronizados</span>
            </div>
            <table class="demo-table">
              <thead><tr><th>Tema / Tecnología</th><th>Índice de interés</th><th>Oportunidad ApliArte</th></tr></thead>
              <tbody>
                <tr><td><strong>Modelos locales ligeros (SLMs)</strong></td><td><strong style="color:#059669;">+42%</strong></td><td>Inferencia en Apple Silicon a coste cero</td></tr>
                <tr><td><strong>Arquitecturas desacopladas</strong></td><td><strong style="color:#059669;">+28%</strong></td><td>Módulos verticales independientes sin vendor lock-in</td></tr>
                <tr><td><strong>Audio procedural algorítmico</strong></td><td><strong style="color:#059669;">+19%</strong></td><td>Fondos libres de derechos para streamers y creadores</td></tr>
              </tbody>
            </table>
          </div>
        `;

      case 'musica':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>🎵</span> Sintetizador Procedural Strudel</h2>
              <span class="demo-live-badge">120 BPM · Algoritmo activo</span>
            </div>
            <div class="demo-code" style="margin:10px 0;">
// Patrón procedural en código limpio para directos
s("bd ~ sd ~").fast(2)
  .bank("RolandTR808")
  .crush(4)
  .gain(0.8);
            </div>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" id="btn-play-musica" onclick="alert('Simulación: Audio procedural Strudel iniciado a 120 BPM.');">▶ Iniciar reproducción</button>
              <span class="demo-status-pill">Web Audio API · Modo local</span>
            </div>
          </div>
        `;

      case 'locucion':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>🎙</span> Estimador de Locución y Guiones</h2>
              <span class="demo-live-badge">Calibrador 150 PPM</span>
            </div>
            <p style="margin:0 0 10px; font-size:14px; color:var(--ink-muted);">Texto de prueba (guion para vídeo de 60 segundos):</p>
            <div style="background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:12px; font-size:13px; line-height:1.5;">
              "En este vídeo te mostramos cómo funciona la arquitectura desacoplada de la Oficina ApliArte. Cada módulo vive en su propio repositorio soberano y opera con privacidad absoluta en disco local sin cuotas mensuales."
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:13px;">
              <span>Palabras: <strong>36</strong></span>
              <span>Tiempo estimado a 150 PPM: <strong style="color:#059669;">14.4 segundos</strong></span>
              <span>Encaja en vídeo de 60 s: <strong style="color:#059669;">✓ Sí (holgura para pausas)</strong></span>
            </div>
          </div>
        `;

      case 'voicestudio':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>⚡</span> Síntesis Vocal Acelerada en Apple Silicon</h2>
              <span class="demo-live-badge">Latencia: 98 ms</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin:14px 0;">
              <div style="background:var(--surface); padding:12px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Motor Neural</strong>
                <p style="margin:4px 0 0; color:#059669; font-size:13px;">Metal Performance Shaders (MPS)</p>
              </div>
              <div style="background:var(--surface); padding:12px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Fidelidad Vocal</strong>
                <p style="margin:4px 0 0; color:#059669; font-size:13px;">99.4% coherencia tímbrica</p>
              </div>
              <div style="background:var(--surface); padding:12px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Aislamiento</strong>
                <p style="margin:4px 0 0; color:#059669; font-size:13px;">100% en memoria local</p>
              </div>
            </div>
          </div>
        `;

      case 'terminales':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>▣</span> Cuadro de Mando de Terminales</h2>
              <span class="demo-live-badge">4 procesos monitorizados</span>
            </div>
            <table class="demo-table">
              <thead><tr><th>Proceso / Servicio</th><th>Puerto</th><th>PID</th><th>Estado</th></tr></thead>
              <tbody>
                <tr><td><strong>Oficina ApliArte</strong></td><td>:8791</td><td><code>24810</code></td><td><span style="color:#059669;">● Escuchando</span></td></tr>
                <tr><td><strong>Centro de Directo</strong></td><td>:8790</td><td><code>-</code></td><td><span style="color:var(--ink-muted);">○ En reposo</span></td></tr>
                <tr><td><strong>Motor ApliArte</strong></td><td>Local</td><td><code>24812</code></td><td><span style="color:#059669;">● Activo</span></td></tr>
                <tr><td><strong>Sincronizador Soberano</strong></td><td>Local</td><td><code>24815</code></td><td><span style="color:#059669;">● Activo</span></td></tr>
              </tbody>
            </table>
          </div>
        `;

      case 'blogger':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>✎</span> Monitor de Publicaciones y Webhooks</h2>
              <span class="demo-live-badge">n8n Conectado</span>
            </div>
            <table class="demo-table">
              <thead><tr><th>Título de la crónica</th><th>Fecha</th><th>Imágenes CDN</th><th>Estado</th></tr></thead>
              <tbody>
                <tr><td>Arquitectura modular desacoplada en ApliArte</td><td>2026-11-21</td><td><span style="color:#059669;">✓ Optimizadas</span></td><td>Publicado</td></tr>
                <tr><td>Talent Land 2026: Crónica y resultados del reto en directo</td><td>2026-11-20</td><td><span style="color:#059669;">✓ Permanentes</span></td><td>Publicado</td></tr>
                <tr><td>Cómo funciona la confirmación humana en un clic</td><td>2026-11-18</td><td><span style="color:#059669;">✓ Verificadas</span></td><td>Borrador</td></tr>
              </tbody>
            </table>
          </div>
        `;

      case 'bitacora':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>☰</span> Directorio Soberano de Repositorios</h2>
              <span class="demo-live-badge">100% ADR-0013</span>
            </div>
            <table class="demo-table">
              <thead><tr><th>Repositorio</th><th>Categoría</th><th>Soberanía</th><th>Enlace</th></tr></thead>
              <tbody>
                <tr><td><strong>oficina-apliarte</strong></td><td>Webapp</td><td>ADR-0013 / ADR-0014</td><td><a href="https://github.com/erbolamm/oficina-apliarte" target="_blank" rel="noopener">GitHub</a></td></tr>
                <tr><td><strong>inemsellar_app</strong></td><td>App móvil</td><td>ADR-0013 Oficial</td><td><a href="https://github.com/erbolamm/inemsellar_app" target="_blank" rel="noopener">GitHub</a></td></tr>
                <tr><td><strong>calca_app</strong></td><td>App móvil</td><td>ADR-0013 Oficial</td><td><a href="https://github.com/erbolamm/calca_app" target="_blank" rel="noopener">GitHub</a></td></tr>
                <tr><td><strong>motor-apliarte</strong></td><td>Motor / Paquetes</td><td>ADR-0013 Oficial</td><td><a href="https://github.com/erbolamm/motor-apliarte" target="_blank" rel="noopener">GitHub</a></td></tr>
              </tbody>
            </table>
          </div>
        `;

      case 'diapositivas':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>⎘</span> Controlador de Diapositivas Multilingües</h2>
              <span class="demo-live-badge">30 Diapositivas sincronizadas</span>
            </div>
            <div style="background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:16px; margin:12px 0; text-align:center;">
              <span style="font-size:13px; color:var(--ink-muted);">Diapositiva activa: <strong>12 / 30</strong></span>
              <h3 style="margin:8px 0; color:var(--ink);">Arquitectura Neurosimbólica y Determinismo Numérico</h3>
              <div style="display:flex; justify-content:center; gap:8px; margin-top:14px;">
                <button type="button" class="demo-btn demo-btn-secondary">◀ Anterior</button>
                <button type="button" class="demo-btn">▶ Siguiente</button>
                <button type="button" class="demo-btn demo-btn-secondary">🔊 Idioma: ES</button>
              </div>
            </div>
          </div>
        `;

      case 'shorts':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>⏩</span> Calculador de Aceleración a 60 Segundos</h2>
              <span class="demo-live-badge">ffmpeg local</span>
            </div>
            <div style="background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:14px; margin:12px 0;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
                <span>Duración original del directo:</span><strong>48 minutos (2.880 s)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
                <span>Factor de aceleración calculado:</span><strong style="color:#059669;">48x</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span>Duración exacta final:</span><strong>60.0 segundos</strong>
              </div>
            </div>
            <div class="demo-code">
ffmpeg -i entrada.mp4 -filter:v "setpts=PTS/48" -an -c:v libx264 salida_60s.mp4
            </div>
          </div>
        `;

      case 'resenas':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>★</span> Contestador Inteligente de Reseñas</h2>
              <span class="demo-live-badge">Traducción instantánea</span>
            </div>
            <div style="background:var(--surface); border:1px solid var(--light); border-radius:var(--radius-sm); padding:14px; margin:12px 0;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <strong>⭐⭐⭐⭐⭐ "Sehr nützliche App für den Alltag!"</strong>
                <small style="color:var(--ink-muted);">Google Play Alemania</small>
              </div>
              <p style="margin:0 0 8px; font-size:13px; color:var(--ink-muted);">Traducción automática: <em>"¡Aplicación muy útil para el día a día!"</em></p>
              <div style="background:var(--subtle); padding:10px; border-radius:6px; font-size:13px; color:var(--ink);">
                <strong>Propuesta de respuesta (Tono cercano):</strong><br>
                "¡Muchas gracias por tu valoración! Nos alegra saber que te resulta útil. Seguimos trabajando para mejorar la experiencia en cada actualización."
              </div>
            </div>
            <div class="demo-control-row">
              <button type="button" class="demo-btn" onclick="alert('Respuesta aprobada en modo simulado.');">Aprobar respuesta</button>
            </div>
          </div>
        `;

      case 'settings':
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>⚙</span> Opciones por Defecto de la Oficina</h2>
              <span class="demo-live-badge">Token validado</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; margin:14px 0;">
              <div style="background:var(--surface); padding:12px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Duración Shorts por defecto</strong>
                <p style="margin:4px 0 0; color:var(--ink-muted); font-size:13px;">60 segundos (factor automático)</p>
              </div>
              <div style="background:var(--surface); padding:12px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Modo de navegación</strong>
                <p style="margin:4px 0 0; color:var(--ink-muted); font-size:13px;">Barra canónica completa</p>
              </div>
              <div style="background:var(--surface); padding:12px; border:1px solid var(--light); border-radius:var(--radius-sm);">
                <strong>Aislamiento de red</strong>
                <p style="margin:4px 0 0; color:#059669; font-size:13px;">Estricto local (Sin llamadas externas)</p>
              </div>
            </div>
          </div>
        `;

      default:
        return `
          <div class="demo-sandbox">
            <div class="demo-sandbox-header">
              <h2 class="demo-sandbox-title"><span>ℹ</span> Demostración Visual del Módulo</h2>
              <span class="demo-live-badge">Simulado</span>
            </div>
            <p style="margin:0; font-size:14px; color:var(--ink-muted); line-height:1.5;">
              Este módulo se ejecuta de forma autónoma con datos simulados de ejemplo, respetando la soberanía de repositorio bajo ADR-0013.
            </p>
          </div>
        `;
    }
  }

  // Renderizar la vista completa
  container.innerHTML = `
    <!-- Navegación interna del escaparate -->
    <div class="showcase-nav">
      <button type="button" class="showcase-tab-btn" id="tab-btn-demo" aria-selected="true">Demostración Interactiva</button>
      <button type="button" class="showcase-tab-btn" id="tab-btn-ficha" aria-selected="false">Ficha Técnica y Capacidades</button>
    </div>

    <!-- Panel 1: Demostración Interactiva -->
    <div id="panel-demo">
      ${renderDemoSandbox(slug)}
    </div>

    <!-- Panel 2: Ficha Técnica y Capacidades -->
    <div id="panel-ficha" style="display:none;">
      <div class="showcase-grid">
        <div class="showcase-info-card">
          <h3><span>🎯</span> ¿Para qué sirve?</h3>
          <p>${info.para_que_sirve}</p>
        </div>
        <div class="showcase-info-card">
          <h3><span>⚡</span> ¿Qué puedes hacer?</h3>
          <ul>
            ${info.que_puedes_hacer.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="showcase-info-card">
          <h3><span>🛡️</span> Automatizaciones y Privacidad</h3>
          <p>${info.automatizaciones}</p>
        </div>
      </div>
    </div>
  `;

  // Controladores de pestañas internas
  const btnDemo = $('#tab-btn-demo');
  const btnFicha = $('#tab-btn-ficha');
  const panelDemo = $('#panel-demo');
  const panelFicha = $('#panel-ficha');

  if (btnDemo && btnFicha && panelDemo && panelFicha) {
    btnDemo.addEventListener('click', () => {
      btnDemo.setAttribute('aria-selected', 'true');
      btnFicha.setAttribute('aria-selected', 'false');
      panelDemo.style.display = 'block';
      panelFicha.style.display = 'none';
    });
    btnFicha.addEventListener('click', () => {
      btnFicha.setAttribute('aria-selected', 'true');
      btnDemo.setAttribute('aria-selected', 'false');
      panelDemo.style.display = 'none';
      panelFicha.style.display = 'block';
    });
  }

  // Eventos para el showcase de comparación de corazones en Reflect
  const btnTogglePulse = $('#btn-toggle-pulse');
  if (btnTogglePulse) {
    btnTogglePulse.addEventListener('click', () => {
      const simple = $('#heart-simple-img');
      const complex = $('#heart-complex-img');
      if (simple && complex) {
        const isPaused = simple.style.animationPlayState === 'paused';
        simple.style.animationPlayState = isPaused ? 'running' : 'paused';
        complex.style.animationPlayState = isPaused ? 'running' : 'paused';
        btnTogglePulse.textContent = isPaused ? 'Pausar pulso' : 'Reanudar pulso';
      }
    });
  }

  // Lógica para botones de compartir
  const origin = location.origin;
  const base = location.pathname.startsWith('/oficina-apliarte') ? '/oficina-apliarte' : '';
  const urls = { tab: `${origin}${base}/?vista=${encodeURIComponent(slug)}`, office: `${origin}${base}/` };
  const ic=(d)=>'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>'; const icons={WhatsApp:ic('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z"/>'),Telegram:ic('<path d="M22 2 11 13M22 2 15 22l-4-9-9-4z"/>'),X:ic('<path d="M4 4l16 16M20 4 4 20"/>'),Facebook:ic('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'),LinkedIn:ic('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'),Correo:ic('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'),Copiar:ic('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),Compartir:ic('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4"/>')};
  const share = $('#share');
  const status = $('#status');
  const back = $('.back');
  let scope = 'tab';

  if (!share) return;
  if (window.self !== window.top && back) back.hidden = true;

  const say = (text) => {
    if (!status) return;
    status.textContent = text;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => { status.textContent = ''; }, 2200);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } finally { ta.remove(); }
    }
    say('Texto y enlace copiados');
  };

  const hashtags = '#ApliArte #ErBolamm #OficinaApliArte';
  const msg = (u, t) => `Mira el escaparate de ${t} en la Oficina de ApliArte. Demostración abierta y soberana: ${u} ${hashtags}`;

  const targets = [
    ['WhatsApp', (u, t) => `https://wa.me/?text=${encodeURIComponent(msg(u, t))}`],
    ['Telegram', (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(msg(u, t))}`],
    ['X', (u, t) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(msg(u, t))}`],
    ['Facebook', (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`],
    ['LinkedIn', (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`],
    ['Correo', (u, t) => `mailto:?subject=${encodeURIComponent(msg(u, t))}&body=${encodeURIComponent(u)}`]
  ];

  const renderShare = () => {
    const url = urls[scope];
    const title = document.title;
    share.textContent = '';
    for (const [name, build] of targets) {
      const a = document.createElement('a');
      a.href = build(url, title);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', `Compartir en ${name}`);
      a.innerHTML = icons[name] + `<span>${name}</span>`;
      if (name === 'Facebook' || name === 'LinkedIn') {
        const cb = document.createElement('button');
        cb.type = 'button';
        cb.setAttribute('aria-label', `Copiar texto para ${name}`);
        cb.innerHTML = icons.Copiar + `<span>Copiar para ${name}</span>`;
        cb.addEventListener('click', () => copy(msg(url, title)));
        share.appendChild(cb);
      }
      share.appendChild(a);
    }
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Copiar enlace');
    copyBtn.innerHTML = icons.Copiar + '<span>Copiar</span>';
    copyBtn.addEventListener('click', () => copy(url));
    share.appendChild(copyBtn);
  };

  document.querySelectorAll('.seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      scope = btn.dataset.scope === 'office' ? 'office' : 'tab';
      document.querySelectorAll('.seg button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      renderShare();
    });
  });

  renderShare();
})();
