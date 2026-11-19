// Reusable component: shows a REAL screenshot of a view, or the text
// "captura pendiente". It never renders placeholder or invented images.
// An img is produced only when the capture carries { archivo, fecha, origen }
// with origen "skill" or "javier" and archivo under /capturas/.
// Registers on window.OficinaComponentes.capturaReal. No network calls; DOM is built with createElement only.
(function (root) {
  "use strict";

  var ns = (root.OficinaComponentes = root.OficinaComponentes || {});
  var ORIGENES = ["skill", "javier"];
  // Only plain image files under /capturas/, no dots except the extension,
  // so ".." segments and absolute or protocol-relative URLs cannot match.
  var ARCHIVO_PATTERN = /^\/capturas\/[A-Za-z0-9][A-Za-z0-9_-]*\.(png|jpe?g|webp)$/;

  function isValidCaptura(captura) {
    return (
      !!captura &&
      typeof captura.archivo === "string" &&
      ARCHIVO_PATTERN.test(captura.archivo) &&
      typeof captura.fecha === "string" &&
      captura.fecha.length > 0 &&
      ORIGENES.indexOf(captura.origen) !== -1
    );
  }

  function buildPendiente(box) {
    box.className = "cz-captura-real cz-captura-real--pendiente";
    box.textContent = "captura pendiente";
    return box;
  }

  function buildImagen(box, captura, alt) {
    box.className = "cz-captura-real";
    var img = document.createElement("img");
    img.className = "cz-captura-real__img";
    img.setAttribute("src", captura.archivo);
    img.setAttribute("alt", alt);
    img.setAttribute("data-origen", captura.origen);
    img.setAttribute("data-fecha", captura.fecha);
    img.setAttribute("loading", "lazy");
    box.appendChild(img);
    return box;
  }

  // props: { archivo, fecha, origen, alt? }
  function render(container, props) {
    var box = document.createElement("figure");
    if (!isValidCaptura(props)) {
      buildPendiente(box);
    } else {
      var alt = typeof props.alt === "string" && props.alt ? props.alt : "Captura real de la vista";
      buildImagen(box, props, alt);
    }
    if (container) container.appendChild(box);
    return box;
  }

  ns.capturaReal = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
