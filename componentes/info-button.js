// Reusable component: circled "i" link to the guide section of a module.
// Mirrors buildGuideInfoLink in tareas/panel-shell.js (same markup and semantics).
// Registers on window.OficinaComponentes.infoButton. No network calls; DOM is built with createElement only.
(function (root) {
  "use strict";

  var ns = (root.OficinaComponentes = root.OficinaComponentes || {});
  var SVG_NS = "http://www.w3.org/2000/svg";
  var ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

  function svgElement(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function buildIcon() {
    var svg = svgElement("svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");

    var ring = svgElement("circle");
    ring.setAttribute("cx", "8");
    ring.setAttribute("cy", "8");
    ring.setAttribute("r", "6.25");
    ring.setAttribute("stroke", "currentColor");
    ring.setAttribute("stroke-width", "1.25");

    var stem = svgElement("path");
    stem.setAttribute("d", "M8 7.15v4.15");
    stem.setAttribute("stroke", "currentColor");
    stem.setAttribute("stroke-width", "1.25");
    stem.setAttribute("stroke-linecap", "round");

    var dot = svgElement("circle");
    dot.setAttribute("cx", "8");
    dot.setAttribute("cy", "4.7");
    dot.setAttribute("r", "0.75");
    dot.setAttribute("fill", "currentColor");

    svg.appendChild(ring);
    svg.appendChild(stem);
    svg.appendChild(dot);
    return svg;
  }

  // props: { id: "skills", label: "Skills" }
  function render(container, props) {
    if (!props || typeof props.id !== "string" || !ID_PATTERN.test(props.id)) {
      throw new TypeError("info-button: props.id must be a lowercase anchor slug");
    }
    var label = typeof props.label === "string" && props.label ? props.label : props.id;
    var tip = "Abre la sección " + label + " de la guía Cómo funciona";

    var link = document.createElement("a");
    link.className = "cz-info-button";
    link.setAttribute("href", "/vista/como-funciona#" + props.id);
    link.setAttribute("aria-label", "Cómo funciona: " + label);
    link.setAttribute("data-tip", tip);
    link.appendChild(buildIcon());

    if (container) container.appendChild(link);
    return link;
  }

  ns.infoButton = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
