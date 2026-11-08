// Reusable component: list of pass/fail checks with a summary line.
// Used to show why an artifact (for example a Shorts video) was rejected.
// Registers on window.OficinaComponentes.validationReport. No network calls; DOM is built with createElement only.
(function (root) {
  "use strict";

  var ns = (root.OficinaComponentes = root.OficinaComponentes || {});

  function buildItem(check, index) {
    if (!check || typeof check.nombre !== "string" || !check.nombre) {
      throw new TypeError("validation-report: check " + index + " needs a non-empty nombre");
    }
    var ok = check.ok === true;
    var item = document.createElement("li");
    item.className = "cz-validation-report__item";
    item.setAttribute("data-ok", ok ? "true" : "false");

    var estado = document.createElement("span");
    estado.className = "cz-validation-report__estado";
    estado.textContent = ok ? "OK" : "FALLO";
    item.appendChild(estado);

    var nombre = document.createElement("span");
    nombre.className = "cz-validation-report__nombre";
    nombre.textContent = check.nombre;
    item.appendChild(nombre);

    if (typeof check.detalle === "string" && check.detalle) {
      var detalle = document.createElement("span");
      detalle.className = "cz-validation-report__detalle";
      detalle.textContent = check.detalle;
      item.appendChild(detalle);
    }
    return item;
  }

  function summaryText(total, fallos) {
    if (fallos === 0) {
      return "Todas las comprobaciones pasaron (" + total + " de " + total + ").";
    }
    return "Comprobaciones fallidas: " + fallos + " de " + total + ".";
  }

  // props: { checks: [{ nombre, ok, detalle? }] }
  function render(container, props) {
    if (!props || !Array.isArray(props.checks)) {
      throw new TypeError("validation-report: props.checks must be an array");
    }
    var fallos = props.checks.filter(function (check) {
      return !(check && check.ok === true);
    }).length;

    var box = document.createElement("section");
    box.className = "cz-validation-report";
    box.setAttribute("data-fallos", String(fallos));

    var resumen = document.createElement("p");
    resumen.className = "cz-validation-report__resumen";
    resumen.setAttribute("data-estado", fallos === 0 ? "ok" : "error");
    resumen.textContent = summaryText(props.checks.length, fallos);
    box.appendChild(resumen);

    var list = document.createElement("ul");
    list.className = "cz-validation-report__lista";
    props.checks.forEach(function (check, index) {
      list.appendChild(buildItem(check, index + 1));
    });
    box.appendChild(list);

    if (container) container.appendChild(box);
    return box;
  }

  ns.validationReport = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
