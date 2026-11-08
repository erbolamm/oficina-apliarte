// Reusable component: ordered list of short plain-language steps.
// Registers on window.OficinaComponentes.stepList. No network calls; DOM is built with createElement only.
(function (root) {
  "use strict";

  var ns = (root.OficinaComponentes = root.OficinaComponentes || {});

  function buildItem(step, index) {
    if (!step || typeof step.titulo !== "string" || !step.titulo) {
      throw new TypeError("step-list: step " + index + " needs a non-empty titulo");
    }
    var item = document.createElement("li");
    item.className = "cz-step-list__item";

    var titulo = document.createElement("span");
    titulo.className = "cz-step-list__titulo";
    titulo.textContent = step.titulo;
    item.appendChild(titulo);

    if (typeof step.detalle === "string" && step.detalle) {
      var detalle = document.createElement("span");
      detalle.className = "cz-step-list__detalle";
      detalle.textContent = step.detalle;
      item.appendChild(detalle);
    }
    return item;
  }

  // props: { steps: [{ titulo, detalle? }] }
  function render(container, props) {
    if (!props || !Array.isArray(props.steps) || props.steps.length === 0) {
      throw new TypeError("step-list: props.steps must be a non-empty array");
    }
    var list = document.createElement("ol");
    list.className = "cz-step-list";
    props.steps.forEach(function (step, index) {
      list.appendChild(buildItem(step, index + 1));
    });

    if (container) container.appendChild(list);
    return list;
  }

  ns.stepList = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
