---
name: paso-a-paso
description: Protocolo canonico de ejecucion atomica, hoja de ruta secuencial y verificacion paso a paso con confirmacion y commit por hito. Se activa con «paso por paso», «paso a paso», «vamos paso a paso» o «vamos paso por paso».
---

# Skill: Paso a Paso (Ejecucion Atomica y Verificacion Guiada)

> Ubicacion Canonica: `skills/paso-a-paso/SKILL.md` (y `.agents/skills/paso-a-paso/SKILL.md`)  
> Gatillos: `paso por paso`, `paso a paso`, `vamos paso a paso`, `vamos paso por paso`  
> Proposito: Detener respuestas paralelas o menus multiples, trazar una hoja de ruta numerada e ir ejecutando, instruyendo, verificando y commiteando un unico paso por vez, leyendo en disco fresco antes de cada paso para evitar cualquier pisado de codigo.

## 1. Principios del Protocolo Paso a Paso

1. Un solo frente a la vez: Prohibido mezclar dos tareas o pedir opciones de cosas distintas en el mismo turno. Si hay dos temas pendientes, se ordenan en la hoja de ruta y se aborda exclusivamente el primero.
2. Hoja de ruta visible: Se presenta una lista estrictamente numerada (1., 2., 3...) de los pasos atomicos planificados para que Javier sepa en que punto estamos y que vendra despues.
3. Instruccion clara y guiada para Javier: Si el paso requiere una comprobacion manual (por ejemplo en la tablet o en el movil), el agente explica exactamente que hacer (ej: "recarga la pagina en el navegador", "toca el boton X").
4. Verificacion antes de guardar: No se da por bueno ningun paso sin prueba real (test unitario y/o comprobacion manual de Javier).
5. Commit por hito: Una vez verificado el paso, se guarda en Git de forma quirurgica (solo los archivos afectados por ese paso) para que nada pueda perderse ni pisarse.
6. Recomienzo limpio en el siguiente paso: Al pasar al siguiente paso o tarea, se realiza una lectura fresca en disco (view_file) y comprobacion de git status, asegurando que no se trabaja sobre recuerdos de contexto ni archivos desactualizados.

## 2. Flujo de Ejecucion en 5 Pasos

1. Congelacion y Hoja de Ruta:
   - Identificar las tareas o problemas en juego.
   - Crear una hoja de ruta con pasos atomicos numerados.
   - Declarar explicitamente cual es el Paso 1 activo.

2. Instruccion y Accion del Paso Actual:
   - Explicar la accion tecnica exacta y ejecutar el cambio minimo necesario.
   - Proporcionar a Javier la instruccion exacta de comprobacion.

3. Espera y Confirmacion:
   - Formular una sola pregunta numerada para confirmar el resultado del paso actual.
   - Detenerse y esperar la respuesta de Javier.

4. Consolidacion y Commit:
   - Al confirmar el exito del paso, hacer commit quirurgico del archivo o archivos afectados.
   - Registrar la observacion en Engram si corresponde.

5. Transicion al Siguiente Paso:
   - Marcar el paso como completado en la hoja de ruta.
   - Leer en disco el archivo del siguiente paso como si fuera una sesion nueva.
   - Iniciar el siguiente paso.

## 3. Reglas de Oro

1. Cero Emojis en Respuestas a Javier: Respetar la directiva de accesibilidad TTS en todo momento.
2. Una sola pregunta a la vez: Nunca formular preguntas paralelas ni saltar de tema.
3. Listas estrictamente numeradas: Toda opcion u hoja de ruta en formato 1., 2., 3.
