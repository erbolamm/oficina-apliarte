# Oficina ApliArte — Repositorio Soberano

Repositorio independiente y soberano de la **Oficina ApliArte**, desacoplada de `erbolamm-trabajo` conforme a los principios de arquitectura modular del ecosistema (ADR-0014 y ADR-0013).

---

## 🌐 Puerta de Entrada Viva (Producción en GitHub Pages)

Acceso directo a la suite desplegada en producción sin requerir servidor local activo:

- **Portada Oficial**: [https://erbolamm.github.io/oficina-apliarte/](https://erbolamm.github.io/oficina-apliarte/)
- **Escaparate de Aplicaciones**: [https://erbolamm.github.io/oficina-apliarte/vistas/aplicaciones.html](https://erbolamm.github.io/oficina-apliarte/vistas/aplicaciones.html)
- **Catálogo de Paquetes Flutter**: [https://erbolamm.github.io/oficina-apliarte/vistas/paquetes.html](https://erbolamm.github.io/oficina-apliarte/vistas/paquetes.html)
- **Tablero Comunitario de Tareas**: [https://erbolamm.github.io/oficina-apliarte/vistas/tareas.html](https://erbolamm.github.io/oficina-apliarte/vistas/tareas.html)
- **Tablero Comunitario de Propuestas**: [https://erbolamm.github.io/oficina-apliarte/vistas/propuestas.html](https://erbolamm.github.io/oficina-apliarte/vistas/propuestas.html)
- **Banco de Habilidades**: [https://erbolamm.github.io/oficina-apliarte/vistas/skills.html](https://erbolamm.github.io/oficina-apliarte/vistas/skills.html)
- **Gestión de Reseñas**: [https://erbolamm.github.io/oficina-apliarte/vistas/resenas.html](https://erbolamm.github.io/oficina-apliarte/vistas/resenas.html)
- **Instala tu Oficina**: [https://erbolamm.github.io/oficina-apliarte/vistas/instala-tu-oficina.html](https://erbolamm.github.io/oficina-apliarte/vistas/instala-tu-oficina.html)

---

## 🎯 Misión y Arquitectura

1. **Carcasa Modular de Conexión**: Punto centralizado y ligero para servir vistas, datos de estado y catálogo de habilidades a todos los nodos (macOS, Windows, Linux, Servidor Privado Virtual y ApliChat).
2. **Modo Exclusivo de Solo Lectura Inicial**: Durante la fase de construcción, el servidor opera en modo de solo lectura para consulta y descarga de datos (habilidades, metadatos, catálogo), garantizando cero escrituras imprevistas o mutaciones no verificadas.
3. **Migración Progresiva Pestaña por Pestaña**: Las herramientas homologadas de la Oficina se integran de forma atómica y verificada, manteniendo la paridad total con el entorno local.
4. **Dominio Público y Acceso Seguro**: El dominio oficial `oficina.apliarte.com` con protección Cloudflare Zero Trust (autenticación obligatoria mediante Google) se activará tras la homologación completa de la suite.

---

## 📦 Estructura del Proyecto

```text
oficina-apliarte/
├── .github/               # Plantillas oficiales de incidencias para tareas y propuestas
├── datos/                 # Catálogos declarativos estructurados (aplicaciones, paquetes, tareas, propuestas, pestañas)
├── habilidades/           # Catálogo de habilidades soberanas servidas a los clientes
├── servidor/              # Servidor HTTP modular ligero en Python con soporte local y pruebas
├── tests/                 # Suite de pruebas unitarias automatizadas (40 pruebas superadas)
├── vistas/                # Vistas web responsivas y cliente universal JavaScript (escaparate.js)
├── index.html             # Portada principal y cliente universal tri-modo
├── README.md              # Documentación y puerta de entrada viva
└── AGENTS.md              # Protocolo canónico del orquestador local
```

---

## 🚀 Hoja de Ruta de Desarrollo

- [x] **Fase 0**: Inicialización del repositorio soberano, desacoplamiento, pruebas unitarias y blindaje ADR-0013.
- [x] **Fase 1**: Escaparate público con catálogos declarativos en JSON (`datos/aplicaciones.json`, `datos/paquetes.json`), vistas web dedicadas y navegación relativa de seis pestañas sin sondeo a red local.
- [x] **Fase 2**: Oficina Comunitaria con modelo unificado de siete campos (`datos/tareas.json`, `datos/propuestas.json`), vistas con formulario integrado y tope de 800 caracteres con contador en vivo, bifurcación limpia (puerto 8791 local vs visitante público con guardado en navegador y redirección a GitHub Issues), plantillas en `.github/ISSUE_TEMPLATE/` y 40 pruebas unitarias superadas.
- [ ] **Fase 3**: Migración progresiva de las siguientes herramientas del ecosistema a modo conectado y escaparate interactivo.
- [ ] **Fase 4**: Despliegue en el Servidor Privado Virtual (Hostinger) y activación de Cloudflare Zero Trust en `oficina.apliarte.com`.
