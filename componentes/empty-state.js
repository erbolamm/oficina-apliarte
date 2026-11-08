// Reusable component: message plus optional hint for a view without data.
// Registers on window.OficinaComponentes.emptyState. No network calls; DOM is built with createElement only.
(function (root) {
  "use strict";

  var ns = (root.OficinaComponentes = root.OficinaComponentes || {});

  function appendParagraph(parent, className, text) {
    var p = document.createElement("p");
    p.className = className;
    p.textContent = text;
    parent.appendChild(p);
    return p;
  }

  // props: { mensaje: string, pista?: string }
  function render(container, props) {
    if (!props || typeof props.mensaje !== "string" || !props.mensaje) {
      throw new TypeError("empty-state: props.mensaje must be a non-empty string");
    }
    var box = document.createElement("div");
    box.className = "cz-empty-state";
    box.setAttribute("role", "status");

    appendParagraph(box, "cz-empty-state__mensaje", props.mensaje);
    if (typeof props.pista === "string" && props.pista) {
      appendParagraph(box, "cz-empty-state__pista", props.pista);
    }

    if (container) container.appendChild(box);
    return box;
  }

  ns.emptyState = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
