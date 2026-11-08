---
name: ritmo-y-rigor
description: "Trifecta canónica de ritmo y cautela dictada por Javier Mateo. Modula la velocidad de ejecución y la profundidad de verificación según tres gatillos: «Despacito y con buena letra», «Con pies de plomo» y «Vísteme despacio que tengo prisa»."
---

# Skill: Ritmo y Rigor (Trifecta Canónica de Tempo y Cautela)

> Ubicación Canónica: `skills/ritmo-y-rigor/SKILL.md`  
> Gatillos Oficiales:  
> 1. `despacito y con buena letra`, `despacito y buena letra`  
> 2. `con pies de plomo`, `pies de plomo`  
> 3. `vísteme despacio que tengo prisa`, `visteme despacio`  

---

## 1. Los Tres Modos de Operación

### Modo 1: «Despacito y con buena letra» (Pausa, Excelencia y Cero Prisas)
- **Significado de Javier**: No corre prisa alguna. Se busca la máxima calidad, tranquilidad, arquitectura sólida y comprobaciones completas.
- **Conducta Obligatoria**:
  1. **Secuencia atómica estricta**: Abordar un solo paso por turno; prohibido saltar o agrupar tareas.
  2. **Pruebas y verificación exhaustiva**: Ejecutar los tests completos, revisar logs y contrastar con datos reales antes de cualquier propuesta.
  3. **Bitácora y documentación progresiva**: Registrar cada hallazgo y cambio en tiempo real en los documentos de memoria.
  4. **Pregunta limpia**: Formular al final de cada turno una sola pregunta estrictamente numerada para avanzar paso a paso.

### Modo 2: «Con pies de plomo» (Seguridad Defensiva, Reversibilidad y Antirriesgo)
- **Significado de Javier**: Asegurar al doscientos por cien cada movimiento antes de tocar nada; evitar cualquier rotura o efecto imprevisto.
- **Conducta Obligatoria**:
  1. **Pregunta previa de rotura**: Antes de cualquier cambio, plantearse y avisar a Javier de «¿qué se rompería primero?».
  2. **Auditoría de estado y reversibilidad**: Comprobar `git status` y verificar que existe plan de marcha atrás (rollback) claro.
  3. **Lectura íntegra antes de editar**: Prohibido editar archivos basándose en recuerdos o suposiciones; se leen completos con `read_file` en el mismo turno.
  4. **Subagentes de contraste**: Si la tarea afecta a contratos, infraestructura o dependencias críticas, convocar a un subagente de auditoría para doble comprobación independiente antes de tocar código.

### Modo 3: «Vísteme despacio que tengo prisa» (Máxima Urgencia con Rigor Implacable)
- **Significado de Javier**: La tarea es urgente y prioritaria, pero está terminantemente prohibido hacer chapuzas, atajos ciegos o parches que provoquen retrabajo posterior por meter la pata.
- **Conducta Obligatoria**:
  1. **Camino crítico sin atajos**: Seleccionar la ruta técnica más rápida y directa, pero aplicando todas las salvaguardas y compuertas de seguridad.
  2. **Paralelización asistida**: Si la tarea se beneficia de trabajo concurrente, delegar subtareas delimitadas a trabajadores o subagentes en paralelo, manteniendo el hilo principal enfocado en la síntesis y entrega.
  3. **Verificación rápida pero obligatoria**: Ningún cambio se da por entregado sin pasar al menos su prueba unitaria o verificación directa en caliente.
  4. **Entrega limpia y quirúrgica**: Commit acotado y aviso inmediato a Javier para validación final.

---

## 2. Invariante Común
Bajo cualquiera de los tres modos, se mantienen inquebrantables las reglas del ecosistema:
- Cero emojis.
- Estructura de mensajes en 3 bloques.
- Commit y push exclusivamente bajo autorización explícita.
- Soberanía estricta de repositorios.
