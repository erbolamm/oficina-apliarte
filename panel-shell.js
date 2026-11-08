/* Shell común de la oficina local de ErBolamm.
 *
 * Cargado por cada vista. No debe contener lógica exclusiva de una vista:
 * los handlers se enganchan solo si los elementos del DOM existen en la
 * página actual. El antiguo canal de chat del orquestador fue retirado:
 * este módulo ya no envía ni pinta nada de ese canal.
 *
 * API expuesta en `window.Oficina` para inspecciones y pruebas.
 */
(() => {
  const CLAVE_BACKEND_STORAGE = "oficina_backend_url";
  function obtenerBackendUrl() {
    try {
      return localStorage.getItem(CLAVE_BACKEND_STORAGE) || "";
    } catch (_) {
      return "";
    }
  }
  function fijarBackendUrl(url) {
    try {
      if (url) {
        localStorage.setItem(CLAVE_BACKEND_STORAGE, url.replace(/\/+$/, ""));
      } else {
        localStorage.removeItem(CLAVE_BACKEND_STORAGE);
      }
    } catch (_) {}
  }
  function resolverApi(path) {
    const backend = obtenerBackendUrl();
    if (backend) {
      return `${backend}${path.startsWith('/') ? path : '/' + path}`;
    }
    return path;
  }
  function mostrarSelectorHibrido() {
    const actual = obtenerBackendUrl();
    const mensaje = "Conexión Híbrida Inteligente de Oficina ApliArte\n\n" +
      (actual ? `Actualmente conectado a: ${actual}\n\n` : "Actualmente en: Modo Web Autónomo (datos locales sincronizados)\n\n") +
      "1. Para conectar a Servidor Local escribe: local (o http://127.0.0.1:8791)\n" +
      "2. Para conectar a tu VPS en Hostinger introduce la IP (ej: http://tu-ip:8791)\n" +
      "3. Para volver al Modo Web Autónomo escribe: desconectar";
    const entrada = prompt(mensaje, actual || "http://127.0.0.1:8791");
    if (entrada === null) return;
    const limpia = entrada.trim().toLowerCase();
    if (!limpia || limpia === "desconectar" || limpia === "3") {
      fijarBackendUrl("");
      alert("Conexión restablecida a Modo Web Autónomo.");
      window.location.reload();
      return;
    }
    let urlFinal = entrada.trim();
    if (limpia === "local" || limpia === "1") {
      urlFinal = "http://127.0.0.1:8791";
    }
    fijarBackendUrl(urlFinal);
    alert("Servidor configurado en: " + urlFinal + "\nSe recargará la Oficina para sincronizar en vivo.");
    window.location.reload();
  }

  const fallbackAgents = [
    {
      role: "co",
      name: "Codex",
      face: "CO",
      skill: "Arquitectura y Contratos",
      desc: "Estructurado y riguroso. Diseña contratos JSON, APIs y modelos antes del código.",
      defaultMethod: "sdd-design",
    },
    {
      role: "cl",
      name: "Claude",
      face: "CL",
      skill: "Redacción y Contenido",
      desc: "Empático y analítico. Redacta copy-packs, landings y documentación clara.",
      defaultMethod: "contenido-multiformato",
    },
    {
      role: "pi",
      name: "Gentleman",
      face: "PI",
      skill: "Auditoría y Feedback",
      desc: "Meticuloso y educado. Verifica calidad, criterios de aceptación y pruebas reales.",
      defaultMethod: "feedback-a-plan",
    },
    {
      role: "ja",
      name: "Javier",
      face: "JA",
      skill: "Dirección y Revisión",
      desc: "Pragmático y visionario. Criterio de negocio, decisiones y aprobación final.",
      defaultMethod: "none",
    },
    {
      role: "ge",
      name: "agy",
      face: "GE",
      skill: "Diagnóstico y Sombreros",
      desc: "Polifacético y versátil. Aplica Seis Sombreros para separar hechos, riesgos y opciones.",
      defaultMethod: "six-hats",
    },
    {
      role: "gr",
      name: "Grok",
      face: "GR",
      skill: "Benchmarking y Análisis",
      desc: "Curioso y directo. Compara mercado, competencia, precios y alternativas externas.",
      defaultMethod: "benchmark-competitivo",
    },
    {
      role: "op",
      name: "opencode",
      face: "OP",
      skill: "Auditoría Web y Rendimiento",
      desc: "Práctico y directo al código. Revisa enlaces, rendimiento web y automatiza scripts.",
      defaultMethod: "auditoria-web",
    },
    {
      role: "om",
      name: "omp",
      face: "OM",
      skill: "Automatización local",
      desc: "Ejecuta tareas locales y herramientas OpenCode/omp con trazabilidad.",
      defaultMethod: "auditoria-web",
    },
    {
      role: "ex",
      name: "Agente externo",
      face: "EX",
      skill: "Identidad y Campañas",
      desc: "Creativo y visual. Diseña piezas, storyboards y campañas de comunicación.",
      defaultMethod: "campana-visual",
    },
  ];
  const fallbackProfiles = [
    { id: "co:openai", role: "co", label: "Codex · OpenAI" },
    { id: "cl:anthropic", role: "cl", label: "Claude · Anthropic" },
    { id: "pi:minimax", role: "pi", label: "Pi · MiniMax" },
    { id: "ge:google", role: "ge", label: "agy · Google" },
    { id: "gr:grok", role: "gr", label: "Grok" },
    { id: "op:go", role: "op", label: "OpenCode · Go", zeroCostOnly: true },
    { id: "op:zen", role: "op", label: "OpenCode · Zen", zeroCostOnly: true },
    { id: "om:omp", role: "om", label: "omp · local", zeroCostOnly: true },
    { id: "ex:external", role: "ex", label: "Agente externo" },
  ];
  const roleNames = Object.fromEntries(
    fallbackAgents.map((agent) => [agent.role, agent.name]),
  );
  const roleColors = {
    co: "#10a37f",
    cl: "#d97757",
    pi: "#ff4e83",
    ja: "#005fa9",
    ge: "#4285f4",
    gr: "#4b5563",
    op: "#9aa4b2",
    ex: "#a6a6a6",
  };
  const stateDirectories = ["por-hacer", "haciendo", "hecho"];
  const stateLabels = {
    "por-hacer": "Por hacer",
    haciendo: "Haciendo",
    hecho: "Hecho",
  };

  const $ = (sel) => document.querySelector(sel);
  const root = document.documentElement;

  // Detección de Modo Limpio / Aislado (?modo=limpio o ?aislado=1)
  const urlParams = new URLSearchParams(window.location.search);
  const esModoLimpio =
    urlParams.get("modo") === "limpio" ||
    urlParams.get("aislado") === "1" ||
    urlParams.has("limpio");
  if (esModoLimpio) {
    root.dataset.modo = "limpio";
  }

  function queuedFor(role, valid, states) {
    if (!valid || !states) return 0;
    return (states["por-hacer"] || []).filter((task) => task.role === role)
      .length;
  }

  // Texto único para la lista de agentes y el tooltip del plano. El contrato
  // del servidor solo distingue `dormido` y `haciendo`; la cola se deduce de
  // `por-hacer` y nunca mueve a nadie de la espera.
  function agentStatus(active, coordinating, queued, valid) {
    if (!valid) return "Sin datos";
    if (coordinating)
      return active ? "Coordinando y trabajando" : "Coordinando";
    if (active) return "Trabajando";
    if (queued > 0)
      return queued === 1 ? "1 tarea en cola" : `${queued} tareas en cola`;
    return "Descansando";
  }

  function renderAgents(agentStates, valid, orchestrator) {
    const agentList = $("#agent-list");
    const template = $("#agent-template");
    if (!agentList || !template) return;
    const fragment = document.createDocumentFragment();
    for (const agent of fallbackAgents) {
      const active =
        valid && agentStates && agentStates[agent.role] === "haciendo";
      const row = template.content.cloneNode(true);
      const item = row.querySelector(".agent-row");
      item.classList.add(`role-${agent.role}`);
      item.classList.toggle("is-orchestrator", agent.role === orchestrator);
      row.querySelector(".avatar").textContent = agent.face;
      row.querySelector("strong").textContent = `[${agent.role}] ${agent.name}`;
      row.querySelector(".agent-copy span").textContent = agentStatus(
        active,
        agent.role === orchestrator,
        queuedFor(agent.role, valid, currentStates),
        valid,
      );
      const zone = row.querySelector(".agent-zone");
      if (zone) {
        zone.textContent = `🎯 Skill: ${agent.skill} · ${agent.desc}`;
        zone.title = `${agent.name}: ${agent.desc}`;
      }
      // Al hacer clic en la tarjeta del personaje, abre su ficha de encargo centrada y la enfoca
      item.style.cursor = "pointer";
      item.title = `Pulsar para encargar tarea a ${agent.name} (${agent.skill})`;
      item.addEventListener("click", () => {
        const width = 640;
        const height = 820;
        const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
        const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
        const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
        const win = window.open(
          `/vista/agente.html?agent=${agent.role}`,
          `oficina-agente-${agent.role}`,
          features,
        );
        if (win) win.focus();
      });
      fragment.append(row);
    }
    agentList.replaceChildren(fragment);
  }

  function relativeAge(date) {
    const hours = Math.max(0, (Date.now() - date.valueOf()) / 3600000);
    if (hours < 1) return "anotado hace menos de 1 h";
    return `anotado hace ${Math.floor(hours)} h`;
  }

  function renderLimits(rawAvailability, rawProfiles = fallbackProfiles) {
    const limitsList = $("#subscription-limits");
    if (!limitsList) return;
    const byProfile = new Map(
      (Array.isArray(rawAvailability) ? rawAvailability : []).map((item) => [
        item.profile,
        item,
      ]),
    );
    const profiles =
      Array.isArray(rawProfiles) && rawProfiles.length
        ? rawProfiles
        : fallbackProfiles;
    const fragment = document.createDocumentFragment();
    for (const profile of profiles) {
      const item = document.createElement("li");
      item.className = `limit-row role-${profile.role}`;
      const availability = byProfile.get(profile.id);
      const heading = document.createElement("div");
      heading.className = "limit-heading";
      const strong = document.createElement("strong");
      strong.textContent = profile.label;
      const amount = document.createElement("span");
      heading.append(strong, amount);
      const meta = document.createElement("p");
      meta.className = "limit-meta";
      if (availability) {
        const observedAt = new Date(availability.observedAt);
        const stale =
          !Number.isNaN(observedAt.valueOf()) &&
          Date.now() - observedAt.valueOf() > 12 * 3600000;
        const hasPercentage = Number.isFinite(
          Number(availability.usedPercentage),
        );
        const value = hasPercentage
          ? Math.max(0, Math.min(100, Number(availability.usedPercentage)))
          : null;
        amount.textContent = `${availability.status}${value == null ? "" : ` · ${value.toLocaleString("es-ES")}% usado`}${value != null && value >= 80 ? " · cerca del límite" : ""}`;
        meta.textContent = `${availability.source} · ${relativeAge(observedAt)}${stale ? " · desactualizado" : ""}`;
        if (availability.renewsAt)
          meta.textContent += ` · próxima comprobación ${new Date(availability.renewsAt).toLocaleString("es-ES")}`;
        else if (availability.status === "agotado")
          meta.textContent += " · próxima comprobación no indicada";
        if (availability.status === "revisar")
          meta.textContent += " · comprobar ahora";
        if (availability.zeroCostOnly) meta.textContent += " · solo coste cero";
        if (availability.note)
          meta.textContent += ` · ${String(availability.note)}`;
        item.classList.toggle("near", value != null && value >= 80);
        item.classList.toggle("stale", stale);
        item.append(heading, meta);
        if (value != null) {
          const track = document.createElement("div");
          track.className = "limit-track";
          track.setAttribute("role", "progressbar");
          track.setAttribute("aria-label", `${profile.label}: uso consumido`);
          track.setAttribute("aria-valuemin", "0");
          track.setAttribute("aria-valuemax", "100");
          track.setAttribute("aria-valuenow", String(value));
          const fill = document.createElement("span");
          fill.className = "limit-fill";
          fill.style.width = `${value}%`;
          track.append(fill);
          item.append(track);
        }
      } else {
        amount.textContent = "Sin dato";
        meta.textContent = profile.zeroCostOnly
          ? "Sin observar · política de coste cero"
          : "Sin observar";
        item.append(heading, meta);
      }
      fragment.append(item);
    }
    limitsList.replaceChildren(fragment);
  }

  function costValue(value) {
    return typeof value === "string" && value.trim() ? value : "Sin dato";
  }

  function formatMonthlyCost(raw) {
    if (
      !raw ||
      typeof raw !== "object" ||
      typeof raw.amount !== "number" ||
      !Number.isFinite(raw.amount) ||
      typeof raw.currency !== "string"
    ) {
      return "Sin dato";
    }
    try {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: raw.currency,
      }).format(raw.amount);
    } catch (_) {
      return `${raw.amount.toLocaleString("es-ES")} ${raw.currency}`;
    }
  }

  function costFact(label, value) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    wrapper.append(term, description);
    return wrapper;
  }

  function renderCosts(rawCosts) {
    const list = $("#cost-subscriptions");
    const alert = $("#charge-alert");
    const status = $("#costs-status");
    if (!list || !alert || !status) return;

    const valid = rawCosts && rawCosts.valid === true;
    const entries = valid && Array.isArray(rawCosts.entries) ? rawCosts.entries : [];
    if (!valid) {
      const reason = rawCosts && rawCosts.reason;
      status.textContent =
        reason === "missing"
          ? "Sin datos registrados todavía. El fichero local de costes no existe."
          : "El fichero local de costes no es válido y no se muestra parcialmente.";
    } else if (entries.length === 0) {
      status.textContent = "Sin datos registrados todavía.";
    } else {
      status.textContent = `${entries.length} registro${entries.length === 1 ? "" : "s"} local${entries.length === 1 ? "" : "es"}.`;
    }

    const warnings = entries.filter(
      (entry) => entry && entry.mayAutoCharge === true && entry.chargeWarning,
    );
    if (warnings.length) {
      const heading = document.createElement("strong");
      heading.textContent = `⚠ ${warnings.length} elemento${warnings.length === 1 ? " puede" : "s pueden"} generar cargo automáticamente`;
      const warningList = document.createElement("ul");
      for (const entry of warnings) {
        const item = document.createElement("li");
        item.textContent = `${costValue(entry.service)}: ${entry.chargeWarning}`;
        warningList.append(item);
      }
      alert.replaceChildren(heading, warningList);
      alert.hidden = false;
    } else {
      alert.replaceChildren();
      alert.hidden = true;
    }

    const fragment = document.createDocumentFragment();
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      const item = document.createElement("li");
      item.className = "cost-row";

      const heading = document.createElement("div");
      heading.className = "cost-heading";
      const service = document.createElement("strong");
      service.textContent = costValue(entry.service);
      const state = document.createElement("span");
      const stateValue = ["activo", "cancelado", "desconocido"].includes(entry.status)
        ? entry.status
        : "desconocido";
      state.className = `cost-state state-${stateValue}`;
      state.textContent = stateValue;
      heading.append(service, state);

      const facts = document.createElement("dl");
      facts.className = "cost-facts";
      facts.append(
        costFact("Cuenta o proyecto", costValue(entry.account)),
        costFact("Plan", costValue(entry.plan)),
        costFact("Coste mensual", formatMonthlyCost(entry.monthlyCost)),
        costFact("Último cargo", costValue(entry.lastChargeAt)),
        costFact("Fuente", costValue(entry.source)),
        costFact("Fecha de lectura", costValue(entry.readAt)),
      );

      const sourceKind = document.createElement("span");
      const verified = entry.sourceKind === "verificado";
      sourceKind.className = `source-kind ${verified ? "verified" : "manual"}`;
      sourceKind.textContent = verified ? "verificado" : "manual";
      item.append(heading, facts, sourceKind);
      fragment.append(item);
    }
    list.replaceChildren(fragment);
  }

  let activeDraggedTask = null;
  let isMovingTask = false;

  async function moveTaskState(fileName, role, priority, targetState) {
    if (isMovingTask) return;
    if (!office || !office.actionToken) {
      const announcer = $("#announcer");
      if (announcer) {
        announcer.textContent = "Sin conexión o token de acción para mover la tarea.";
      }
      return;
    }
    isMovingTask = true;
    try {
      const editResp = await fetch(
        `/api/tasks/edit?file=${encodeURIComponent(fileName)}`,
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "X-ErBolamm-Action": String(office.actionToken),
          },
        },
      );
      const editData = await editResp.json();
      if (!editResp.ok || !editData.ok) {
        throw new Error(
          editData.message || editData.error || `HTTP ${editResp.status}`,
        );
      }
      const expectedBody = String(editData.document?.body || "");
      const currentTask = editData.document?.task || {};
      const targetRole = role || currentTask.role || "ex";
      const targetPriority = priority || currentTask.priority || "normal";
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const manageResp = await fetch("/api/tasks/manage", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-ErBolamm-Action": String(office.actionToken),
        },
        body: JSON.stringify({
          fileName,
          expectedBody,
          id,
          role: targetRole,
          priority: targetPriority,
          state: targetState,
          reason: `Movida a ${targetState} desde el tablero Kanban`,
          confirmed: true,
        }),
      });
      const manageData = await manageResp.json();
      if (!manageResp.ok || !manageData.ok) {
        throw new Error(
          manageData.message || manageData.error || `HTTP ${manageResp.status}`,
        );
      }
      const announcer = $("#announcer");
      if (announcer) {
        announcer.textContent = `Tarea movida a ${stateLabels[targetState] || targetState}.`;
      }
      previousPayloadSig = "";
      await refresh();
    } catch (err) {
      console.error("Error al mover tarea:", err);
      const announcer = $("#announcer");
      if (announcer) {
        announcer.textContent = `Error al mover tarea: ${err.message}`;
      }
      alert(`No se pudo mover la tarea: ${err.message}`);
    } finally {
      isMovingTask = false;
    }
  }

  const expandedTasks = new Set();

  function isManualJavierTask(task) {
    if (!task) return false;
    if (task.isManual === true) return true;
    const fileName = String(task.fileName || task.file || "").toLowerCase();
    if (fileName.startsWith("ja--manual--") || fileName.startsWith("ja--")) return true;
    const role = String(task.role || "").trim().toLowerCase();
    if (role === "ja") return true;
    const title = String(task.title || "").toLowerCase();
    if (title.includes("manual") && (title.includes("javier") || role === "ja")) return true;
    const resp = String(task.responsible || "").toLowerCase();
    if (resp.includes("javier") && (title.includes("manual") || fileName.includes("manual"))) return true;
    return false;
  }

  function createTaskCard(task, colKey, host) {
    if (!task) return null;
    const effectiveHost = host || window.__officeHost || currentHost || null;
    const template = $("#task-template");
    const row = template ? template.content.cloneNode(true) : null;
    let li;
    let strongEl;
    let smallEl;
    let openButton;

    if (row) {
      li = row.querySelector("li");
      strongEl = row.querySelector("strong");
      smallEl = row.querySelector("small");
      openButton = row.querySelector(".task-ficha-open");
    } else {
      li = document.createElement("li");
      li.className = "task";
      strongEl = document.createElement("strong");
      smallEl = document.createElement("small");
      openButton = document.createElement("button");
      openButton.type = "button";
      openButton.className = "task-ficha-open";
      openButton.setAttribute("aria-label", "Abrir ficha de esta tarea");
      const iconSpan = document.createElement("span");
      iconSpan.setAttribute("aria-hidden", "true");
      iconSpan.textContent = "📄";
      openButton.appendChild(iconSpan);
      li.append(strongEl, smallEl, openButton);
    }
    if (!li) return null;

    const role = String(task.role || "ex")
      .trim()
      .toLowerCase();
    const known = fallbackAgents.some((agent) => agent.role === role)
      ? role
      : "ex";
    li.classList.add(`by-${known}`);

    const fileName = String(task.fileName || task.file || "");
    if (fileName && expandedTasks.has(fileName)) {
      li.classList.add("is-expanded");
    }

    const state = colKey || task.state || "por-hacer";

    const isMacOnWin = Boolean(
      effectiveHost && effectiveHost.isWindows && task.requiresHost === "macos",
    );
    const isWinOnMac = Boolean(
      effectiveHost && effectiveHost.isMacOS && task.requiresHost === "windows",
    );
    const isDisabledHost = isMacOnWin || isWinOnMac;

    if (isMacOnWin) {
      li.classList.add("task-card--disabled-host");
      li.style.opacity = "0.42";
      li.style.cursor = "not-allowed";
      const badge = document.createElement("span");
      badge.className = "task-host-badge badge pill";
      badge.textContent = "🍎 Solo Mac mini";
      badge.title =
        "Esta tarea requiere macOS y no se puede ejecutar en este anfitrión Windows";
      li.appendChild(badge);
    } else if (isWinOnMac) {
      li.classList.add("task-card--disabled-host");
      li.style.opacity = "0.42";
      li.style.cursor = "not-allowed";
      const badge = document.createElement("span");
      badge.className = "task-host-badge badge pill";
      badge.textContent = "🪟 Solo Windows";
      badge.title =
        "Esta tarea requiere Windows y no se puede ejecutar en este anfitrión macOS";
      li.appendChild(badge);
    }

    let wasDragging = false;
    if (fileName) {
      if (isDisabledHost) {
        li.setAttribute("draggable", "false");
      } else {
        li.setAttribute("draggable", "true");
      }
      li.dataset.fileName = fileName;
      li.dataset.role = known;
      li.dataset.priority = String(task.priority || "normal");
      li.dataset.state = state;

      li.addEventListener("dragstart", (e) => {
        if (isDisabledHost) {
          e.preventDefault();
          return false;
        }
        wasDragging = true;
        activeDraggedTask = {
          fileName,
          role: known,
          priority: String(task.priority || "normal"),
          state,
        };
        li.classList.add("is-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(
            "application/json",
            JSON.stringify(activeDraggedTask),
          );
          e.dataTransfer.setData("text/plain", fileName);
        }
      });

      li.addEventListener("dragend", () => {
        li.classList.remove("is-dragging");
        activeDraggedTask = null;
        document
          .querySelectorAll(".lane.drag-over")
          .forEach((el) => el.classList.remove("drag-over"));
        window.setTimeout(() => {
          wasDragging = false;
        }, 120);
      });

      li.addEventListener("click", (e) => {
        if (isDisabledHost) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (wasDragging) return;
        if (e.target.closest(".task-ficha-open")) return;
        const isNowExpanded = li.classList.toggle("is-expanded");
        if (isNowExpanded) {
          expandedTasks.add(fileName);
        } else {
          expandedTasks.delete(fileName);
        }
      });
    }

    if (strongEl) {
      strongEl.textContent = String(
        task.title || task.task || "Tarea sin título",
      );
    }

    const smallText = `[${known}] ${task.project} · ${task.priority}`;
    if (isManualJavierTask(task)) {
      li.classList.add("is-manual-task");
      li.style.borderLeft = "4px solid #005fa9";
      if (smallEl) {
        smallEl.textContent = "";
        const badge = document.createElement("span");
        badge.style.background = "#005fa9";
        badge.style.color = "#ffffff";
        badge.style.padding = "1px 5px";
        badge.style.borderRadius = "3px";
        badge.style.fontWeight = "700";
        badge.style.fontSize = "0.7rem";
        badge.style.marginRight = "4px";
        badge.textContent = "👤 MANUAL";
        smallEl.append(badge, document.createTextNode(smallText));
      }
    } else if (smallEl) {
      smallEl.textContent = smallText;
    }

    if (openButton) {
      if (isDisabledHost) {
        openButton.disabled = true;
        openButton.style.cursor = "not-allowed";
        openButton.style.opacity = "0.5";
        openButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      } else if (fileName) {
        openButton.addEventListener("click", () =>
          openTaskFicha(fileName, { edit: true }),
        );
        attachIconHelp(openButton);
      } else {
        openButton.hidden = true;
      }
    }

    return li;
  }

  function renderBoard(states, host) {
    const lanes = $("#lanes");
    if (!lanes) return;
    const effectiveHost = host || currentHost || window.__officeHost || null;
    const roleFilter = new URLSearchParams(location.search)
      .get("rol")
      ?.trim()
      .toLowerCase();
    const activeFilter = roleFilter && Object.hasOwn(roleNames, roleFilter)
      ? roleFilter
      : null;
    const heading = $("#board-title");
    if (heading) {
      heading.textContent = activeFilter
        ? `Tus tareas · ${roleNames[activeFilter]}`
        : "Tablero";
    }
    const subtitle = $("#board-subtitle");
    if (subtitle) {
      subtitle.textContent = activeFilter
        ? "Solo tus tareas por hacer, haciendo y hechas."
        : "Por hacer, haciendo y hecho. Vista ampliada sin el plano.";
    }
    const clearLink = $("#lanes-clear-filter");
    if (clearLink) clearLink.hidden = !activeFilter;
    const fragment = document.createDocumentFragment();
    for (const state of stateDirectories) {
      const lane = document.createElement("section");
      lane.className = "lane";
      lane.dataset.state = state;
      const allTasks = Array.isArray(states[state]) ? states[state] : [];
      let tasks = activeFilter
        ? allTasks.filter(
            (task) => String(task.role || "").trim().toLowerCase() === activeFilter,
          )
        : allTasks;

      const heading = document.createElement("h3");
      let porHacerMode = "manual";
      let manualTasks = [];
      let techTasks = [];

      if (state === "por-hacer" && !activeFilter) {
        porHacerMode = localStorage.getItem("erbolamm-por-hacer-mode") || "manual";
        manualTasks = allTasks.filter(isManualJavierTask);
        techTasks = allTasks.filter((t) => !isManualJavierTask(t));
        if (porHacerMode === "manual") {
          tasks = manualTasks;
        }

        heading.className = "lane-heading-interactive";
        heading.style.display = "flex";
        heading.style.alignItems = "center";
        heading.style.justifyContent = "space-between";
        heading.style.gap = "0.5rem";
        heading.style.flexWrap = "wrap";

        const titleLabel = document.createElement("span");
        titleLabel.textContent = porHacerMode === "manual"
          ? `👤 Por hacer (Manual Javier) · ${manualTasks.length}`
          : `📋 Por hacer (Todo el sistema) · ${allTasks.length}`;
        heading.append(titleLabel);

        const filterToggle = document.createElement("button");
        filterToggle.type = "button";
        filterToggle.className = "lane-filter-toggle";
        filterToggle.style.fontSize = "0.75rem";
        filterToggle.style.padding = "2px 8px";
        filterToggle.style.borderRadius = "999px";
        filterToggle.style.border = "1px solid var(--line, #c9d3dc)";
        filterToggle.style.background = porHacerMode === "manual" ? "rgba(0, 95, 169, 0.08)" : "transparent";
        filterToggle.style.cursor = "pointer";
        filterToggle.style.color = "var(--ink, inherit)";
        filterToggle.textContent = porHacerMode === "manual"
          ? `Ver técnicas (${techTasks.length})`
          : `Solo mis manuales (${manualTasks.length})`;
        filterToggle.title = porHacerMode === "manual"
          ? "Mostrar también las tareas técnicas de los orquestadores"
          : "Filtrar para ver solo mis tareas manuales";
        filterToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          const nextMode = porHacerMode === "manual" ? "all" : "manual";
          localStorage.setItem("erbolamm-por-hacer-mode", nextMode);
          renderBoard(states, effectiveHost);
        });
        heading.append(filterToggle);
      } else {
        heading.textContent = `${stateLabels[state]} · ${tasks.length}`;
      }

      if (activeFilter && !tasks.length) continue;
      const list = document.createElement("ul");
      for (const task of tasks) {
        const card = createTaskCard(task, state, effectiveHost);
        if (card) {
          list.append(card);
        }
      }
      if (!tasks.length) {
        const empty = document.createElement("li");
        empty.className = "empty-notice";
        if (state === "por-hacer" && !activeFilter && porHacerMode === "manual") {
          empty.style.padding = "0.75rem";
          empty.style.textAlign = "center";
          empty.style.color = "var(--text-muted, #64748b)";
          empty.style.fontSize = "0.85rem";
          empty.style.border = "1px dashed var(--line, #cbd5e1)";
          empty.style.borderRadius = "6px";
          empty.style.listStyle = "none";
          empty.textContent = "✨ No tienes tareas manuales pendientes. Los orquestadores están gestionando el trabajo técnico.";
        } else {
          empty.textContent = "Sin tareas";
        }
        list.append(empty);
      }
      lane.append(heading, list);

      lane.addEventListener("dragover", (e) => {
        if (
          !activeDraggedTask &&
          !e.dataTransfer?.types?.includes("application/json")
        ) {
          return;
        }
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        lane.classList.add("drag-over");
      });
      lane.addEventListener("dragleave", (e) => {
        if (!lane.contains(e.relatedTarget)) {
          lane.classList.remove("drag-over");
        }
      });
      lane.addEventListener("drop", async (e) => {
        e.preventDefault();
        lane.classList.remove("drag-over");
        let taskInfo = activeDraggedTask;
        if (!taskInfo && e.dataTransfer) {
          try {
            const raw = e.dataTransfer.getData("application/json");
            if (raw) taskInfo = JSON.parse(raw);
          } catch (_) {}
        }
        if (!taskInfo || !taskInfo.fileName) return;
        const targetState = lane.dataset.state;
        if (!targetState || targetState === taskInfo.state) return;
        await moveTaskState(
          taskInfo.fileName,
          taskInfo.role,
          taskInfo.priority,
          targetState,
        );
      });

      fragment.append(lane);
    }
    lanes.replaceChildren(fragment);
  }

  // Ayuda emergente a los 3 segundos sobre los iconos de la tarjeta de tarea.
  // Mismo patrón que /vista/terminales y /vista/buscar.
  const ICON_HELP_WAIT_MS = 3000;
  let iconHelpTimer = null;
  let iconHelpBox = null;
  function getIconHelpBox() {
    if (!iconHelpBox) {
      iconHelpBox = document.createElement("div");
      iconHelpBox.className = "office-tip";
      iconHelpBox.setAttribute("role", "tooltip");
      iconHelpBox.hidden = true;
      document.body.append(iconHelpBox);
    }
    return iconHelpBox;
  }
  function hideIconHelp() {
    if (iconHelpTimer) {
      window.clearTimeout(iconHelpTimer);
      iconHelpTimer = null;
    }
    if (iconHelpBox) iconHelpBox.hidden = true;
  }
  function scheduleIconHelp(element) {
    hideIconHelp();
    iconHelpTimer = window.setTimeout(() => {
      const text = element.dataset.tip;
      if (!text) return;
      const box = getIconHelpBox();
      box.textContent = text;
      box.hidden = false;
      const zone = element.getBoundingClientRect();
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      const x = Math.max(8, Math.min(zone.left + zone.width / 2 - w / 2, window.innerWidth - w - 8));
      let y = zone.bottom + 8;
      if (y + h > window.innerHeight - 8) y = Math.max(8, zone.top - h - 8);
      box.style.left = `${Math.round(x)}px`;
      box.style.top = `${Math.round(y)}px`;
    }, ICON_HELP_WAIT_MS);
  }
  function attachIconHelp(element) {
    if (!element || !element.dataset.tip) return;
    element.addEventListener("mouseenter", () => scheduleIconHelp(element));
    element.addEventListener("mouseleave", hideIconHelp);
    element.addEventListener("focus", () => scheduleIconHelp(element));
    element.addEventListener("blur", hideIconHelp);
    element.addEventListener("mousedown", hideIconHelp);
  }
  // Única puerta a la ficha/editor de tareas. Sin `file` abre el selector;
  // con `nueva` abre directamente el alta de una tarea nueva.
  const taskFichaWindows = new Map();
  function openTaskFicha(fileName = "", options = {}) {
    const key = options.nueva ? "__nueva__" : fileName || "__picker__";
    const existing = taskFichaWindows.get(key);
    if (existing && !existing.closed) {
      existing.focus();
      return existing;
    }
    const params = new URLSearchParams();
    if (options.nueva) {
      params.set("nueva", "1");
    } else if (fileName) {
      params.set("file", fileName);
    }
    if (options.edit) {
      params.set("edit", "1");
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    const width = 640;
    const height = 860;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
    const win = window.open(
      `/vista/tarea-ficha.html${query}`,
      `oficina-tarea-ficha-${key}`,
      features,
    );
    if (win) {
      win.focus();
      taskFichaWindows.set(key, win);
    }
    return win;
  }

  function renderNeeds(valid, errors, orchestrator, states, limits) {
    const needs = $("#needs");
    const needsList = $("#needs-list");
    if (!needs || !needsList) return;
    const messages = [];
    if (!valid) messages.push(...errors);
    if (!orchestrator) messages.push("Sin orquestador — elige uno.");
    const pendingJavierTasks = ["haciendo", "por-hacer", "pendiente"].reduce(
      (tasks, state) =>
        tasks.concat(
          (Array.isArray(states[state]) ? states[state] : []).filter(
            (task) =>
              task.role === "ja" ||
              String(task.responsible || "").toLowerCase().includes("javier"),
          ),
        ),
      [],
    );
    const javierTasks = pendingJavierTasks.length;
    if (javierTasks) {
      const firstTask = pendingJavierTasks[0];
      const targetFile = String(firstTask?.fileName || firstTask?.file || "");
      messages.push({
        text: `Tienes ${javierTasks} tarea${javierTasks === 1 ? "" : "s"} por hacer.`,
        href: "/vista/tablero?rol=ja",
        linkText: "Ver mis tareas →",
        editor: true,
        targetFile,
      });
    }
    const stale = (limits || []).filter(
      (limit) =>
        Date.now() - new Date(limit.observedAt).valueOf() > 12 * 3600000,
    ).length;
    if (stale)
      messages.push(
        `${stale} observación${stale === 1 ? "" : "es"} desactualizada${stale === 1 ? "" : "s"}.`,
      );
    needsList.replaceChildren(
      ...messages.map((message) => {
        const item = document.createElement("li");
        if (typeof message === "string") {
          item.textContent = message;
          return item;
        }
        const text = document.createElement("span");
        text.textContent = message.text;
        item.append(text);
        if (message.href) {
          item.append(" ");
          const link = document.createElement("a");
          link.className = "needs-link";
          link.href = message.href;
          link.textContent = message.linkText || "Ver →";
          item.append(link);
        }
        if (message.editor) {
          if (message.targetFile) {
            item.append(" ");
            const edit = document.createElement("button");
            edit.type = "button";
            edit.className = "needs-link";
            edit.textContent = "Abrir tarea pendiente";
            edit.addEventListener("click", () => openTaskFicha(message.targetFile));
            item.append(edit);
          }
          item.append(" ");
          const create = document.createElement("button");
          create.type = "button";
          create.className = "needs-link";
          create.textContent = "Nueva tarea";
          create.addEventListener("click", () => openTaskFicha("", { nueva: true }));
          item.append(create);
        }
        return item;
      }),
    );
    const mapPanelVisible = $("#map-panel") && !$("#map-panel").hasAttribute("hidden");
    needs.hidden = (mapPanelVisible && Boolean($("#office-3d"))) || messages.length === 0;
  }

  let office = null;
  let currentHost = null;
  let lastSnapshot = null;
  let previousPayloadSig = "";
  let pendingDraft = null;
  let pendingPreview = null;
  let previousActive = null;
  let currentStates = {};
  let hasData = false;
  let polling = false;
  // Cuando el servidor no está —por ejemplo mientras se reinicia la Oficina— el panel
  // no insiste cada 1,5 s: eso llenaba la consola de errores de conexión sin ganar nada.
  // Se espacía el reintento y se avisa solo la primera vez.
  let esperaHasta = 0;
  let fallosSeguidos = 0;
  let routinesLoaded = false;
  let pendingRoutine = null;
  let currentReportIds = [];
  let lastReportSignature = "";
  let notifiedReportIds = null;

  // Aviso sonoro de informes del vigilante: suena una sola vez por informe
  // nuevo, nunca por refresco (el sondeo pasa cada 1.5s). El registro de
  // "ya avisado" vive en localStorage para no repetir el sonido si se
  // recarga la página con el mismo informe todavía pendiente.
  const NOTIFIED_REPORTS_KEY = "erbolamm-notified-reports";
  function loadNotifiedReportIds() {
    if (notifiedReportIds) return notifiedReportIds;
    try {
      const raw = window.localStorage.getItem(NOTIFIED_REPORTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      notifiedReportIds = new Set(Array.isArray(parsed) ? parsed : []);
    } catch (_) {
      notifiedReportIds = new Set();
    }
    return notifiedReportIds;
  }
  function saveNotifiedReportIds(ids) {
    try {
      // Máximo 200 ids recientes: evita crecer sin límite; es solo una
      // guarda de "no repitas el aviso de esto ya sonado", nada más.
      window.localStorage.setItem(
        NOTIFIED_REPORTS_KEY,
        JSON.stringify([...ids].slice(-200)),
      );
    } catch (_) {}
  }
  function playReportChime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      [660, 880].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        const start = now + index * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.24);
      });
      window.setTimeout(() => ctx.close().catch(() => {}), 600);
    } catch (_) {}
  }
  let reportsPrimed = false;
  function notifyNewReports(reportIds) {
    const notified = loadNotifiedReportIds();
    const freshIds = reportIds.filter((id) => id && !notified.has(id));
    // La primera vez que se leen informes en esta carga de página solo se
    // registran como "ya vistos", sin sonar: evita el pitido al abrir el
    // panel con informes que llevan ahí desde antes. A partir de la segunda
    // lectura, un id nuevo sí es una novedad real y suena una vez.
    const shouldChime = reportsPrimed;
    reportsPrimed = true;
    if (!freshIds.length) return;
    for (const id of freshIds) notified.add(id);
    saveNotifiedReportIds(notified);
    if (shouldChime) playReportChime();
  }

  function render(payload) {
    const valid = payload && payload.valid === true;
    const states =
      payload && payload.states && typeof payload.states === "object"
        ? payload.states
        : {};
    const errors = Array.isArray(payload && payload.errors)
      ? payload.errors.map(String)
      : [];
    office =
      payload && payload.office && typeof payload.office === "object"
        ? payload.office
        : null;
    currentHost =
      payload && payload.host && typeof payload.host === "object"
        ? payload.host
        : window.__officeHost || null;
    window.__officeHost = currentHost;
    const officeValid =
      office &&
      office.valid === true &&
      Object.hasOwn(roleNames, office.orchestrator);
    const orchestrator = officeValid ? office.orchestrator : null;
    const limits =
      officeValid && Array.isArray(office.availability)
        ? office.availability
        : [];
    const costs =
      payload && payload.costs && typeof payload.costs === "object"
        ? payload.costs
        : { valid: false, reason: "missing", entries: [] };
    const active =
      payload && payload.agents && typeof payload.agents === "object"
        ? payload.agents
        : {};
    currentStates = states;

    const payloadSig = JSON.stringify({
      valid,
      errors,
      orchestrator,
      officeChangedAt: office?.changedAt,
      limits,
      costs,
      active,
      states,
      host: currentHost,
    });
    hasData = true;
    lastSnapshot = payload;
    window.dispatchEvent(new CustomEvent("erbolamm:snapshot", { detail: payload }));
    if (payloadSig === previousPayloadSig) {
      return;
    }
    previousPayloadSig = payloadSig;

    renderAgents(active, valid, orchestrator);
    renderLimits(limits, officeValid ? office.executionProfiles : fallbackProfiles);
    renderCosts(costs);
    renderBoard(states, currentHost);
    renderNeeds(valid, errors, orchestrator, states, limits);

    const announcer = $("#announcer");
    if (valid && previousActive && announcer) {
      for (const agent of fallbackAgents) {
        if (
          previousActive[agent.role] === "haciendo" &&
          active[agent.role] !== "haciendo"
        ) {
          announcer.textContent = `${agent.name} ya no tiene una tarea en curso.`;
        }
      }
    }
    previousActive = { ...active };
  }

  function buildReplyEntry(entry) {
    const li = document.createElement("li");
    li.className = "report-reply-entry";
    const text = document.createElement("span");
    text.textContent = String(entry.text || "");
    const meta = document.createElement("small");
    const author = String(entry.responder || "");
    const timestamp = new Date(entry.timestamp);
    const when = Number.isNaN(timestamp.valueOf())
      ? "hora no disponible"
      : timestamp.toLocaleString("es-ES");
    meta.textContent = author ? `${author} · ${when}` : when;
    li.append(text, meta);
    return li;
  }

  async function submitReportReply(reportId, textarea, button, status, list) {
    const text = String(textarea.value || "").trim();
    if (!reportId) {
      status.textContent = "Informe sin identificador.";
      return;
    }
    if (!text) {
      status.textContent = "Escribe la respuesta antes de enviar.";
      textarea.focus();
      return;
    }
    if (!office || !office.actionToken) {
      status.textContent = "La oficina todavía no está conectada.";
      return;
    }
    button.disabled = true;
    status.textContent = "Enviando…";
    try {
      const response = await fetch("/api/reports/respond", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-ErBolamm-Action": String(office.actionToken),
        },
        body: JSON.stringify({
          reportId,
          text,
          responder: "javier",
        }),
      });
      let result;
      try {
        result = await response.json();
      } catch (_) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.ok || result.ok !== true) {
        throw new Error(
          result.message || result.error || `HTTP ${response.status}`,
        );
      }
      textarea.value = "";
      const replies = result && result.responses && result.responses[reportId];
      if (Array.isArray(replies)) {
        const fragment = document.createDocumentFragment();
        for (const entry of replies) fragment.append(buildReplyEntry(entry));
        list.replaceChildren(fragment);
      }
      const announcer = $("#announcer");
      status.textContent = "Respuesta guardada junto al informe.";
      if (announcer)
        announcer.textContent = "Respuesta añadida al informe del vigilante.";
    } catch (requestError) {
      status.textContent = `No se pudo guardar: ${requestError.message}`;
    } finally {
      button.disabled = false;
    }
  }

  async function markReportsSeen(ids, button) {
    const selected = ids.filter(Boolean);
    if (!selected.length) return;
    if (!office || !office.actionToken) {
      const reportStatus = $("#report-status");
      if (reportStatus)
        reportStatus.textContent = "La oficina todavía no está conectada.";
      return;
    }
    button.disabled = true;
    try {
      const response = await fetch("/api/reports/seen", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-ErBolamm-Action": String(office.actionToken),
        },
        body: JSON.stringify({ ids: selected }),
      });
      let result;
      try {
        result = await response.json();
      } catch (_) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.ok || result.ok !== true)
        throw new Error(
          result.message || result.error || `HTTP ${response.status}`,
        );
      renderReports(result);
      const announcer = $("#announcer");
      if (announcer)
        announcer.textContent =
          selected.length === 1
            ? "Informe marcado como visto."
            : "Informes marcados como vistos.";
    } catch (requestError) {
      const reportStatus = $("#report-status");
      if (reportStatus)
        reportStatus.textContent = `No se pudo guardar la lectura: ${requestError.message}`;
      button.disabled = false;
    }
  }

  function renderReports(payload) {
    // report-count solo existe en el contador del plano SVG (panel.html); las
    // vistas independientes como vista/informes.html no lo tienen. No exigir
    // los cuatro elementos a la vez: si falta uno, actualizar el resto igual.
    // El aviso sonoro, en cambio, no depende de tener la lista en pantalla:
    // se calcula siempre, para que suene estés en la vista que estés.
    const reports = Array.isArray(payload && payload.reports)
      ? payload.reports
      : [];
    currentReportIds = reports
      .map((report) => String(report.id || ""))
      .filter(Boolean);
    notifyNewReports(currentReportIds);
    const reportList = $("#report-list");
    if (!reportList) return;
    const reportStatus = $("#report-status");
    const reportCount = $("#report-count");
    const markAllReports = $("#mark-all-reports");
    const pendingCount = Number.isInteger(payload && payload.pendingCount)
      ? payload.pendingCount
      : reports.length;
    const responses =
      payload && payload.responses && typeof payload.responses === "object"
        ? payload.responses
        : {};
    if (reportCount) reportCount.textContent = String(pendingCount);
    if (reportStatus)
      reportStatus.textContent = `${pendingCount} informe${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"} de leer.`;
    if (markAllReports)
      markAllReports.disabled = currentReportIds.length === 0;
    // Guarda de firma: si nada cambió, NO se reconstruye el DOM. Reconstruir a cada
    // refresco destruía el campo de respuesta abierto y el texto a medio escribir.
    const signature = reports
      .map(
        (r) =>
          `${String(r.id)}|${String(r.status)}|${String(r.result || "").length}`,
      )
      .join("\n");
    if (signature === lastReportSignature) return;
    lastReportSignature = signature;
    if (!reports.length) {
      const empty = document.createElement("li");
      empty.textContent = "Vigilante sin informes pendientes.";
      reportList.replaceChildren(empty);
      return;
    }
    // Guardar el estado de los campos de respuesta abiertos antes de reconstruir,
    // para restaurarlo al terminar y no perder ni el campo ni lo que se escribía.
    const openReplies = new Map();
    reportList.querySelectorAll(".report-reply").forEach((section) => {
      if (section.hidden) return;
      const textarea = section.querySelector(
        "textarea[data-role='reply-text']",
      );
      openReplies.set(section.id, { text: textarea ? textarea.value : "" });
    });
    const fragment = document.createDocumentFragment();
    for (const report of reports.slice(-20)) {
      const reportId = String(report.id || "");
      const item = document.createElement("li");
      item.className = "report";
      item.dataset.status = String(report.status || "informativo");
      item.dataset.reportId = reportId;
      const heading = document.createElement("strong");
      const kindLabels = {
        propuesta: "Propuesta",
        resumen: "Resumen",
        resultado: "Resultado",
      };
      const rawKind = String(report.kind || "");
      const kind = kindLabels[rawKind] || rawKind;
      heading.textContent = `[${String(report.role || "?")}${kind ? ` · ${kind}` : ""}] ${String(report.title || report.task || "Tarea")}`;
      const result = document.createElement("span");
      result.textContent = String(report.result || "Sin resultado declarado.");
      const meta = document.createElement("small");
      const detected = new Date(report.detectedAt);
      meta.textContent = `${String(report.project || "")} · ${String(report.status || "informativo")} · ${Number.isNaN(detected.valueOf()) ? "hora no disponible" : detected.toLocaleString("es-ES")}`;
      const actions = document.createElement("div");
      actions.className = "report-actions";
      const seen = document.createElement("button");
      seen.type = "button";
      seen.textContent = "Visto";
      seen.addEventListener("click", () => markReportsSeen([reportId], seen));
      const reply = document.createElement("button");
      reply.type = "button";
      reply.textContent = "Responder";
      reply.setAttribute("aria-expanded", "false");
      reply.setAttribute("aria-controls", `reply-${reportId}`);
      const taskFile = String(report.fileName || "");
      if (taskFile) {
        const openTask = document.createElement("button");
        openTask.type = "button";
        openTask.textContent = "Abrir tarea";
        openTask.addEventListener("click", () => openTaskFicha(taskFile));
        actions.append(openTask);
      }
      const replySection = document.createElement("section");
      replySection.className = "report-reply";
      replySection.id = `reply-${reportId}`;
      replySection.hidden = true;
      const replyLabel = document.createElement("label");
      replyLabel.textContent =
        "Tu respuesta queda guardada junto a este informe";
      const replyText = document.createElement("textarea");
      replyText.rows = 3;
      replyText.maxLength = 2000;
      replyText.placeholder =
        "Escribe la respuesta. No la marca como visto ni oculta el informe.";
      replyText.dataset.role = "reply-text";
      const replyRow = document.createElement("div");
      replyRow.className = "report-reply-row";
      const send = document.createElement("button");
      send.type = "button";
      send.className = "primary";
      send.textContent = "Enviar respuesta";
      const replyStatus = document.createElement("span");
      replyStatus.className = "report-reply-status";
      replyStatus.setAttribute("role", "status");
      replyStatus.setAttribute("aria-live", "polite");
      replyRow.append(send, replyStatus);
      replyLabel.append(replyText);
      replySection.append(replyLabel, replyRow);
      const replyList = document.createElement("ul");
      replyList.className = "report-reply-list";
      replyList.dataset.role = "reply-list";
      const existing = Array.isArray(responses[reportId])
        ? responses[reportId]
        : [];
      if (existing.length) {
        for (const replyEntry of existing) {
          replyList.append(buildReplyEntry(replyEntry));
        }
      } else {
        const empty = document.createElement("li");
        empty.className = "report-reply-empty";
        empty.textContent = "Aún no has respondido a este informe.";
        replyList.append(empty);
      }
      reply.addEventListener("click", () => {
        const willShow = replySection.hidden;
        replySection.hidden = !willShow;
        reply.setAttribute("aria-expanded", String(willShow));
        if (willShow) replyText.focus();
      });
      send.addEventListener("click", () =>
        submitReportReply(reportId, replyText, send, replyStatus, replyList),
      );
      actions.append(seen, reply);
      item.append(heading, result, meta, actions, replySection, replyList);
      fragment.append(item);
    }
    reportList.replaceChildren(fragment);
    // Restaurar los campos de respuesta que estaban abiertos y su texto a medio escribir.
    if (openReplies.size) {
      openReplies.forEach((state, id) => {
        const section = document.getElementById(id);
        if (!section) return;
        section.hidden = false;
        const button = document.querySelector(
          `button[aria-controls="${CSS.escape(id)}"]`,
        );
        if (button) button.setAttribute("aria-expanded", "true");
        const textarea = section.querySelector(
          "textarea[data-role='reply-text']",
        );
        if (textarea && state.text) textarea.value = state.text;
      });
    }
  }

  function renderRoutines(routines) {
    const routineList = $("#routine-list");
    if (!routineList) return;
    const fragment = document.createDocumentFragment();
    for (const routine of routines) {
      const card = document.createElement("article");
      card.className = "routine-card";
      const title = document.createElement("h3");
      title.textContent = String(routine.title || "Rutina");
      const description = document.createElement("p");
      description.textContent = String(routine.description || "");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "primary";
      button.textContent = "Revisar y ejecutar";
      button.addEventListener("click", () => {
        pendingRoutine = {
          id: String(routine.id || ""),
          title: title.textContent,
          description: description.textContent,
        };
        const routineConfirmation = $("#routine-confirmation");
        const routineError = $("#routine-error");
        if (routineConfirmation)
          routineConfirmation.textContent = `${pendingRoutine.title}: ${pendingRoutine.description}`;
        if (routineError) routineError.textContent = "";
        const routineDialog = $("#routine-dialog");
        if (routineDialog) routineDialog.showModal();
      });
      card.append(title, description, button);
      fragment.append(card);
    }
    routineList.replaceChildren(fragment);
  }

  async function loadRoutines() {
    if (routinesLoaded) return;
    const result = await routineRequest("GET");
    renderRoutines(Array.isArray(result.routines) ? result.routines : []);
    routinesLoaded = true;
  }

  let recurrentesBusy = false;

  function renderRecurrentes(tasks) {
    const list = $("#recurrentes-list");
    if (!list) return;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "recurrentes-empty";
      emptyLi.textContent = "No hay tareas recurrentes configuradas en tareas/recurrentes/.";
      list.replaceChildren(emptyLi);
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const task of tasks) {
      const li = document.createElement("li");
      li.className = "recurrentes-card";
      li.dataset.id = String(task.id || "");

      const main = document.createElement("div");
      main.className = "recurrentes-main";

      const head = document.createElement("div");
      head.className = "recurrentes-card-head";

      const title = document.createElement("h3");
      title.className = "recurrentes-card-title";
      title.textContent = `🔄 ${String(task.title || task.id || "Tarea recurrente")}`;
      head.appendChild(title);

      if (task.role) {
        const roleChip = document.createElement("span");
        roleChip.className = "recurrentes-chip chip-role";
        roleChip.textContent = `Rol: ${task.role}`;
        head.appendChild(roleChip);
      }

      const statusChip = document.createElement("span");
      const isOk = Boolean(task.executedToday);
      const isDue = Boolean(task.isDue);
      statusChip.className = `recurrentes-chip ${isOk ? "chip-ok" : isDue ? "chip-due" : ""}`;
      statusChip.textContent = String(task.status || (isOk ? "Ejecutada hoy" : isDue ? "Pendiente" : "Programada"));
      head.appendChild(statusChip);

      main.appendChild(head);

      if (task.objective) {
        const desc = document.createElement("p");
        desc.className = "recurrentes-desc";
        desc.textContent = String(task.objective);
        main.appendChild(desc);
      }

      const meta = document.createElement("div");
      meta.className = "recurrentes-meta";

      if (task.daysDescription) {
        const daysSpan = document.createElement("span");
        daysSpan.className = "recurrentes-chip";
        daysSpan.textContent = `📅 ${task.daysDescription} · ${task.timeFormatted || "09:00"}`;
        meta.appendChild(daysSpan);
      }

      if (task.lastExecutionFormatted) {
        const lastExec = document.createElement("span");
        lastExec.className = "recurrentes-chip";
        lastExec.textContent = `⏱️ Última: ${task.lastExecutionFormatted}`;
        meta.appendChild(lastExec);
      }

      if (task.command) {
        const cmdCode = document.createElement("code");
        cmdCode.className = "recurrentes-cmd";
        cmdCode.textContent = String(task.command);
        meta.appendChild(cmdCode);
      }

      main.appendChild(meta);
      li.appendChild(main);

      const actions = document.createElement("div");
      actions.className = "recurrentes-actions";

      const runBtn = document.createElement("button");
      runBtn.type = "button";
      runBtn.className = "btn-recurrentes-run";
      runBtn.textContent = "▶ Ejecutar";
      runBtn.title = `Ejecutar ${task.title || task.id} ahora`;
      runBtn.addEventListener("click", () => ejecutarRecurrente(task.id, runBtn));
      actions.appendChild(runBtn);

      li.appendChild(actions);
      fragment.appendChild(li);
    }
    list.replaceChildren(fragment);
  }

  async function loadRecurrentes() {
    const list = $("#recurrentes-list");
    if (!list) return;
    try {
      const res = await fetch("/api/tasks/recurrentes").then((r) => r.json());
      if (res && res.ok && Array.isArray(res.tasks)) {
        renderRecurrentes(res.tasks);
      } else if (Array.isArray(res)) {
        renderRecurrentes(res);
      }
    } catch (_) {}
  }

  async function ejecutarRecurrente(id, buttonEl) {
    if (recurrentesBusy) return;
    recurrentesBusy = true;
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = "Ejecutando…";
    }
    const feedback = $("#recurrentes-feedback");
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = `Ejecutando tarea recurrente "${id}"…`;
    }
    try {
      const res = await fetch("/api/tasks/recurrentes/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ErBolamm-Action": String((office && office.actionToken) || ""),
        },
        body: JSON.stringify({ id, force: true }),
      });
      const data = await res.json();
      if (feedback) {
        if (data && data.ok) {
          feedback.textContent = `✅ "${id}" ejecutada correctamente.`;
        } else {
          feedback.textContent = `⚠️ Error al ejecutar "${id}": ${data.error || "Fallo"}`;
        }
      }
      await loadRecurrentes();
    } catch (e) {
      if (feedback) feedback.textContent = `❌ Error: ${e.message}`;
    } finally {
      recurrentesBusy = false;
      if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.textContent = "▶ Ejecutar";
      }
    }
  }

  async function taskRequest(path, payload) {
    if (!office || !office.actionToken)
      throw new Error("La oficina todavía no está conectada.");
    const response = await fetch(path, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-ErBolamm-Action": String(office.actionToken),
      },
      body: JSON.stringify(payload),
    });
    let result;
    try {
      result = await response.json();
    } catch (_) {
      throw new Error(`HTTP ${response.status}`);
    }
    if (!response.ok || result.ok !== true) {
      throw new Error(
        result.message || result.error || `HTTP ${response.status}`,
      );
    }
    return result;
  }

  async function routineRequest(method, payload) {
    if (!office || !office.actionToken)
      throw new Error("La oficina todavía no está conectada.");
    const response = await fetch("/api/routines", {
      method,
      cache: "no-store",
      headers: {
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        Accept: "application/json",
        "X-ErBolamm-Action": String(office.actionToken),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    let result;
    try {
      result = await response.json();
    } catch (_) {
      throw new Error(`HTTP ${response.status}`);
    }
    if (!response.ok || result.ok !== true)
      throw new Error(
        result.message || result.error || `HTTP ${response.status}`,
      );
    return result;
  }

  // Buzón de ideas y recordatorios. Reutiliza `/api/chat`: mismo almacén
  // append-only fuera de Git que el orquestador lee con
  // `dart run bin/trabajo.dart tareas chat leer`.
  let inboxBusy = false;
  let lastInboxSignature = "";

  async function inboxRequest(method, text, payload) {
    if (!office || !office.actionToken)
      throw new Error("La oficina todavía no está conectada.");
    const body =
      method === "POST"
        ? JSON.stringify({ text })
        : method === "PATCH" || method === "DELETE"
          ? JSON.stringify(payload || (typeof text === "object" ? text : { text }))
          : undefined;
    const response = await fetch("/api/chat", {
      method,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-ErBolamm-Action": String(office.actionToken),
      },
      body,
    });
    let result;
    try {
      result = await response.json();
    } catch (_) {
      throw new Error(`HTTP ${response.status}`);
    }
    if (!response.ok || result.ok !== true)
      throw new Error(
        result.message || result.error || `HTTP ${response.status}`,
      );
    return result;
  }

  function renderInbox(payload) {
    const inboxList = $("#inbox-list");
    if (!inboxList) return;
    const messages = Array.isArray(payload && payload.messages)
      ? payload.messages
      : [];
    const signature = JSON.stringify(messages);
    if (signature === lastInboxSignature) return;
    lastInboxSignature = signature;
    const inboxStatus = $("#inbox-status");
    const pending = Number(payload && payload.pendingForOrchestrator) || 0;
    const tabBadgeBuzon = $("#tab-badge-buzon");
    if (tabBadgeBuzon) {
      if (pending > 0) {
        tabBadgeBuzon.textContent = String(pending);
        tabBadgeBuzon.hidden = false;
      } else {
        tabBadgeBuzon.hidden = true;
      }
    }
    window.dispatchEvent(new CustomEvent("erbolamm:inbox", {
      detail: { pendingForOrchestrator: pending, total: messages.length },
    }));
    if (inboxStatus && !inboxBusy && messages.length) {
      inboxStatus.textContent =
        pending === 0
          ? "El orquestador ha leído todo lo enviado."
          : pending === 1
            ? "1 nota pendiente de leer por el orquestador."
            : `${pending} notas pendientes de leer por el orquestador.`;
    }
    const fragment = document.createDocumentFragment();
    if (!messages.length) {
      const empty = document.createElement("li");
      empty.className = "inbox-empty";
      empty.textContent = "El buzón está vacío.";
      fragment.append(empty);
    }
    for (const message of [...messages].reverse()) {
      const item = document.createElement("li");
      item.className = "inbox-message";
      item.dataset.author = String(message.author);
      const who = document.createElement("strong");
      who.textContent =
        message.author === "javier"
          ? "Javier"
          : `Orquestador [${String(message.author)}]`;
      const body = document.createElement("p");
      body.textContent = String(message.text);
      const meta = document.createElement("small");
      const when = new Date(message.timestamp);
      meta.textContent = Number.isNaN(when.valueOf())
        ? "Fecha desconocida"
        : when.toLocaleString("es-ES");
      item.append(who, body, meta);
      // Cada nota de Javier se puede convertir en tarea. Se abre en la MISMA
      // ficha que edita las tareas: un solo editor en toda la oficina.
      if (message.author === "javier") {
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "inbox-edit";
        edit.textContent = "Editar";
        edit.addEventListener("click", () => {
          const params = new URLSearchParams({
            note: String(message.timestamp),
            author: String(message.author),
          });
          window.open(
            `/vista/tarea-ficha.html?${params.toString()}`,
            "oficina-nota-ficha",
            "popup=yes,width=560,height=900,resizable=yes,scrollbars=yes",
          )?.focus();
        });
        item.append(edit);
      }
      fragment.append(item);
    }
    inboxList.replaceChildren(fragment);
  }

  window.addEventListener("erbolamm:open-inbox", () => {
    if (typeof window.activatePanelTab === "function") {
      window.activatePanelTab("buzon");
    }
    const section = $("#office-tools-buzon");
    const inbox = $("#inbox-text");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => inbox?.focus(), 250);
      return;
    }
    // La vista dedicada mantiene el mismo formulario y almacén local.
    if (window.location.pathname !== "/vista/buzon") {
      window.location.assign("/vista/buzon#buzon");
    }
  });

  async function refresh() {
    if (polling || document.hidden) return;
    // Servidor caído: no se insiste hasta que toque, y así no se llena la consola.
    if (Date.now() < esperaHasta) return;
    polling = true;
    const connection = $("#connection");
    const updated = $("#updated");
    try {
      const urlTasks = resolverApi("/api/tasks");
      let response;
      let esFallback = false;
      try {
        response = await fetch(urlTasks, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } catch (errApi) {
        const fallbackUrl = (window.location.pathname.includes('/vista/') ? '../datos/tasks.json' : 'datos/tasks.json');
        response = await fetch(fallbackUrl);
        if (!response.ok) throw errApi;
        esFallback = true;
      }
      const datos = await response.json();
      render(datos);
      const routineList = $("#routine-list");
      const routineResult = $("#routine-result");
      if (routineList) {
        try {
          await loadRoutines();
        } catch (routineLoadError) {
          if (routineResult)
            routineResult.textContent = `No se pudieron cargar las rutinas: ${routineLoadError.message}`;
        }
      }
      const recurrentesList = $("#recurrentes-list");
      if (recurrentesList && !recurrentesBusy) {
        try {
          await loadRecurrentes();
        } catch (_) {}
      }
      try {
        let reportsUrl = resolverApi("/api/reports");
        let reportsResponse;
        try {
          reportsResponse = await fetch(reportsUrl, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          });
          if (!reportsResponse.ok) throw new Error(`HTTP ${reportsResponse.status}`);
        } catch (errRep) {
          const fallbackReportsUrl = (window.location.pathname.includes('/vista/') ? '../datos/reports.json' : 'datos/reports.json');
          reportsResponse = await fetch(fallbackReportsUrl);
        }
        if (reportsResponse && reportsResponse.ok) {
          renderReports(await reportsResponse.json());
        }
      } catch (reportsError) {
        renderReports({ reports: [] });
      }
      const inboxList = $("#inbox-list");
      if (inboxList && !inboxBusy) {
        try {
          renderInbox(await inboxRequest("GET"));
        } catch (inboxError) {
          const inboxStatus = $("#inbox-status");
          if (inboxStatus)
            inboxStatus.textContent = `Buzón en modo local`;
        }
      }
      if (connection) {
        const b = obtenerBackendUrl();
        if (b && !esFallback) {
          connection.dataset.kind = "online";
          connection.textContent = b.includes("127.0.0.1") || b.includes("localhost") ? "Conectada (Local)" : "Conectada (Hostinger)";
        } else {
          connection.dataset.kind = "escaparate";
          connection.textContent = "Modo Web · Conectar";
        }
        if (!connection.dataset.hybridInit) {
          connection.dataset.hybridInit = "true";
          connection.style.cursor = "pointer";
          connection.title = "Pulsar para configurar servidor Local o Hostinger";
          connection.addEventListener("click", () => mostrarSelectorHibrido());
        }
      }
      fallosSeguidos = 0;
      esperaHasta = 0;
      if (updated)
        updated.textContent = esFallback ? `Modo Web (sincronizado)` : `Actualizado a las ${new Date().toLocaleTimeString("es-ES")}`;
    } catch (requestError) {
      lastSnapshot = { valid: false };
      fallosSeguidos += 1;
      // 1,5 s · 3 s · 6 s · 12 s · 15 s como tope. Basta para no martillear y vuelve
      // solo en cuanto la Oficina responde otra vez.
      esperaHasta =
        Date.now() + Math.min(15000, 1500 * 2 ** Math.min(fallosSeguidos - 1, 4));
      if (fallosSeguidos === 1) {
        console.warn(
          "Oficina sin conexión; se reintenta con espera creciente hasta que responda.",
          requestError,
        );
      }
      window.dispatchEvent(new CustomEvent("erbolamm:snapshot", { detail: lastSnapshot }));
      if (connection) {
        connection.dataset.kind = "error";
        connection.textContent = hasData
          ? "Sin conexión · última lectura"
          : "Sin datos";
      }
      if (updated) updated.textContent = "Reintentando automáticamente";
      renderAgents({}, false, null);
      renderLimits([]);
      renderCosts({ valid: false, reason: "unavailable", entries: [] });
      renderNeeds(
        false,
        ["Sin conexión: el estado actual no está verificado."],
        null,
        currentStates,
        [],
      );
      previousActive = null;
    } finally {
      polling = false;
    }
  }

  // Tema: aplicar persistencia ya hecha por el head; enganchar el botón y sincronizar iframes.
  function syncFramesTheme(theme) {
    document.querySelectorAll("iframe").forEach((frame) => {
      try {
        if (frame.contentDocument && frame.contentDocument.documentElement) {
          frame.contentDocument.documentElement.dataset.theme = theme;
        }
      } catch (_) {}
      try {
        if (frame.contentWindow) {
          frame.contentWindow.postMessage({ type: "erbolamm:theme", theme }, "*");
        }
      } catch (_) {}
    });
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";
    document.querySelectorAll("#theme-toggle, .theme-toggle").forEach((btn) => {
      btn.setAttribute(
        "aria-label",
        isDark ? "Activar modo claro" : "Activar modo oscuro",
      );
      btn.setAttribute(
        "title",
        isDark ? "Activar modo claro" : "Activar modo oscuro",
      );
      const icon = btn.querySelector("#theme-icon, .theme-icon");
      if (icon) {
        icon.textContent = isDark ? "☀" : "☾";
      } else {
        btn.textContent = isDark ? "☀" : "☾";
      }
    });
    syncFramesTheme(root.dataset.theme);
  }

  const storedTheme = (() => {
    try {
      return localStorage.getItem("erbolamm-panel-theme");
    } catch (_) {
      return null;
    }
  })();
  const initialTheme = storedTheme || root.dataset.theme || "dark";
  applyTheme(initialTheme === "dark" ? "dark" : "light");

  // Al cargar iframes nuevos o retrasados, heredar inmediatamente el tema actual
  document.querySelectorAll("iframe").forEach((frame) => {
    frame.addEventListener("load", () => {
      syncFramesTheme(root.dataset.theme === "dark" ? "dark" : "light");
    });
  });

  document.querySelectorAll("#theme-toggle, .theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("erbolamm-panel-theme", next);
      } catch (_) {}
    });
  });

  const refreshBtn = $("#refresh-btn") || $(".btn-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }

  // Barra lateral: drawer en móvil, plegado a iconos en escritorio.
  const sidebar = $("#office-sidebar");
  const sidebarToggle = $("#sidebar-toggle");
  const sidebarScrim = $("#sidebar-scrim");
  const MOBILE_BREAKPOINT = 820;
  const isMobileView = () =>
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  const SIDEBAR_KEY = "erbolamm-panel-sidebar";
  const savedMode = root.dataset.sidebar === "icons" ? "icons" : "full";
  function persistSidebarMode(mode) {
    try {
      localStorage.setItem(SIDEBAR_KEY, mode);
    } catch (_) {}
  }
  function syncToggleAffordance(mode) {
    if (!sidebarToggle) return;
    if (isMobileView()) {
      const open = Boolean(sidebar && sidebar.dataset.drawerOpen === "true");
      const label = open ? "Cerrar el menú" : "Abrir el menú";
      sidebarToggle.setAttribute("aria-expanded", String(open));
      sidebarToggle.setAttribute("aria-label", label);
      sidebarToggle.setAttribute("title", label);
      return;
    }
    const collapsed = mode === "icons";
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle.setAttribute(
      "aria-label",
      collapsed
        ? "Desplegar la barra lateral"
        : "Plegar la barra lateral a solo iconos",
    );
    sidebarToggle.setAttribute(
      "title",
      collapsed ? "Desplegar la barra lateral" : "Plegar la barra lateral",
    );
  }
  function closeDrawer() {
    if (!isMobileView() || !sidebar || !sidebarScrim) return;
    sidebar.dataset.drawerOpen = "false";
    sidebarScrim.dataset.active = "false";
    sidebarScrim.setAttribute("aria-hidden", "true");
    syncToggleAffordance(root.dataset.sidebar);
  }
  function openDrawer() {
    if (esModoLimpio) return;
    if (!isMobileView() || !sidebar || !sidebarScrim) return;
    sidebar.dataset.drawerOpen = "true";
    sidebarScrim.dataset.active = "true";
    sidebarScrim.setAttribute("aria-hidden", "false");
    syncToggleAffordance(root.dataset.sidebar);
  }
  function applySidebarMode(mode, { skipPersist = false } = {}) {
    if (esModoLimpio) {
      if (sidebar) {
        sidebar.dataset.drawerOpen = "false";
        sidebar.setAttribute("aria-hidden", "true");
      }
      if (sidebarScrim) {
        sidebarScrim.dataset.active = "false";
        sidebarScrim.setAttribute("aria-hidden", "true");
      }
      return;
    }
    root.dataset.sidebar = mode === "icons" ? "icons" : "full";
    if (!sidebar || !sidebarScrim) return;
    if (isMobileView()) {
      // En el teléfono el drawer empieza siempre cerrado: abrirlo según el
      // modo guardado lo desplegaba encima del contenido en cada página.
      closeDrawer();
    } else {
      sidebar.removeAttribute("data-drawer-open");
      sidebarScrim.dataset.active = "false";
    }
    syncToggleAffordance(mode);
    if (!skipPersist) persistSidebarMode(mode);
  }
  if (esModoLimpio) {
    if (sidebar) {
      sidebar.dataset.drawerOpen = "false";
      sidebar.setAttribute("aria-hidden", "true");
    }
    if (sidebarToggle) {
      sidebarToggle.setAttribute("aria-hidden", "true");
    }
    if (sidebarScrim) {
      sidebarScrim.dataset.active = "false";
      sidebarScrim.setAttribute("aria-hidden", "true");
    }
  } else {
    applySidebarMode(savedMode, { skipPersist: true });
  }
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      if (esModoLimpio) return;
      if (isMobileView()) {
        const isOpen = sidebar.dataset.drawerOpen === "true";
        if (isOpen) closeDrawer();
        else openDrawer();
        return;
      }
      const next = root.dataset.sidebar === "icons" ? "full" : "icons";
      applySidebarMode(next);
    });
  }
  if (sidebarScrim) sidebarScrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!isMobileView()) return;
    if (!sidebar || sidebar.dataset.drawerOpen !== "true") return;
    closeDrawer();
    if (sidebarToggle) sidebarToggle.focus();
  });

  // ── Sincronización Canónica de la Barra Lateral ──────────────────────────
  // Garantiza que en absolutamente TODAS las páginas de la Oficina, la navegación
  // lateral tenga la misma lista idéntica de 10 enlaces en el mismo orden exacto,
  // con los mismos títulos, subtítulos e iconos, evitando saltos visuales al navegar.
  const CANONICAL_SIDE_NAV = [
    { href: "/", label: "Oficina", desc: "Tablero de tareas", icon: "⌂", id: "casita" },
    { href: "/vista/javier", label: "Espacio Javier", desc: "Control personal y ja--", icon: "👤", id: "nav-javier" },
    { href: "/vista/inicio-dia", label: "Inicio del día", desc: "Checklist matutino", icon: "☼" },
    { href: "/vista/aplichat", label: "ApliChat", desc: "Chat accesible", icon: "💬" },
    { href: "/vista/skills", label: "Skills", desc: "Botonera y catálogo", icon: "⌘" },
    { href: "/vista/conectores", label: "Conectores", desc: "Servicios y credenciales", icon: "⇄" },
    { href: "/vista/plugins", label: "Plugins", desc: "Módulos de la Oficina", icon: "⊞" },
    { href: "/vista/reflect", label: "Reflect", desc: "Directivas y memoria", icon: "◐" },
    { href: "/vista/propuestas", label: "Propuestas", desc: "Bandeja de Orquestadores", icon: "💡" },
    { href: "/vista/diseno", label: "Estudio de Diseño", desc: "Vídeo, marcos y SFX", icon: "🎨" },
    { href: "/vista/tiendas", label: "Tiendas y ASO", desc: "Auditoría y keywords", icon: "🎯" },
    { href: "/vista/mercado", label: "Radar de Mercado", desc: "Tendencias y noticias", icon: "📊" },
    { href: "/vista/correos", label: "Correos y Alertas", desc: "erbolamm y javier", icon: "✉" },
    { href: "/vista/pnl", label: "Estudio PNL", desc: "Enganche y microcopy", icon: "🧠" },
    { href: "/vista/musica", label: "Estudio Musical", desc: "Música procedural", icon: "🎵" },
    { href: "/vista/locucion", label: "Locución y Guiones", desc: "TTS y guiones cortos", icon: "🎙" },
    { href: "/vista/voicestudio", label: "Voice Studio", desc: "Clonación ultrarrápida", icon: "⚡" },
    { href: "/vista/terminales", label: "Terminales", desc: "Lanzadores locales", icon: "▣" },
    { href: "/vista/facturas", label: "Facturas", desc: "Gestor de facturas", icon: "€" },
    { href: "/vista/blogger", label: "Blogger", desc: "Monitor y difusión", icon: "✎" },
    { href: "/vista/bitacora", label: "Bitácora", desc: "Proyectos y enlaces", icon: "☰" },
    { href: "/vista/directo", label: "Directo", desc: "Centro de retransmisión", icon: "▶" },
    { href: "/vista/diapositivas", label: "Diapositivas", desc: "Presentaciones y difusión", icon: "⎘" },
    { href: "/vista/shorts", label: "Shorts", desc: "Vídeo acelerado a 60 s", icon: "⏩" },
    { href: "/resenas", label: "Reseñas", desc: "Contestador inteligente", icon: "★" },
    { href: "/vista/settings", label: "Ajustes", desc: "Opciones por defecto", icon: "⚙" },
    { href: "/vista/como-funciona", label: "Cómo funciona", desc: "Guía de la Oficina", icon: "?" },
  ];
  // The server registry (/api/modulos) replaces this list once loaded; the
  // built-in array above stays as the fallback when it cannot be reached.
  let sideNavItems = CANONICAL_SIDE_NAV;

  // Pestañas ocultas desde /vista/plugins. Es una preferencia de este
  // navegador: la ruta sigue existiendo, solo desaparece de la barra lateral.
  // La Oficina y la propia vista de Plugins no se pueden ocultar, para que
  // siempre haya un camino de vuelta.
  const HIDDEN_NAV_KEY = "erbolamm-panel-hidden-nav";
  const LOCKED_NAV = Object.freeze(["/", "/vista/javier", "/vista/plugins", "/vista/correos"]);

  function readHiddenNav() {
    try {
      const raw = JSON.parse(localStorage.getItem(HIDDEN_NAV_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter(
        (href) => typeof href === "string" && !LOCKED_NAV.includes(href),
      );
    } catch (_) {
      return [];
    }
  }

  function setNavHidden(href, hidden) {
    if (LOCKED_NAV.includes(href)) return readHiddenNav();
    if (!sideNavItems.some((item) => item.href === href)) {
      return readHiddenNav();
    }
    const next = new Set(readHiddenNav());
    if (hidden) next.add(href);
    else next.delete(href);
    const list = [...next];
    try {
      localStorage.setItem(HIDDEN_NAV_KEY, JSON.stringify(list));
    } catch (_) {}
    syncCanonicalSideNav();
    return list;
  }

  // Estado de migración de pestañas: nube (☁️) vs ApliChat (📱)
  let migrationState = {};

  function applyMigrationState(payload) {
    if (!payload || !Array.isArray(payload.pestanas)) return false;
    migrationState = {};
    for (const p of payload.pestanas) {
      if (p && typeof p.href === "string") {
        migrationState[p.href] = p;
      }
    }
    syncCanonicalSideNav();
    return true;
  }

  function loadMigrationState() {
    if (typeof fetch !== "function") return;
    fetch("/estado-migracion-pestanas.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(applyMigrationState)
      .catch(() => {});
  }

  function syncCanonicalSideNav() {
    const nav = document.querySelector(".office-sidebar .side-nav");
    if (!nav) return;
    const hiddenNav = readHiddenNav();

    const currentPath = window.location.pathname.replace(/\/index\.html$/, "/") || "/";

    // Vaciar hijos existentes de forma segura
    while (nav.firstChild) {
      nav.removeChild(nav.firstChild);
    }

    for (const item of sideNavItems) {
      let isCurrent = false;
      if (item.href === "/" && (currentPath === "/" || currentPath === "" || currentPath === "/index.html")) {
        isCurrent = true;
      } else if (item.href !== "/" && (currentPath === item.href || currentPath.startsWith(item.href + "/") || currentPath === item.href + ".html")) {
        isCurrent = true;
      }
      if (item.href === "/vista/aplichat" && currentPath.includes("traductor")) isCurrent = true;
      if (item.href === "/vista/directo" && currentPath.includes("twitch")) isCurrent = true;
      // La página abierta se pinta siempre, aunque su pestaña esté oculta.
      if (!isCurrent && hiddenNav.includes(item.href)) continue;

      const a = document.createElement("a");
      a.className = "nav-card" + (isCurrent ? " active" : "");
      a.href = item.href;
      if (item.id) a.id = item.id;
      if (isCurrent) a.setAttribute("aria-current", "page");

      const iconSpan = document.createElement("span");
      iconSpan.className = "nav-icon";
      iconSpan.setAttribute("aria-hidden", "true");
      iconSpan.textContent = item.icon;

      const copySpan = document.createElement("span");
      copySpan.className = "nav-copy";

      const strong = document.createElement("strong");
      strong.textContent = item.label;

      const small = document.createElement("small");
      small.textContent = item.desc;

      copySpan.appendChild(strong);
      copySpan.appendChild(small);

      a.appendChild(iconSpan);
      a.appendChild(copySpan);

      const pState = migrationState[item.href];
      if (pState) {
        if (pState.estado === "publicada_nube") {
          const statusSpan = document.createElement("span");
          statusSpan.className = "nav-status-icon nav-status-nube";
          statusSpan.textContent = "☁️";
          statusSpan.title = "Completamente subido a la nube";
          statusSpan.setAttribute("aria-label", "Subido a la nube");
          a.appendChild(statusSpan);
        } else if (pState.estado === "embebida_aplichat") {
          const statusSpan = document.createElement("span");
          statusSpan.className = "nav-status-icon nav-status-movil";
          statusSpan.textContent = "📱";
          statusSpan.title = "Embebido en ApliChat";
          statusSpan.setAttribute("aria-label", "Embebido en ApliChat");
          a.appendChild(statusSpan);
        }
      }

      a.addEventListener("click", () => {
        if (isMobileView()) closeDrawer();
      });

      nav.appendChild(a);
    }
    syncBloggerNavBadge();
  }

  // ─── Aviso de propuesta de Blogger lista ───
  // La vista de Blogger anota en localStorage el trabajo editorial en curso.
  // Mientras exista y se esté en otra página de la Oficina, aquí se consulta
  // si la propuesta ya está (lectura barata, sin tocar Herdr) y se enciende
  // un distintivo en la pestaña lateral. Blogger lo apaga al mostrarla.
  const BLOGGER_NAV_HREF = "/vista/blogger";
  const BLOGGER_JOB_KEY = "erbolamm-blogger-job";
  const BLOGGER_READY_KEY = "erbolamm-blogger-ready";
  const BLOGGER_JOB_MAX_MS = 30 * 60 * 1000;
  const BLOGGER_POLL_MS = 6000;
  let bloggerPollTimer = null;
  let bloggerToken = "";

  function readBloggerJob() {
    try {
      const job = JSON.parse(localStorage.getItem(BLOGGER_JOB_KEY) || "null");
      if (
        job &&
        typeof job.startedAt === "number" &&
        Date.now() - job.startedAt < BLOGGER_JOB_MAX_MS
      ) {
        return job;
      }
      if (job) localStorage.removeItem(BLOGGER_JOB_KEY);
    } catch (_) {}
    return null;
  }

  function bloggerProposalReady() {
    try {
      return Boolean(localStorage.getItem(BLOGGER_READY_KEY));
    } catch (_) {
      return false;
    }
  }

  function syncBloggerNavBadge() {
    const link = document.querySelector(
      `.office-sidebar .side-nav a[href="${BLOGGER_NAV_HREF}"]`,
    );
    if (!link) return;
    const onBlogger = link.getAttribute("aria-current") === "page";
    const ready = !onBlogger && bloggerProposalReady();
    const working = !ready && !onBlogger && Boolean(readBloggerJob());
    link.classList.toggle("has-update", ready);
    link.classList.toggle("is-working", working);
    let badge = link.querySelector(".nav-badge");
    if (!ready && !working) {
      if (badge) badge.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "nav-badge";
      badge.setAttribute("role", "img");
      link.appendChild(badge);
    }
    badge.setAttribute(
      "aria-label",
      ready ? "Propuesta lista" : "Investigando en segundo plano",
    );
  }

  async function bloggerRequest(path, method) {
    if (!bloggerToken) {
      bloggerToken = String((office && office.actionToken) || "");
    }
    if (!bloggerToken) {
      const tasks = await fetch("/api/tasks", {
        credentials: "same-origin",
        cache: "no-store",
      });
      bloggerToken = String(((await tasks.json()).office || {}).actionToken || "");
    }
    const response = await fetch("/api/blogger/assistant" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-ErBolamm-Action": bloggerToken,
      },
      credentials: "same-origin",
      cache: "no-store",
      ...(method === "POST" ? { body: "{}" } : {}),
    });
    if (response.status === 403) bloggerToken = "";
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.json();
  }

  async function pollBloggerProposal() {
    bloggerPollTimer = null;
    const job = readBloggerJob();
    const onBlogger =
      window.location.pathname.replace(/\.html$/, "") === BLOGGER_NAV_HREF;
    if (!job || onBlogger) {
      syncBloggerNavBadge();
      return;
    }
    try {
      const baseline = (job.baseline && job.baseline.candidateDigest) || "";
      let proposal = await bloggerRequest("/proposal", "GET");
      if (proposal.candidateDigest && proposal.candidateDigest !== baseline) {
        // Se recoge ya, para que quede guardada aunque no se abra Blogger.
        if (proposal.candidateUnseen) {
          proposal = (await bloggerRequest("/refresh", "POST")).proposal || {};
        }
        if (proposal.candidateDigest && !proposal.candidateUnseen) {
          localStorage.setItem(BLOGGER_READY_KEY, proposal.candidateDigest);
          localStorage.removeItem(BLOGGER_JOB_KEY);
          syncBloggerNavBadge();
          const announcer = $("#announcer");
          if (announcer) {
            announcer.textContent = "La propuesta de Blogger está lista.";
          }
          return;
        }
      }
    } catch (_) {
      // Servidor ocupado o sin red: el trabajo sigue; se reintenta.
    }
    syncBloggerNavBadge();
    bloggerPollTimer = window.setTimeout(pollBloggerProposal, BLOGGER_POLL_MS);
  }

  function watchBloggerProposal() {
    syncBloggerNavBadge();
    if (bloggerPollTimer === null && readBloggerJob()) {
      bloggerPollTimer = window.setTimeout(pollBloggerProposal, BLOGGER_POLL_MS);
    }
  }

  syncCanonicalSideNav();

  // Server registry: same tabs, same order, plus the enabled flag. Any
  // failure keeps the built-in list so the sidebar never goes blank.
  function applyModulesRegistry(payload) {
    const list = payload && Array.isArray(payload.modulos) ? payload.modulos : null;
    if (!list || !list.length) return false;
    const items = [];
    for (const m of list) {
      if (!m || typeof m.ruta !== "string" || typeof m.etiqueta !== "string") return false;
      if (m.habilitado === false && m.siempre !== true) continue;
      const item = { href: m.ruta, label: m.etiqueta, desc: m.descripcion || "", icon: m.icono || "" };
      if (m.navId) item.id = m.navId;
      items.push(item);
    }
    if (!items.length) return false;
    sideNavItems = items;
    syncCanonicalSideNav();
    return true;
  }

  if (typeof fetch === "function") {
    fetch("/api/modulos", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(applyModulesRegistry)
      .catch(() => {});

    loadMigrationState();
  }

  watchBloggerProposal();
  window.addEventListener("blogger:state", watchBloggerProposal);
  // Otra pestaña del navegador cambió qué secciones se ven: se refleja aquí.
  window.addEventListener("storage", (event) => {
    if (event.key === HIDDEN_NAV_KEY) syncCanonicalSideNav();
    if (event.key === BLOGGER_JOB_KEY || event.key === BLOGGER_READY_KEY) {
      watchBloggerProposal();
    }
  });
  window
    .matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    .addEventListener("change", () => {
      if (esModoLimpio) return;
      applySidebarMode(root.dataset.sidebar === "icons" ? "icons" : "full", {
        skipPersist: true,
      });
    });

  // ── Menú contextual en la barra lateral: Abrir en ventana limpia ────────────
  let navContextMenuEl = null;

  function dismissNavContextMenu() {
    if (navContextMenuEl && navContextMenuEl.parentNode) {
      navContextMenuEl.parentNode.removeChild(navContextMenuEl);
    }
    navContextMenuEl = null;
  }

  document.addEventListener("contextmenu", (e) => {
    const card = e.target.closest(
      ".office-sidebar .nav-card, .side-nav .nav-card, a.nav-card"
    );
    if (!card) {
      dismissNavContextMenu();
      return;
    }

    e.preventDefault();
    dismissNavContextMenu();

    const menu = document.createElement("div");
    menu.className = "nav-card-context-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Acciones de navegación");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-card-context-btn";
    btn.setAttribute("role", "menuitem");

    const iconSpan = document.createElement("span");
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.textContent = "↗";
    const textSpan = document.createElement("span");
    textSpan.textContent = "Abrir en ventana limpia";
    btn.appendChild(iconSpan);
    btn.appendChild(document.createTextNode(" "));
    btn.appendChild(textSpan);

    btn.addEventListener("click", () => {
      dismissNavContextMenu();
      const rawHref = card.getAttribute("href") || card.href || "/";
      try {
        const url = new URL(rawHref, window.location.origin);
        url.searchParams.set("modo", "limpio");
        window.open(url.toString(), "_blank");
      } catch (_) {
        const sep = rawHref.includes("?") ? "&" : "?";
        window.open(`${rawHref}${sep}modo=limpio`, "_blank");
      }
    });

    menu.appendChild(btn);
    document.body.appendChild(menu);
    navContextMenuEl = menu;

    const menuWidth = 220;
    const menuHeight = 44;
    const x = Math.max(8, Math.min(e.clientX, window.innerWidth - menuWidth - 8));
    const y = Math.max(8, Math.min(e.clientY, window.innerHeight - menuHeight - 8));

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  });

  document.addEventListener("click", (e) => {
    if (navContextMenuEl && !navContextMenuEl.contains(e.target)) {
      dismissNavContextMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dismissNavContextMenu();
    }
  });

  window.addEventListener("scroll", dismissNavContextMenu, { passive: true });
  if (sidebar) {
    sidebar.addEventListener("scroll", dismissNavContextMenu, { passive: true });
  }

  // ── Pestaña Agentes: anotar disponibilidad o pegar+interpretar ─────────
  const limitRoleSelect = $("#limit-role");
  if (limitRoleSelect) {
    const opciones = document.createDocumentFragment();
    for (const profile of fallbackProfiles) {
      const opcion = document.createElement("option");
      opcion.value = profile.id;
      opcion.textContent = profile.label;
      opciones.append(opcion);
    }
    limitRoleSelect.replaceChildren(opciones);
  }

  async function guardarLimite({ profile, status, usedPercentage, renewsAt, note }) {
    const cuerpo = { profile, status };
    if (Number.isFinite(usedPercentage)) cuerpo.usedPercentage = usedPercentage;
    if (renewsAt) cuerpo.renewsAt = `${renewsAt}T00:00:00.000Z`;
    if (note) cuerpo.note = note;
    const response = await fetch("/api/execution-availability", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-ErBolamm-Action": String(office.actionToken || ""),
      },
      body: JSON.stringify(cuerpo),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }
    office = { ...result.office, actionToken: office.actionToken };
    await refresh();
    return result.office;
  }

  const limitEditorForm = $("#limit-editor");
  if (limitEditorForm) {
    limitEditorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = $("#limit-editor-status");
      const boton = limitEditorForm.querySelector("button[type='submit']");
      if (boton) boton.disabled = true;
      if (status) {
        status.textContent = "Guardando…";
        status.dataset.error = "no";
      }
      try {
        const rawPercentage = $("#limit-percentage").value.trim();
        await guardarLimite({
          profile: $("#limit-role").value,
          status: $("#limit-status").value,
          usedPercentage:
            rawPercentage === "" ? null : Number(rawPercentage),
          renewsAt: $("#limit-renews").value || null,
          note: $("#limit-note").value.trim() || null,
        });
        if (status) status.textContent = "Guardado.";
        $("#limit-note").value = "";
      } catch (error) {
        if (status) {
          status.dataset.error = "si";
          status.textContent = `No se pudo guardar: ${error.message}`;
        }
      } finally {
        if (boton) boton.disabled = false;
      }
    });
  }

  // El botón de "Interpretar con Groq" se retiró por la regla canónica
  // de Cero IA en la web (`AGENTS.md` §3.1.bis): el panel no llama a
  // LLM externos. La disponibilidad se anota perfil a perfil desde el
  // editor superior; sigue siendo la única vía de escritura.

  // Creador de tareas (presente solo en /vista/delegar).
  const taskCreatorForm = $("#task-creator-form");
  if (taskCreatorForm) {
    function draftFromForm() {
      const data = new FormData(taskCreatorForm);
      return {
        role: String(data.get("role") || ""),
        project: String(data.get("project") || ""),
        priority: String(data.get("priority") || ""),
        title: String(data.get("title") || ""),
        destination: String(data.get("destination") || ""),
        text: String(data.get("text") || ""),
      };
    }
    const taskCreatorResult = $("#task-creator-result");
    taskCreatorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (taskCreatorResult)
        taskCreatorResult.textContent = "Preparando vista previa…";
      try {
        const draft = draftFromForm();
        const result = await taskRequest("/api/tasks/preview", draft);
        pendingDraft = draft;
        pendingPreview = result.preview;
        const taskPreviewFile = $("#task-preview-file");
        const taskPreviewBody = $("#task-preview-body");
        const taskPreviewError = $("#task-preview-error");
        if (taskPreviewFile)
          taskPreviewFile.textContent = result.preview.fileName;
        if (taskPreviewBody) taskPreviewBody.textContent = result.preview.body;
        if (taskPreviewError) taskPreviewError.textContent = "";
        if (taskCreatorResult)
          taskCreatorResult.textContent =
            "Vista previa preparada; falta confirmar.";
        const taskPreviewDialog = $("#task-preview-dialog");
        if (taskPreviewDialog) taskPreviewDialog.showModal();
      } catch (requestError) {
        pendingDraft = null;
        pendingPreview = null;
        if (taskCreatorResult)
          taskCreatorResult.textContent = `No se pudo preparar: ${requestError.message}`;
      }
    });
    const cancelTask = $("#cancel-task");
    if (cancelTask) {
      cancelTask.addEventListener("click", () => {
        pendingDraft = null;
        const taskPreviewDialog = $("#task-preview-dialog");
        if (taskPreviewDialog) taskPreviewDialog.close();
        if (taskCreatorResult)
          taskCreatorResult.textContent =
            "Creación cancelada; no se escribió ningún archivo.";
      });
    }
    const taskConfirmForm = $("#task-confirm-form");
    if (taskConfirmForm) {
      taskConfirmForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!pendingDraft || !pendingPreview) return;
        const confirmTaskEl = $("#confirm-task");
        const taskPreviewError = $("#task-preview-error");
        if (confirmTaskEl) confirmTaskEl.disabled = true;
        if (taskPreviewError) taskPreviewError.textContent = "";
        try {
          const result = await taskRequest("/api/tasks/create", {
            ...pendingDraft,
            confirmed: true,
            expectedFileName: pendingPreview.fileName,
            expectedBody: pendingPreview.body,
          });
          const fileName = result.preview.fileName;
          pendingDraft = null;
          pendingPreview = null;
          const taskPreviewDialog = $("#task-preview-dialog");
          if (taskPreviewDialog) taskPreviewDialog.close();
          taskCreatorForm.reset();
          if (taskCreatorResult) {
            taskCreatorResult.replaceChildren(
              document.createTextNode(`Creada: ${fileName} · `),
              Object.assign(document.createElement("a"), {
                href: "/vista/tablero",
                textContent: "ver en el tablero",
              }),
            );
          }
          const announcer = $("#announcer");
          if (announcer)
            announcer.textContent = `Tarea creada en Por hacer: ${fileName}`;
          await refresh();
        } catch (requestError) {
          if (taskPreviewError)
            taskPreviewError.textContent = `No se pudo crear: ${requestError.message}`;
        } finally {
          const confirmTaskEl2 = $("#confirm-task");
          if (confirmTaskEl2) confirmTaskEl2.disabled = false;
        }
      });
    }
  }

  // Rutinas: diálogo y formulario (presente solo en /vista/rutinas).
  const routineList = $("#routine-list");
  const routineConfirmForm = $("#routine-confirm-form");
  if (routineList && routineConfirmForm) {
    const cancelRoutine = $("#cancel-routine");
    if (cancelRoutine) {
      cancelRoutine.addEventListener("click", () => {
        pendingRoutine = null;
        const routineDialog = $("#routine-dialog");
        if (routineDialog) routineDialog.close();
        const routineResult = $("#routine-result");
        if (routineResult)
          routineResult.textContent =
            "Rutina cancelada; no se cambió el tablero.";
      });
    }
    routineConfirmForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!pendingRoutine) return;
      const confirmRoutineEl = $("#confirm-routine");
      const routineError = $("#routine-error");
      if (confirmRoutineEl) confirmRoutineEl.disabled = true;
      if (routineError) routineError.textContent = "";
      try {
        const result = await routineRequest("POST", {
          routine: pendingRoutine.id,
          confirmed: true,
        });
        const routineDialog = $("#routine-dialog");
        if (routineDialog) routineDialog.close();
        const routineResult = $("#routine-result");
        if (routineResult)
          routineResult.textContent = `${pendingRoutine.title}\n${String(result.report.result || "Sin resultado.")}`;
        const announcer = $("#announcer");
        if (announcer)
          announcer.textContent = `${pendingRoutine.title} completada; informe guardado localmente.`;
        pendingRoutine = null;
        await refresh();
      } catch (requestError) {
        if (routineError)
          routineError.textContent = `No se ejecutó completa: ${requestError.message}`;
      } finally {
        const confirmRoutineEl2 = $("#confirm-routine");
        if (confirmRoutineEl2) confirmRoutineEl2.disabled = false;
      }
    });
  }

  // Tareas recurrentes: botón de recarga
  const recurrentesRefreshBtn = $("#recurrentes-refresh-btn");
  if (recurrentesRefreshBtn) {
    recurrentesRefreshBtn.addEventListener("click", () => {
      loadRecurrentes();
    });
  }

  // Tareas recurrentes: botón de nueva recurrente y formulario
  const recurrentesNewBtn = $("#recurrentes-new-btn");
  const recurrentesForm = $("#recurrentes-form");
  const recurrentesCancelBtn = $("#recurrentes-cancel-btn");
  const RECURRENTES_DRAFT_KEY = "erbolamm-draft-recurrentes-form";

  function guardarBorradorRecurrentes() {
    try {
      const data = {
        title: $("#rec-title") ? $("#rec-title").value : "",
        role: $("#rec-role") ? $("#rec-role").value : "ge",
        days: $("#rec-days") ? $("#rec-days").value : "",
        time: $("#rec-time") ? $("#rec-time").value : "",
        command: $("#rec-command") ? $("#rec-command").value : "",
        objective: $("#rec-objective") ? $("#rec-objective").value : "",
        isOpen: Boolean(recurrentesForm && !recurrentesForm.hidden),
      };
      localStorage.setItem(RECURRENTES_DRAFT_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function restaurarBorradorRecurrentes() {
    try {
      const raw = localStorage.getItem(RECURRENTES_DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      if ($("#rec-title") && data.title !== undefined) $("#rec-title").value = data.title;
      if ($("#rec-role") && data.role !== undefined) $("#rec-role").value = data.role;
      if ($("#rec-days") && data.days !== undefined) $("#rec-days").value = data.days;
      if ($("#rec-time") && data.time !== undefined) $("#rec-time").value = data.time;
      if ($("#rec-command") && data.command !== undefined) $("#rec-command").value = data.command;
      if ($("#rec-objective") && data.objective !== undefined) $("#rec-objective").value = data.objective;
      if (recurrentesForm && data.isOpen) {
        recurrentesForm.hidden = false;
      }
    } catch (_) {}
  }

  if (recurrentesNewBtn && recurrentesForm) {
    recurrentesNewBtn.addEventListener("click", () => {
      recurrentesForm.hidden = !recurrentesForm.hidden;
      guardarBorradorRecurrentes();
      if (!recurrentesForm.hidden) {
        const titleInput = $("#rec-title");
        if (titleInput) titleInput.focus();
      }
    });
  }

  if (recurrentesCancelBtn && recurrentesForm) {
    recurrentesCancelBtn.addEventListener("click", () => {
      recurrentesForm.hidden = true;
      guardarBorradorRecurrentes();
    });
  }

  if (recurrentesForm) {
    recurrentesForm.querySelectorAll("input, select, textarea").forEach((inputEl) => {
      inputEl.addEventListener("input", guardarBorradorRecurrentes);
      inputEl.addEventListener("change", guardarBorradorRecurrentes);
    });
    restaurarBorradorRecurrentes();

    recurrentesForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleInput = $("#rec-title");
      const roleSelect = $("#rec-role");
      const daysInput = $("#rec-days");
      const timeInput = $("#rec-time");
      const commandInput = $("#rec-command");
      const objectiveTextarea = $("#rec-objective");
      const submitBtn = $("#recurrentes-submit-btn");
      const feedback = $("#recurrentes-feedback");

      const title = titleInput ? titleInput.value.trim() : "";
      if (!title) return;

      const role = roleSelect ? roleSelect.value : "ge";
      const days = daysInput ? daysInput.value.trim() : "lunes, miércoles, viernes";
      const time = timeInput ? timeInput.value.trim() : "09:00";
      const command = commandInput ? commandInput.value.trim() : "";
      const objective = objectiveTextarea ? objectiveTextarea.value.trim() : "";

      // Generar slug/id limpio tipo role--slug
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const id = `${role}--${slug || "tarea-periodica"}`;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Guardando…";
      }
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = `Creando tarea recurrente "${id}"…`;
      }

      try {
        const res = await fetch("/api/tasks/recurrentes/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-ErBolamm-Action": String((office && office.actionToken) || ""),
          },
          body: JSON.stringify({
            id,
            title,
            role,
            project: "erbolamm-trabajo",
            days,
            time,
            command: command || null,
            objective,
          }),
        });
        const data = await res.json();
        if (data && data.ok) {
          if (feedback) feedback.textContent = `✅ Tarea recurrente "${id}" creada con éxito.`;
          recurrentesForm.reset();
          recurrentesForm.hidden = true;
          try { localStorage.removeItem(RECURRENTES_DRAFT_KEY); } catch (_) {}
          await loadRecurrentes();
        } else {
          if (feedback) feedback.textContent = `⚠️ Error al crear tarea recurrente: ${(data && data.message) || (data && data.error) || "Error"}`;
        }
      } catch (err) {
        if (feedback) feedback.textContent = `❌ Error: ${err.message}`;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Guardar recurrente";
        }
      }
    });
  }

  // ─── Pestañas con acceso a servidores locales (Patrón Estándar: Facturas y Directo) ───

  // 1. Gestor de facturas (:8787)
  function facturasFrameUrl(loc = window.location) {
    const local = loc.hostname === "127.0.0.1" || loc.hostname === "localhost";
    return local ? "http://127.0.0.1:8787/" : `https://${loc.hostname}:8443/`;
  }
  const facturasFrame = $("#facturas-frame");
  if (facturasFrame) facturasFrame.src = facturasFrameUrl();

  async function checkFacturasStatus() {
    const chip = $("#chip-servidor-facturas");
    const text = $("#text-servidor-facturas");
    const btnStart = $("#btn-arrancar-facturas-head");
    const btnStop = $("#btn-apagar-facturas-head");
    if (!chip && !text) return;
    try {
      await fetch(facturasFrameUrl(), { mode: "no-cors", cache: "no-store" });
      if (chip) chip.className = "status-chip chip-active";
      if (text) text.textContent = ":8787 Activo";
      if (btnStart) btnStart.style.display = "none";
      if (btnStop) btnStop.style.display = "inline-flex";
    } catch (_) {
      if (chip) chip.className = "status-chip chip-idle";
      if (text) text.textContent = ":8787 Detenido";
      if (btnStart) btnStart.style.display = "inline-flex";
      if (btnStop) btnStop.style.display = "none";
    }
  }

  async function arrancarFacturasConConfirmacion(btn) {
    const seguro = window.confirm("¿Arrancar el gestor de facturas (:8787) ahora?");
    if (!seguro) return;

    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ Arrancando…";
    }

    try {
      let token = String((office && office.actionToken) || window.Oficina?.office?.actionToken || "");
      if (!token) {
        try {
          const res = await fetch("/api/tasks", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            token = String(data?.office?.actionToken || "");
          }
        } catch (_) {}
      }

      await fetch("/api/terminals/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ErBolamm-Action": token,
        },
        body: JSON.stringify({
          command: "dart run bin/trabajo.dart erbolamm facturas on",
          background: true,
        }),
      });
    } catch (e) {
      console.error("Error arrancando facturas:", e);
    } finally {
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          const icon = document.createElement("span");
          icon.setAttribute("aria-hidden", "true");
          icon.textContent = "▶";
          if (btn.id === "btn-arrancar-facturas") {
            icon.className = "arrancar-icon";
            const label = document.createElement("span");
            label.textContent = "Arrancar panel";
            btn.replaceChildren(icon, label);
          } else {
            const label = document.createTextNode(" Arrancar Facturas");
            btn.replaceChildren(icon, label);
          }
        }
        if (facturasFrame) {
          facturasFrame.src = facturasFrameUrl();
        }
        checkFacturasStatus();
      }, 2500);
    }
  }

  async function apagarFacturasConConfirmacion(btn) {
    const seguro = window.confirm("¿Estás seguro de que quieres apagar el panel de facturas?");
    if (!seguro) return;

    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ Apagando…";
    }

    const baseUrl = facturasFrameUrl();
    const apagarUrl = new URL("/api/apagar", baseUrl).toString();
    try {
      await fetch(apagarUrl);
      alert("El panel de facturas se ha apagado correctamente.");
    } catch (_) {
      alert("El panel de facturas se ha apagado correctamente.");
    } finally {
      if (btn) {
        btn.disabled = false;
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "⏻";
        if (btn.id === "btn-apagar-facturas") {
          icon.className = "apagar-icon";
          const label = document.createElement("span");
          label.textContent = "Apagar panel";
          btn.replaceChildren(icon, label);
        } else {
          const label = document.createTextNode(" Apagar Facturas");
          btn.replaceChildren(icon, label);
        }
      }
      if (facturasFrame) {
        facturasFrame.src = "about:blank";
      }
      checkFacturasStatus();
    }
  }

  const btnArrancarFacturas = $("#btn-arrancar-facturas");
  if (btnArrancarFacturas) {
    btnArrancarFacturas.addEventListener("click", () => arrancarFacturasConConfirmacion(btnArrancarFacturas));
  }

  const btnArrancarFacturasHead = $("#btn-arrancar-facturas-head");
  if (btnArrancarFacturasHead) {
    btnArrancarFacturasHead.addEventListener("click", () => arrancarFacturasConConfirmacion(btnArrancarFacturasHead));
  }

  const btnApagarFacturas = $("#btn-apagar-facturas");
  if (btnApagarFacturas) {
    btnApagarFacturas.addEventListener("click", () => apagarFacturasConConfirmacion(btnApagarFacturas));
  }

  const btnApagarFacturasHead = $("#btn-apagar-facturas-head");
  if (btnApagarFacturasHead) {
    btnApagarFacturasHead.addEventListener("click", () => apagarFacturasConConfirmacion(btnApagarFacturasHead));
  }

  if ($("#chip-servidor-facturas")) {
    checkFacturasStatus();
    setInterval(checkFacturasStatus, 5000);
  }

  // 2. Centro de directo (:7979 / :8790)
  const directoFrame = $("#directo-frame");
  const directoPlaceholder = $("#directo-offline-placeholder");
  let directoUrlActiva = "http://127.0.0.1:7979/admin";

  const directoTabs = document.querySelectorAll(".directo-subnav button.pill-btn");
  const btnAbrirPestana = $("#btn-abrir-pestana");
  directoTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      directoTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const url = tab.dataset.url;
      if (url) {
        directoUrlActiva = url;
        if (directoFrame) directoFrame.src = url;
        if (btnAbrirPestana) btnAbrirPestana.href = url;
      }
    });
  });

  let directoArrancando = false;

  function renderDirectoPlaceholderCard({ icono = "▶", titulo, subtitulo, botonTexto, botonColor = "#2e7d32", accion }) {
    if (!directoPlaceholder) return;
    directoPlaceholder.style.display = "flex";
    directoPlaceholder.replaceChildren();

    const card = document.createElement("div");
    card.style.cssText = "max-width:460px;margin:auto;padding:2rem;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.05);text-align:center;";

    const iconEl = document.createElement("div");
    iconEl.style.cssText = "font-size:2rem;margin-bottom:0.6rem;";
    iconEl.textContent = icono;

    const titleEl = document.createElement("h3");
    titleEl.style.cssText = "margin:0 0 0.4rem 0;font-size:1.1rem;color:var(--ink);";
    titleEl.textContent = titulo;

    const subEl = document.createElement("p");
    subEl.style.cssText = "margin:0 0 1.2rem 0;font-size:0.85rem;color:var(--ink-muted);line-height:1.5;";
    subEl.textContent = subtitulo;

    card.append(iconEl, titleEl, subEl);

    if (botonTexto && accion) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill-btn";
      btn.style.cssText = `background:${botonColor};color:#fff;border-color:${botonColor};padding:0.55rem 1.2rem;font-size:0.9rem;font-weight:700;cursor:pointer;`;
      btn.textContent = botonTexto;
      btn.addEventListener("click", accion);
      card.appendChild(btn);
    }

    directoPlaceholder.appendChild(card);
  }

  function renderDirectoSpinnerCard(titulo, subtitulo, progreso) {
    if (!directoPlaceholder) return;
    directoPlaceholder.style.display = "flex";
    directoPlaceholder.replaceChildren();

    const card = document.createElement("div");
    card.style.cssText = "max-width:460px;margin:auto;padding:2.2rem;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.05);text-align:center;";

    const spinner = document.createElement("div");
    spinner.style.cssText = "width:42px;height:42px;border:3px solid var(--border);border-top:3px solid var(--primary, #005fa9);border-radius:50%;margin:0 auto 1.2rem auto;animation:spin 0.8s linear 60;";

    const titleEl = document.createElement("h3");
    titleEl.id = "directo-spinner-title";
    titleEl.style.cssText = "margin:0 0 0.4rem 0;font-size:1.15rem;color:var(--ink);";
    titleEl.textContent = titulo;

    const subEl = document.createElement("p");
    subEl.id = "directo-spinner-sub";
    subEl.style.cssText = "margin:0;font-size:0.88rem;color:var(--ink-muted);line-height:1.5;";
    subEl.textContent = subtitulo;

    const barContainer = document.createElement("div");
    barContainer.style.cssText = "margin-top:1.2rem;height:5px;background:var(--surface-sunken, #eee);border-radius:3px;overflow:hidden;";

    const bar = document.createElement("div");
    bar.id = "directo-spinner-bar";
    bar.style.cssText = `width:${progreso || 15}%;height:100%;background:var(--primary, #005fa9);transition:width 0.4s ease;`;
    barContainer.appendChild(bar);

    card.append(spinner, titleEl, subEl, barContainer);
    directoPlaceholder.appendChild(card);
  }

  async function checkDirectoStatus() {
    const chip = $("#chip-servidor-directo");
    const text = $("#text-servidor-directo");
    const btnStart = $("#btn-arrancar-directo-head");
    const btnStop = $("#btn-apagar-directo-head");
    if (!chip && !text) return;

    let emisionOk = false;
    let panelOk = false;

    try {
      const res = await fetch("http://127.0.0.1:8790/api/estado", { cache: "no-store" });
      if (res.ok) emisionOk = true;
    } catch (_) {}

    try {
      const resPanel = await fetch("http://127.0.0.1:7979/api/panel/streaming", { method: "GET", cache: "no-store" }).catch(() => null);
      if (resPanel && (resPanel.ok || resPanel.status === 401 || resPanel.status === 403 || resPanel.type === "opaque")) {
        panelOk = true;
      }
    } catch (_) {}

    if (emisionOk && panelOk) {
      if (chip) chip.className = "status-chip chip-active";
      if (text) text.textContent = ":7979 / :8790 Activo";
      if (btnStart) btnStart.style.display = "none";
      if (btnStop) btnStop.style.display = "inline-flex";
      directoArrancando = false;
      if (directoPlaceholder) directoPlaceholder.style.display = "none";
      if (directoFrame) {
        directoFrame.style.display = "block";
        if (!directoFrame.src || directoFrame.src.includes("about:blank") || directoFrame.src === window.location.href) {
          directoFrame.src = directoUrlActiva;
        }
      }
      return;
    }

    // Si hay un arranque activo con spinner en pantalla, no sobrescribir la tarjeta
    if (directoArrancando) {
      if (chip) chip.className = "status-chip chip-idle";
      if (text) {
        text.textContent = emisionOk ? ":8790 Activo · :7979 Arrancando…" : (panelOk ? ":7979 Activo · :8790 Arrancando…" : "Arrancando servicios…");
      }
      return;
    }

    if (directoFrame) {
      directoFrame.style.display = "none";
      directoFrame.src = "about:blank";
    }

    if (emisionOk && !panelOk) {
      if (chip) chip.className = "status-chip chip-idle";
      if (text) text.textContent = ":8790 Activo · :7979 Parado";
      if (btnStart) {
        btnStart.style.display = "inline-flex";
        btnStart.textContent = "▶ Arrancar Panel (:7979)";
      }
      if (btnStop) btnStop.style.display = "inline-flex";
      renderDirectoPlaceholderCard({
        icono: "⚙",
        titulo: "Centro :8790 activo · Cockpit :7979 detenido",
        subtitulo: "El centro de emisión está activo pero el panel de control y la pizarra (:7979) están apagados.",
        botonTexto: "▶ Arrancar Panel (:7979)",
        botonColor: "#0284c7",
        accion: () => arrancarDirectoConConfirmacion(null, false, "panel"),
      });
    } else if (!emisionOk && panelOk) {
      if (chip) chip.className = "status-chip chip-idle";
      if (text) text.textContent = ":7979 Activo · :8790 Parado";
      if (btnStart) {
        btnStart.style.display = "inline-flex";
        btnStart.textContent = "▶ Arrancar Centro (:8790)";
      }
      if (btnStop) btnStop.style.display = "inline-flex";
      renderDirectoPlaceholderCard({
        icono: "⚙",
        titulo: "Cockpit :7979 activo · Centro :8790 detenido",
        subtitulo: "El panel y pizarra están disponibles pero el centro de emisión RTMP (:8790) está apagado.",
        botonTexto: "▶ Arrancar Centro (:8790)",
        botonColor: "#0284c7",
        accion: () => arrancarDirectoConConfirmacion(null, false, "centro"),
      });
    } else {
      if (chip) chip.className = "status-chip chip-idle";
      if (text) text.textContent = ":7979 / :8790 Detenido";
      if (btnStart) btnStart.style.display = "none";
      if (btnStop) btnStop.style.display = "none";
      renderDirectoPlaceholderCard({
        icono: "▶",
        titulo: "El centro de directo está apagado",
        subtitulo: "Inicia el servicio para activar la pizarra táctil, el chat interactivo y las fuentes de OBS.",
        botonTexto: "▶ Arrancar Centro de Directo",
        botonColor: "#2e7d32",
        accion: () => {
          const btnSidebar = $("#btn-arrancar-directo");
          arrancarDirectoConConfirmacion(btnSidebar, true);
        },
      });
    }
  }

  async function arrancarDirectoConConfirmacion(btn, pedirConfirmacion = true, modulo = "") {
    if (pedirConfirmacion) {
      const nombre = modulo === "panel" ? "el panel (:7979)" : (modulo === "centro" ? "el centro de emisión (:8790)" : "el centro de directo (:7979 / :8790)");
      const seguro = window.confirm(`¿Arrancar ${nombre} ahora?`);
      if (!seguro) return;
    }

    directoArrancando = true;

    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ Arrancando…";
    }

    renderDirectoSpinnerCard(
      "Arrancando ApliArte Directo…",
      "Lanzando procesos y esperando disponibilidad en :7979 y :8790…",
      10,
    );

    try {
      let token = String((office && office.actionToken) || window.Oficina?.office?.actionToken || "");
      if (!token) {
        try {
          const res = await fetch("/api/tasks", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            token = String(data?.office?.actionToken || "");
          }
        } catch (_) {}
      }

      const cmd = modulo
        ? `dart run bin/trabajo.dart erbolamm directo on ${modulo}`
        : "dart run bin/trabajo.dart erbolamm directo on --faltantes";

      await fetch("/api/terminals/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ErBolamm-Action": token,
        },
        body: JSON.stringify({
          command: cmd,
          background: true,
        }),
      });

      // Validar códigos HTTP y disponibilidad real en bucle con suficiente margen (25s)
      let verificado = false;
      const totalIntentos = 25;
      for (let intento = 0; intento < totalIntentos; intento++) {
        await new Promise((r) => setTimeout(r, 1000));
        let emisionOk = false;
        let panelOk = false;
        try {
          const res = await fetch("http://127.0.0.1:8790/api/estado", { cache: "no-store" });
          if (res.ok) emisionOk = true;
        } catch (_) {}
        try {
          const resPanel = await fetch("http://127.0.0.1:7979/api/panel/streaming", { method: "GET", cache: "no-store" });
          if (resPanel && (resPanel.ok || resPanel.status === 401 || resPanel.status === 403 || resPanel.type === "opaque")) {
            panelOk = true;
          }
        } catch (_) {}

        const progresoActual = Math.min(95, 10 + Math.round(((intento + 1) / totalIntentos) * 85));
        const bar = document.getElementById("directo-spinner-bar");
        const sub = document.getElementById("directo-spinner-sub");
        if (bar) bar.style.width = `${progresoActual}%`;

        if (emisionOk && !panelOk) {
          if (sub) sub.textContent = `Centro :8790 listo. Levantando panel y pizarra :7979… (${intento + 1}/${totalIntentos}s)`;
        } else if (!emisionOk && panelOk) {
          if (sub) sub.textContent = `Panel :7979 listo. Levantando centro de emisión :8790… (${intento + 1}/${totalIntentos}s)`;
        } else if (!emisionOk && !panelOk) {
          if (sub) sub.textContent = `Iniciando servidores locales… (${intento + 1}/${totalIntentos}s)`;
        }

        if (emisionOk && panelOk) {
          verificado = true;
          if (sub) sub.textContent = "¡Servicios listos! Cargando vista…";
          if (bar) bar.style.width = "100%";
          await new Promise((r) => setTimeout(r, 400));
          break;
        }
      }

      directoArrancando = false;

      if (verificado) {
        if (directoFrame) {
          directoFrame.src = directoUrlActiva;
          directoFrame.style.display = "block";
        }
        if (directoPlaceholder) {
          directoPlaceholder.style.display = "none";
        }
      } else {
        // Comprobar estado final para ofrecer botón de reintento quirúrgico
        let finalEmision = false;
        let finalPanel = false;
        try {
          const r1 = await fetch("http://127.0.0.1:8790/api/estado", { cache: "no-store" });
          if (r1.ok) finalEmision = true;
        } catch (_) {}
        try {
          const r2 = await fetch("http://127.0.0.1:7979/api/panel/streaming", { cache: "no-store" });
          if (r2 && (r2.ok || r2.status === 401 || r2.status === 403 || r2.type === "opaque")) finalPanel = true;
        } catch (_) {}

        if (finalEmision && !finalPanel) {
          renderDirectoPlaceholderCard({
            icono: "⏳",
            titulo: "Centro :8790 activo · Cockpit :7979 no respondió",
            subtitulo: "La emisión está funcionando, pero el panel (:7979) no respondió a tiempo tras 25 segundos.",
            botonTexto: "▶ Reintentar arranque de Panel (:7979)",
            botonColor: "#0284c7",
            accion: () => arrancarDirectoConConfirmacion(null, false, "panel"),
          });
        } else if (!finalEmision && finalPanel) {
          renderDirectoPlaceholderCard({
            icono: "⏳",
            titulo: "Cockpit :7979 activo · Centro :8790 no respondió",
            subtitulo: "El panel está activo, pero el centro de emisión (:8790) no respondió a tiempo tras 25 segundos.",
            botonTexto: "▶ Reintentar arranque de Centro (:8790)",
            botonColor: "#0284c7",
            accion: () => arrancarDirectoConConfirmacion(null, false, "centro"),
          });
        } else {
          renderDirectoPlaceholderCard({
            icono: "⚠",
            titulo: "El arranque tardó más de lo esperado",
            subtitulo: "Los servicios en :7979 y :8790 no respondieron tras 25 segundos. Puedes reintentar o verificar la terminal.",
            botonTexto: "↻ Reintentar arranque completo",
            botonColor: "#2e7d32",
            accion: () => arrancarDirectoConConfirmacion(null, false),
          });
        }
      }
    } catch (e) {
      console.error("Error arrancando directo:", e);
      directoArrancando = false;
      renderDirectoPlaceholderCard({
        icono: "❌",
        titulo: "Error al comunicar con la Oficina",
        subtitulo: String(e.message || e),
        botonTexto: "↻ Reintentar",
        botonColor: "#dc2626",
        accion: () => arrancarDirectoConConfirmacion(null, false),
      });
    } finally {
      if (btn) {
        btn.disabled = false;
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "▶";
        if (btn.id === "btn-arrancar-directo") {
          icon.className = "arrancar-icon";
          const label = document.createElement("span");
          label.textContent = "Arrancar panel";
          btn.replaceChildren(icon, label);
        } else {
          const label = document.createTextNode(" Arrancar Directo");
          btn.replaceChildren(icon, label);
        }
      }
      checkDirectoStatus();
    }
  }

  // ── Verified directo stop ──────────────────────────────────────────────
  // The stop command's success is not proof: the backend state is re-read
  // with `erbolamm directo estado` (ports 7979, 8790 and 1935 on the Mac).
  function parseDirectoEstado(stdout) {
    const text = String(stdout || "");
    if (/ApliArte Directo parado/.test(text)) return { state: "stopped", livePorts: [] };
    const livePorts = [];
    const portPattern = /\(:(\d{2,5})\):\s*🟢/gu;
    let match;
    while ((match = portPattern.exec(text)) !== null) livePorts.push(Number(match[1]));
    if (livePorts.length > 0 || /ApliArte Directo activo/.test(text)) {
      return { state: "running", livePorts };
    }
    return { state: "unknown", livePorts: [] };
  }

  async function runOfficeCommand(fetchImpl, token, command, targetOs) {
    let res;
    try {
      const payload = { command, background: false };
      if (targetOs) payload.os = targetOs;
      res = await fetchImpl("/api/terminals/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ErBolamm-Action": token,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return { networkError: true, error };
    }
    let data = null;
    try {
      data = await res.json();
    } catch (_) {}
    return { httpStatus: res.status, data };
  }

  async function apagarDirectoVerificado(fetchImpl, token, options) {
    const opts = options || {};
    const attempts = opts.attempts || 3;
    const delayMs = opts.delayMs == null ? 1500 : opts.delayMs;
    const sleep = opts.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));

    const stop = await runOfficeCommand(fetchImpl, token, "dart run bin/trabajo.dart erbolamm directo off");
    if (stop.networkError) {
      return {
        state: "unknown",
        livePorts: [],
        message: "No se pudo contactar con la Oficina: no se sabe si el centro de directo se ha apagado.",
      };
    }
    if (stop.httpStatus < 200 || stop.httpStatus >= 300) {
      return {
        state: "failed",
        livePorts: [],
        message: `La Oficina rechazó la orden de apagado (HTTP ${stop.httpStatus}). El directo no se ha tocado.`,
      };
    }
    const data = stop.data || {};
    const exitCode = typeof data.exitCode === "number" ? data.exitCode : null;
    if (data.ok === false || exitCode !== 0) {
      const detail = String(data.stderr || data.error || "").trim();
      return {
        state: "failed",
        livePorts: [],
        message: `La orden de apagado terminó con error (código ${exitCode === null ? "desconocido" : exitCode})${detail ? ": " + detail : ""}.`,
      };
    }

    let last = { state: "unknown", livePorts: [] };
    for (let i = 0; i < attempts; i += 1) {
      if (i > 0) await sleep(delayMs);
      const check = await runOfficeCommand(fetchImpl, token, "dart run bin/trabajo.dart erbolamm directo estado");
      const valid = !check.networkError && check.httpStatus >= 200 && check.httpStatus < 300 &&
        check.data && check.data.exitCode === 0;
      last = valid ? parseDirectoEstado(check.data.stdout) : { state: "unknown", livePorts: [] };
      if (last.state === "stopped") break;
    }

    if (last.state === "stopped") {
      return { state: "stopped", livePorts: [], message: "Centro de directo apagado y comprobado: los puertos 7979, 8790 y 1935 están libres." };
    }
    if (last.state === "running") {
      const ports = last.livePorts.length ? last.livePorts.map((port) => ":" + port).join(", ") : "el centro de emisión";
      return { state: "running", livePorts: last.livePorts, message: `El directo sigue en marcha tras la orden de apagado (activos: ${ports}).` };
    }
    return {
      state: "unknown",
      livePorts: [],
      message: "La orden de apagado se ejecutó, pero no se pudo comprobar el estado del directo. Revisa con «erbolamm directo estado».",
    };
  }

  function mostrarAvisoDirecto(btn, result) {
    const host = (btn && btn.parentElement) || document.body;
    let aviso = document.getElementById("directo-apagado-aviso");
    if (!aviso) {
      aviso = document.createElement("p");
      aviso.id = "directo-apagado-aviso";
      aviso.setAttribute("role", "status");
      aviso.setAttribute("aria-live", "polite");
      host.appendChild(aviso);
    }
    aviso.dataset.state = result.state;
    aviso.style.color = result.state === "stopped" ? "" : "var(--danger, #dc2626)";
    aviso.textContent = result.message;
  }

  async function apagarDirectoConConfirmacion(btn) {
    const seguro = window.confirm("¿Estás seguro de que quieres apagar el centro de directo?");
    if (!seguro) return;

    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ Apagando…";
    }

    try {
      let token = String((office && office.actionToken) || window.Oficina?.office?.actionToken || "");
      if (!token) {
        try {
          const res = await fetch("/api/tasks", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            token = String(data?.office?.actionToken || "");
          }
        } catch (_) {}
      }

      const result = await apagarDirectoVerificado(fetch, token);
      mostrarAvisoDirecto(btn, result);
      // Only a verified stop is silent; anything else needs Javier's eyes.
      if (result.state !== "stopped") alert(result.message);
    } catch (e) {
      console.error("Error apagando directo:", e);
      const result = {
        state: "unknown",
        message: "No se pudo comprobar si el centro de directo se ha apagado.",
      };
      mostrarAvisoDirecto(btn, result);
      alert(result.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "⏻";
        if (btn.id === "btn-apagar-directo") {
          icon.className = "apagar-icon";
          const label = document.createElement("span");
          label.textContent = "Apagar panel";
          btn.replaceChildren(icon, label);
        } else {
          const label = document.createTextNode(" Apagar Directo");
          btn.replaceChildren(icon, label);
        }
      }
      if (directoFrame) {
        directoFrame.src = "about:blank";
        directoFrame.style.display = "none";
      }
      if (directoPlaceholder) {
        directoPlaceholder.style.display = "flex";
      }
      checkDirectoStatus();
    }
  }

  const btnArrancarDirecto = $("#btn-arrancar-directo");
  if (btnArrancarDirecto) {
    btnArrancarDirecto.addEventListener("click", () => arrancarDirectoConConfirmacion(btnArrancarDirecto));
  }

  const btnArrancarDirectoHead = $("#btn-arrancar-directo-head");
  if (btnArrancarDirectoHead) {
    btnArrancarDirectoHead.addEventListener("click", () => arrancarDirectoConConfirmacion(btnArrancarDirectoHead));
  }

  const btnApagarDirecto = $("#btn-apagar-directo");
  if (btnApagarDirecto) {
    btnApagarDirecto.addEventListener("click", () => apagarDirectoConConfirmacion(btnApagarDirecto));
  }

  const btnApagarDirectoHead = $("#btn-apagar-directo-head");
  if (btnApagarDirectoHead) {
    btnApagarDirectoHead.addEventListener("click", () => apagarDirectoConConfirmacion(btnApagarDirectoHead));
  }

  if ($("#chip-servidor-directo")) {
    checkDirectoStatus();
    setInterval(checkDirectoStatus, 5000);
  }

  // Enviar al buzón (presente en panel.html y /vista/buzon).
  const inboxForm = $("#inbox-form");
  const inboxText = $("#inbox-text");
  const BUZON_DRAFT_KEY = "erbolamm-draft-buzon-text";

  if (inboxText) {
    try {
      const draft = localStorage.getItem(BUZON_DRAFT_KEY);
      if (draft && !inboxText.value) {
        inboxText.value = draft;
      }
      inboxText.addEventListener("input", () => {
        try {
          localStorage.setItem(BUZON_DRAFT_KEY, inboxText.value);
        } catch (_) {}
      });
    } catch (_) {}
  }

  if (inboxForm) {
    inboxForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const inboxStatus = $("#inbox-status");
      const inboxSend = $("#inbox-send");
      const text = inboxText ? inboxText.value.trim() : "";
      if (!text) {
        if (inboxStatus)
          inboxStatus.textContent = "Escribe algo antes de enviar.";
        return;
      }
      inboxBusy = true;
      if (inboxSend) inboxSend.disabled = true;
      if (inboxStatus) inboxStatus.textContent = "Enviando…";
      try {
        const result = await inboxRequest("POST", text);
        if (inboxText) {
          inboxText.value = "";
          try { localStorage.removeItem(BUZON_DRAFT_KEY); } catch (_) {}
        }
        inboxBusy = false;
        lastInboxSignature = "";
        renderInbox(result);
        if (inboxStatus)
          inboxStatus.textContent =
            "Enviado. El orquestador lo leerá al empezar su turno.";
        const announcer = $("#announcer");
        if (announcer) announcer.textContent = "Nota enviada al buzón.";
      } catch (sendError) {
        if (inboxStatus)
          inboxStatus.textContent = `No se pudo enviar: ${sendError.message}`;
      } finally {
        inboxBusy = false;
        if (inboxSend) inboxSend.disabled = false;
      }
    });
  }

  // Marcar todos los informes como vistos (presente solo en /vista/informes).
  const markAllReports = $("#mark-all-reports");
  if (markAllReports) {
    markAllReports.addEventListener("click", () =>
      markReportsSeen([...currentReportIds], markAllReports),
    );
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });

  // Static HTML can be newer than a still-running Dart process. Do not leave
  // the user watching an endless loader when the 3D bundle cannot mount.
  // `#office-3d` hosts either the full plane (`.real-office`) or, in a
  // ficha popup window, just the TaskBrief dialog — either counts as mounted.
  const office3DHost = $("#office-3d");
  if (office3DHost) window.setTimeout(() => {
    if (office3DHost.children.length === 0) {
      office3DHost.setAttribute("role", "alert");
      office3DHost.textContent = "No se ha podido cargar el plano 3D. Si acabas de actualizar la oficina, reinicia el servicio local desde tu terminal y recarga esta página. El tablero sigue disponible; no se ha iniciado ningún agente.";
    }
  }, 5000);

  // Una sola inyeccion para todas las vistas: la i enlaza con la seccion
  // de esta ruta en /vista/como-funciona#<id>. El id es el ultimo segmento
  // de la ruta; la portada (/) usa «oficina».
  function guideSectionId(pathname) {
    let path = String(pathname || "/");
    const query = path.indexOf("?");
    if (query >= 0) path = path.slice(0, query);
    const hash = path.indexOf("#");
    if (hash >= 0) path = path.slice(0, hash);
    if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length) || "/";
    if (path.endsWith(".html")) path = path.slice(0, -5);
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    if (path === "" || path === "/") return "oficina";
    const parts = path.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "oficina";
  }

  function buildGuideInfoLink(sectionId, label) {
    const link = document.createElement("a");
    link.className = "guide-info";
    const tip = "Abre la sección " + label + " de la guía Cómo funciona";
    link.dataset.tip = tip;
    link.setAttribute("href", "/vista/como-funciona#" + sectionId);
    link.setAttribute("aria-label", "Cómo funciona: " + label);
    link.setAttribute("data-tip", tip);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "8");
    circle.setAttribute("cy", "8");
    circle.setAttribute("r", "6.25");
    circle.setAttribute("stroke", "currentColor");
    circle.setAttribute("stroke-width", "1.25");
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "path");
    stem.setAttribute("d", "M8 7.15v4.15");
    stem.setAttribute("stroke", "currentColor");
    stem.setAttribute("stroke-width", "1.25");
    stem.setAttribute("stroke-linecap", "round");
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", "8");
    dot.setAttribute("cy", "4.7");
    dot.setAttribute("r", "0.75");
    dot.setAttribute("fill", "currentColor");
    svg.appendChild(circle);
    svg.appendChild(stem);
    svg.appendChild(dot);
    link.appendChild(svg);
    return link;
  }

  function mountGuideInfoIcons() {
    if (document.querySelector("a.guide-info")) return;
    const sectionId = guideSectionId(window.location.pathname);
    let label = sectionId;
    for (const item of sideNavItems) {
      if (guideSectionId(item.href) === sectionId) {
        label = item.label;
        break;
      }
    }
    if (label === sectionId) {
      const heading = document.querySelector("h1");
      const text = heading && heading.textContent ? heading.textContent.trim() : "";
      if (text) label = text;
    }
    const link = buildGuideInfoLink(sectionId, label);
    const topbar = document.querySelector(".topbar");
    const header = document.querySelector("header");
    const host = topbar || header || document.body;
    const theme = host.querySelector("#theme-toggle, .theme-toggle");
    if (theme && theme.parentElement === host) host.insertBefore(link, theme);
    else host.appendChild(link);
    attachIconHelp(link);
    if (document.head && !document.getElementById("guide-info-style")) {
      const style = document.createElement("style");
      style.id = "guide-info-style";
      style.textContent = "a.guide-info{box-sizing:border-box;width:28px;height:28px;min-width:28px;min-height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid currentColor;border-radius:50%;color:inherit;text-decoration:none}a.guide-info:focus-visible{outline:2px solid #5ecef5;outline-offset:2px}a.guide-info svg{display:block}body>a.guide-info{position:fixed;top:8px;right:8px;z-index:40;background:var(--surface,#fff)}";
      document.head.appendChild(style);
    }
  }

  function initOfficeViewSelector() {
    const viewButtons = document.querySelectorAll(".view-mode-group .view-btn");
    if (!viewButtons.length) return;

    const getSavedMode = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const modo = urlParams.get("modo") || urlParams.get("view");
        if (modo === "2d" || modo === "diorama") return "diorama";
        if (modo === "3d") return "3d";
        if (modo === "radar") return "radar";
        return localStorage.getItem("erbolamm-office-view") || "3d";
      } catch (_) {
        return "3d";
      }
    };

    const updateActiveButtons = (mode) => {
      viewButtons.forEach((btn) => {
        const isActive = btn.dataset.view === mode;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      const popoutLink = $("#open-plano-popout");
      if (popoutLink) {
        popoutLink.href = mode === "radar" ? "/vista/radar" : "/vista/plano";
        popoutLink.title = mode === "radar"
          ? "Abrir radar elástico en ventana nueva"
          : "Abrir plano en ventana nueva";
      }
    };

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.view;
        if (mode) {
          try {
            localStorage.setItem("erbolamm-office-view", mode);
          } catch (_) {}
          updateActiveButtons(mode);
          if (window.Oficina3D && typeof window.Oficina3D.setViewMode === "function") {
            window.Oficina3D.setViewMode(mode);
          } else {
            window.dispatchEvent(new CustomEvent("erbolamm:set-view", { detail: mode }));
          }
        }
      });
    });

    window.addEventListener("erbolamm:view-changed", (e) => {
      if (e.detail) {
        updateActiveButtons(e.detail);
      }
    });

    updateActiveButtons(getSavedMode());
  }

  function initHeaderPlanoButtons() {
    const btnPlano3d = $("#btn-open-plano-3d");
    if (btnPlano3d) {
      btnPlano3d.addEventListener("click", () => {
        try {
          localStorage.setItem("erbolamm-office-view", "3d");
        } catch (_) {}
        if (window.Oficina3D && typeof window.Oficina3D.setViewMode === "function") {
          window.Oficina3D.setViewMode("3d");
        } else {
          window.dispatchEvent(new CustomEvent("erbolamm:set-view", { detail: "3d" }));
        }
      });
    }

    const btnPlano2d = $("#btn-open-plano-2d");
    if (btnPlano2d) {
      btnPlano2d.addEventListener("click", () => {
        try {
          localStorage.setItem("erbolamm-office-view", "diorama");
        } catch (_) {}
        if (window.Oficina3D && typeof window.Oficina3D.setViewMode === "function") {
          window.Oficina3D.setViewMode("diorama");
        } else {
          window.dispatchEvent(new CustomEvent("erbolamm:set-view", { detail: "diorama" }));
        }
      });
    }

    // Botón para abrir el plano en ventana nueva independiente
    const popoutLink = $("#open-plano-popout");
    if (popoutLink) {
      popoutLink.addEventListener("click", (e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          const targetUrl = popoutLink.getAttribute("href") || "/vista/plano";
          const width = 1100;
          const height = 800;
          const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
          const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
          const win = window.open(
            targetUrl,
            "erbolamm_plano_window",
            `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
          );
          if (!win || win.closed) {
            window.open(targetUrl, "_blank");
          } else {
            win.focus();
          }
        }
      });
    }
  }

  // ─── Pestañas de Secciones Principales (.panel-tabs) con persistencia en localStorage ───
  const TAB_STORAGE_KEY = "erbolamm-panel-active-tab";

  function initPanelTabs() {
    const tabsNav = $("#panel-tabs");
    if (!tabsNav) return;

    const tabButtons = tabsNav.querySelectorAll("button[data-tab]");
    if (!tabButtons.length) return;

    const sections = {
      tablero: $("#tablero"),
      recurrentes: $("#recurrentes-panel"),
      buzon: $("#office-tools-buzon"),
      agentes: $("#office-tools-agentes"),
    };

    function activateTab(targetId, persist = true) {
      if (!targetId) targetId = "tablero";
      // Si la sección no existe en este DOM, caer al tablero
      if (!sections[targetId] && sections.tablero) targetId = "tablero";

      tabButtons.forEach((btn) => {
        const isActive = btn.dataset.tab === targetId;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });

      for (const [id, el] of Object.entries(sections)) {
        if (!el) continue;
        if (id === targetId) {
          el.hidden = false;
          el.style.display = "";
        } else {
          el.hidden = true;
          el.style.display = "none";
        }
      }

      if (persist) {
        try {
          localStorage.setItem(TAB_STORAGE_KEY, targetId);
          if (window.location.hash !== "#" + targetId) {
            history.replaceState(null, "", "#" + targetId);
          }
        } catch (_) {}
      }

      // Si se activa recurrentes y hay lista, refrescar
      if (targetId === "recurrentes") {
        loadRecurrentes();
      }
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        activateTab(tabId, true);
      });
    });

    // Determinar pestaña inicial: 1. Hash en URL, 2. localStorage, 3. 'tablero'
    let initialTab = "tablero";
    const hash = window.location.hash.replace(/^#/, "");
    if (hash === "recurrentes" || hash === "recurrentes-panel") {
      initialTab = "recurrentes";
    } else if (hash === "buzon" || hash === "inbox") {
      initialTab = "buzon";
    } else if (hash === "agentes") {
      initialTab = "agentes";
    } else if (hash === "tablero") {
      initialTab = "tablero";
    } else {
      try {
        const saved = localStorage.getItem(TAB_STORAGE_KEY);
        if (saved && sections[saved]) {
          initialTab = saved;
        }
      } catch (_) {}
    }

    activateTab(initialTab, false);

    // Escuchar cambios de hash (ej. enlaces externos hacia #buzon o #recurrentes)
    window.addEventListener("hashchange", () => {
      const h = window.location.hash.replace(/^#/, "");
      if (h === "recurrentes" || h === "recurrentes-panel") activateTab("recurrentes", false);
      else if (h === "buzon" || h === "inbox") activateTab("buzon", false);
      else if (h === "agentes") activateTab("agentes", false);
      else if (h === "tablero") activateTab("tablero", false);
    });

    window.activatePanelTab = activateTab;
  }

  async function updateSystemTelemetry() {
    try {
      const res = await fetch("/api/sistema/metricas", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.almacenamiento || !data.recursos) return;

      const topbars = document.querySelectorAll(".topbar, #casita");
      if (!topbars || topbars.length === 0) return;

      const alm = data.almacenamiento;
      const rec = data.recursos;

      topbars.forEach((topbar) => {
        let container = topbar.querySelector("#system-telemetry-chips");
        if (!container) {
          container = document.createElement("div");
          container.id = "system-telemetry-chips";
          container.className = "system-telemetry-chips";
          const connection = topbar.querySelector(".connection");
          const brand = topbar.querySelector(".brand");
          if (connection && connection.nextSibling) {
            topbar.insertBefore(container, connection.nextSibling);
          } else if (brand && brand.nextSibling) {
            topbar.insertBefore(container, brand.nextSibling);
          } else {
            topbar.appendChild(container);
          }
        }

        container.replaceChildren();

        const showChipTip = (btn, text) => {
          if (!text) return;
          const box = getIconHelpBox();
          box.textContent = text;
          box.hidden = false;
          const zone = btn.getBoundingClientRect();
          const w = box.offsetWidth || 200;
          const h = box.offsetHeight || 40;
          const x = Math.max(8, Math.min(zone.left + zone.width / 2 - w / 2, window.innerWidth - w - 8));
          let y = zone.bottom + 6;
          if (y + h > window.innerHeight - 8) y = Math.max(8, zone.top - h - 6);
          box.style.left = `${Math.round(x)}px`;
          box.style.top = `${Math.round(y)}px`;
          if (iconHelpTimer) window.clearTimeout(iconHelpTimer);
          iconHelpTimer = window.setTimeout(hideIconHelp, 4500);
        };

        const chipAlm = document.createElement("button");
        chipAlm.type = "button";
        chipAlm.className =
          "system-chip chip-almacenamiento" +
          (alm.porcentaje >= 90 ? " danger" : alm.porcentaje >= 80 ? " warn" : "");
        chipAlm.title = alm.detalles || `Almacenamiento: ${alm.porcentaje}%`;
        chipAlm.setAttribute("aria-label", alm.detalles || `Almacenamiento: ${alm.porcentaje}%`);
        chipAlm.textContent = alm.texto || `A${alm.porcentaje}%`;
        chipAlm.addEventListener("click", (e) => {
          e.stopPropagation();
          showChipTip(chipAlm, alm.detalles);
        });

        const chipRec = document.createElement("button");
        chipRec.type = "button";
        chipRec.className =
          "system-chip chip-recursos" +
          (rec.porcentaje >= 85 ? " danger" : rec.porcentaje >= 75 ? " warn" : "");
        chipRec.title = rec.detalles || `Recursos RAM: ${rec.porcentaje}%`;
        chipRec.setAttribute("aria-label", rec.detalles || `Recursos RAM: ${rec.porcentaje}%`);
        chipRec.textContent = rec.texto || `R${rec.porcentaje}%`;
        chipRec.addEventListener("click", (e) => {
          e.stopPropagation();
          showChipTip(chipRec, rec.detalles);
        });

        container.append(chipAlm, chipRec);
      });
    } catch (_) {}
  }

  function initSystemTelemetry() {
    updateSystemTelemetry();
    window.setInterval(updateSystemTelemetry, 15000);
  }

  function normalizarNavegacionSoberana() {
    const enVista = window.location.pathname.includes("/vista/");
    document.querySelectorAll(".side-nav a.nav-card, a.panel-action-btn, #btn-go-aplichat").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href === "/" || href === "/index.html") {
        a.href = enVista ? "../index.html" : "index.html";
      } else if (href.startsWith("/vista/")) {
        const partes = href.replace("/vista/", "").split("?");
        const slug = partes[0].split("#")[0];
        const query = href.includes("?") ? "?" + href.split("?")[1] : (href.includes("#") ? "#" + href.split("#")[1] : "");
        const nombreArchivo = slug.endsWith(".html") ? slug : `${slug}.html`;
        a.href = enVista ? `${nombreArchivo}${query}` : `vista/${nombreArchivo}${query}`;
      } else if (href === "/resenas" || href === "/vista/resenas") {
        a.href = enVista ? "resenas.html" : "vista/resenas.html";
      }
    });
  }

  normalizarNavegacionSoberana();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", normalizarNavegacionSoberana);
  }

  initOfficeViewSelector();
  initHeaderPlanoButtons();
  initPanelTabs();
  mountGuideInfoIcons();
  initSystemTelemetry();

  refresh();
  window.setInterval(refresh, 5000);

  // Superficie pública mínima para inspecciones y tests headless.
  window.Oficina = Object.freeze({
    fallbackAgents,
    roleNames,
    roleColors,
    stateDirectories,
    stateLabels,
    refresh,
    renderReports,
    renderRoutines,
    renderBoard,
    createTaskCard,
    renderAgents,
    renderLimits,
    renderCosts,
    renderNeeds,
    openTaskFicha,
    submitReportReply,
    markReportsSeen,
    renderInbox,
    inboxRequest,
    facturasFrameUrl,
    taskRequest,
    routineRequest,
    applyTheme,
    applySidebarMode,
    sideNav: Object.freeze(CANONICAL_SIDE_NAV.map((item) => Object.freeze({ ...item }))),
    lockedNav: LOCKED_NAV,
    hiddenNav: readHiddenNav,
    setNavHidden,
    get lastSnapshot() { return lastSnapshot; },
    get office() {
      return office;
    },
    get hasData() {
      return hasData;
    },
    get esModoLimpio() {
      return esModoLimpio;
    },
    get host() {
      return currentHost || window.__officeHost || null;
    },
  });
})();
