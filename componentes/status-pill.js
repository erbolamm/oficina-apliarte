// Reusable component: small status label for ok | warn | error | info.
// Registers on window.OficinaComponentes.statusPill. No network calls; DOM is built with createElement only.
(function (root) {
  "use strict";

  var ns = (root.OficinaComponentes = root.OficinaComponentes || {});
  var ETIQUETAS = { ok: "Correcto", warn: "Aviso", error: "Error", info: "Info" };

  // props: { estado: "ok" | "warn" | "error" | "info", texto?: string }
  function render(container, props) {
    if (!props || !Object.prototype.hasOwnProperty.call(ETIQUETAS, props.estado)) {
      throw new TypeError("status-pill: props.estado must be ok, warn, error or info");
    }
    var pill = document.createElement("span");
    pill.className = "cz-status-pill cz-status-pill--" + props.estado;
    pill.setAttribute("data-estado", props.estado);
    pill.textContent = typeof props.texto === "string" && props.texto ? props.texto : ETIQUETAS[props.estado];

    if (container) container.appendChild(pill);
    return pill;
  }

  ns.statusPill = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
