# Oficina ApliArte — Repositorio Soberano

Repositorio independiente y soberano de la **Oficina ApliArte**, desacoplada de `erbolamm-trabajo` conforme a los principios de arquitectura modular del ecosistema (ADR-0014 y ADR-0013).

---

## 🎯 Misión y Arquitectura

1. **Carcasa Modular de Conexión**: Punto centralizado y ligero para servir vistas, datos de estado y catálogo de habilidades a todos los nodos (macOS, Windows, Linux, Servidor Privado Virtual y ApliChat).
2. **Modo Exclusivo de Solo Lectura Inicial**: Durante la fase de construcción, el servidor opera en modo de solo lectura para consulta y descarga de datos (habilidades, metadatos, catálogo), garantizando cero escrituras imprevistas o mutaciones no verificadas.
3. **Migración Progresiva Pestaña por Pestaña**: Las nueve pestañas homologadas de la Oficina se migran e integran de forma atómica y verificada, manteniendo la Oficina previa en el puerto 8791 hasta la paridad total.
4. **Dominio Público y Acceso Seguro**: El dominio oficial `oficina.apliarte.com` con protección Cloudflare Zero Trust (autenticación obligatoria mediante Google) se activará únicamente tras la homologación completa de la suite.

---

## 📦 Estructura del Proyecto

```text
oficina-apliarte/
├── api/                   # Controladores REST ligeros (habilidades, estado, catálogo)
├── servidor/              # Servidor HTTP modular multiplataforma
├── habilidades/           # Catálogo de habilidades soberanas servidas a los clientes
├── vistas/                # Plantillas y vistas web limpias
├── README.md              # Documentación de arquitectura
└── AGENTS.md              # Protocolo canónico del orquestador local
```

---

## 🚀 Hoja de Ruta de Migración

- [x] **Fase 0**: Inicialización del repositorio soberano, blindaje ADR-0013 y carcasa base.
- [ ] **Fase 1**: API de catálogo y descarga de habilidades (ejemplo: patito de goma).
- [ ] **Fase 2**: Integración de estado y señal de disponibilidad para ApliChat.
- [ ] **Fase 3**: Migración progresiva de las nueve pestañas homologadas.
- [ ] **Fase 4**: Despliegue en el Servidor Privado Virtual y activación de Cloudflare Zero Trust.
