# Oficina ApliArte — Repositorio Soberano

Repositorio independiente y soberano de la **Oficina ApliArte**, desacoplada de `erbolamm-trabajo` conforme a los principios de arquitectura modular del ecosistema (ADR-0014 y ADR-0013).

---

## 🌐 Puerta de Entrada Viva (Producción en GitHub Pages)

Acceso directo a la suite desplegada en producción sin requerir servidor local activo:

- **Portada Oficial**: [https://erbolamm.github.io/oficina-apliarte/](https://erbolamm.github.io/oficina-apliarte/)
- **Módulos Verticales Desacoplados**: [https://erbolamm.github.io/oficina-apliarte/vistas/verticales.html](https://erbolamm.github.io/oficina-apliarte/vistas/verticales.html)
- **Escaparate de Aplicaciones**: [https://erbolamm.github.io/oficina-apliarte/vistas/aplicaciones.html](https://erbolamm.github.io/oficina-apliarte/vistas/aplicaciones.html)
- **Catálogo de Paquetes Flutter**: [https://erbolamm.github.io/oficina-apliarte/vistas/paquetes.html](https://erbolamm.github.io/oficina-apliarte/vistas/paquetes.html)
- **Tablero Comunitario de Tareas**: [https://erbolamm.github.io/oficina-apliarte/vistas/tareas.html](https://erbolamm.github.io/oficina-apliarte/vistas/tareas.html)
- **Tablero Comunitario de Propuestas**: [https://erbolamm.github.io/oficina-apliarte/vistas/propuestas.html](https://erbolamm.github.io/oficina-apliarte/vistas/propuestas.html)
- **Banco de Habilidades**: [https://erbolamm.github.io/oficina-apliarte/vistas/skills.html](https://erbolamm.github.io/oficina-apliarte/vistas/skills.html)
- **Gestión de Reseñas**: [https://erbolamm.github.io/oficina-apliarte/vistas/resenas.html](https://erbolamm.github.io/oficina-apliarte/vistas/resenas.html)
- **Instala tu Oficina**: [https://erbolamm.github.io/oficina-apliarte/vistas/instala-tu-oficina.html](https://erbolamm.github.io/oficina-apliarte/vistas/instala-tu-oficina.html)

---

## 🎯 Misión y Arquitectura

1. **Capa Visual Modular Desacoplada**: `oficina-apliarte` es estrictamente la interfaz visual desacoplada desde la que cualquier usuario o cliente descarga y activa en local únicamente los módulos necesarios sobre `motor-apliarte`. Se basa en un modelo abierto de libre descarga para uso en local por cuenta propia, con opción de acompañamiento profesional e instalación llave en mano mediante presupuesto a medida y sin compromiso (sin tarifas fijas).
2. **Habilidades Troncales Únicas en el Motor**: `motor-apliarte` es la fuente única de toda habilidad compartida. Queda prohibido duplicar habilidades en satélites o verticales; cada módulo comercial reutiliza las capacidades existentes del motor.
3. **Libertad de Terminal**: Todo módulo y contrato opera de forma agnóstica con cualquier terminal cliente elegida por el usuario (incluidos planes gratuitos de Antigravity, Codex o Grok, modelos locales o suscripciones como Claude Pro), funcionando con opciones accesibles sin forzar dependencias exclusivas.
4. **Modo Exclusivo de Solo Lectura Inicial**: Durante la fase de construcción, el servidor opera en modo de solo lectura para consulta y descarga de datos (habilidades, metadatos, catálogo), garantizando cero escrituras imprevistas o mutaciones no verificadas.
5. **Dominio Público y Acceso Seguro**: El dominio oficial `oficina.apliarte.com` con protección Cloudflare Zero Trust (autenticación obligatoria mediante Google) se activará tras la homologación completa de la suite.

---

## 📦 Estructura del Proyecto

```text
oficina-apliarte/
├── .github/               # Plantillas oficiales de incidencias para tareas y propuestas
├── datos/                 # Catálogos declarativos estructurados (verticales, aplicaciones, paquetes, tareas, propuestas, pestañas)
├── habilidades/           # Catálogo de habilidades soberanas servidas a los clientes
├── servidor/              # Servidor HTTP modular ligero en Python con soporte local y pruebas
├── tests/                 # Suite de pruebas unitarias automatizadas (48 pruebas superadas)
├── vistas/                # Vistas web responsivas y cliente universal JavaScript (escaparate.js)
├── index.html             # Portada principal y cliente universal tri-modo
├── README.md              # Documentación y puerta de entrada viva
└── AGENTS.md              # Protocolo canónico del orquestador local
```

---

## 🚀 Hoja de Ruta de Desarrollo

- [x] **Fase 0**: Inicialización del repositorio soberano, desacoplamiento, pruebas unitarias y blindaje ADR-0013.
- [x] **Fase 1**: Escaparate público con catálogos declarativos en JSON (`datos/aplicaciones.json`, `datos/paquetes.json`), vistas web dedicadas y navegación relativa de seis pestañas sin sondeo a red local.
- [x] **Fase 2**: Oficina Comunitaria con modelo unificado de siete campos (`datos/tareas.json`, `datos/propuestas.json`), vistas con formulario integrado y tope de 800 caracteres con contador en vivo, bifurcación limpia (puerto 8795 local vs visitante público con guardado en navegador y redirección a GitHub Issues), plantillas en `.github/ISSUE_TEMPLATE/` y 40 pruebas unitarias superadas.
- [ ] **Fase 3**: Migración progresiva de las siguientes herramientas del ecosistema a modo conectado y escaparate interactivo.
- [ ] **Fase 4**: Despliegue en el Servidor Privado Virtual (Hostinger) y activación de Cloudflare Zero Trust en `oficina.apliarte.com`.

---

## 🤝 Agradecimientos y Proyectos Abiertos

Oficina ApliArte y el ecosistema modular se construyen sobre los hombros de grandes proyectos libres, abiertos y comunitarios. Nuestro sincero reconocimiento y gratitud a:

- **Flutter y Dart**: Por proporcionar una base sólida, multiplataforma y tipada para interfaces y lógica de negocio.
- **Python**: Por su ecosistema versátil y determinista en servidores locales y herramientas de automatización.
- **Git**: Por la soberanía en el control de versiones y la trazabilidad quirúrgica.
- **Herdr**: Por el protocolo ligero y desacoplado de comunicación entre procesos y agentes.
- **Engram**: Por la persistencia estructurada y recuperación eficiente de memoria y contexto de trabajo.
- **Tailscale**: Por hacer posible redes malladas privadas y seguras con configuración mínima.
- **Docker**: Por el empaquetado reproducible y la contención de servicios.
- **n8n**: Por la orquestación visual y automatización de flujos de trabajo e integraciones.
- **Ollama y llama.cpp**: Por democratizar la inferencia de modelos de lenguaje en hardware local y de consumo.
- **mlx-whisper, Kokoro y Piper**: Por las capacidades punteras y eficientes de transcripción y síntesis de voz en local.
- **OpenCode y Pi**: Por los entornos ágiles y accesibles de ejecución en terminal.
- **HyperFrames**: Por la generación y renderizado programático declarativo de vídeo.
- **rea-agents**: Por la ingeniería inversa y el análisis riguroso de artefactos y binarios.

