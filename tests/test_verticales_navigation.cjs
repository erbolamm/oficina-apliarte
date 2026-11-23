const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const read = (file) => readFileSync(path.join(__dirname, "..", file), "utf8");
const autonomos = "#verticales-autonomos";
const hosteleria = "#verticales-hosteleria";

class Element extends EventTarget {
  constructor() {
    super();
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.classList = { toggle() {} };
  }
  get firstChild() { return this.children[0]; }
  appendChild(child) { this.children.push(child); }
  removeChild(child) { this.children.splice(this.children.indexOf(child), 1); }
  querySelectorAll() { return this.children; }
  getAttribute() { return this.href; }
  setAttribute() {}
  removeAttribute() {}
}

for (const base of ["", "/oficina-apliarte"]) {
  test(`restores deep links and history without duplicate navigation (${base || "/"})`, () => {
    const shell = read("panel-shell.js");
    const location = new URL("https://office.test" + base + "/" + autonomos);
    const window = Object.assign(new EventTarget(), { location });
    const pushes = [];
    window.history = { pushState: (_, title, url) => { pushes.push(url); location.href = url; } };
    const nav = new Element();
    const frameWrites = [];
    const frame = new Element();
    frame.contentWindow = { location: { replace: (url) => frameWrites.push(url) } };
    Object.defineProperty(frame, "src", { set: (url) => frameWrites.push(url) });
    const ids = { "office-iframe": frame, "office-frame-view": new Element(), "office-native-view": new Element() };
    const document = {
      querySelector: (selector) => selector.endsWith(".side-nav") ? nav : null,
      querySelectorAll: () => nav.children,
      createElement: () => new Element(),
      getElementById: (id) => ids[id],
    };
    const context = {
      Event, CustomEvent: Event, URLSearchParams, window, document, OFICINA_BASE: base,
      isStaticMode: Boolean(base), esModoLimpio: false, readHiddenNav: () => [],
      sideNavItems: [{ href: "/", label: "Home" }, { href: "/vista/verticales", label: "Verticales" }],
      isMobileView: () => Boolean(base), closeDrawer() {}, syncBloggerNavBadge() {},
    };
    vm.runInNewContext(
      shell.slice(shell.indexOf("  const STATIC_VISTAS_CON_FICHA"), shell.indexOf("  const fallbackAgents")) +
      shell.slice(shell.indexOf("  // The shell owns session history"), shell.indexOf("  // ─── Aviso de propuesta")) +
      "\nsyncCanonicalSideNav();",
      context,
    );
    assert.deepEqual(pushes, [], "direct entry must not push history");
    const route = (hash) => (base ? base + "/vistas/verticales.html" : "/vista/verticales") + "?modo=limpio" + hash;
    assert.deepEqual(frameWrites, [route(autonomos)]);

    const dispatchTraversal = () => {
      window.dispatchEvent(new Event("popstate"));
      window.dispatchEvent(new Event("hashchange"));
    };
    dispatchTraversal();
    assert.deepEqual(frameWrites, [route(autonomos)]);
    location.hash = hosteleria;
    dispatchTraversal();
    location.hash = autonomos;
    dispatchTraversal();
    assert.deepEqual(pushes, [], "traversal must not push history");
    assert.deepEqual(frameWrites, [route(autonomos), route(hosteleria), route(autonomos)]);

    nav.children[0].dispatchEvent(new Event("click", { cancelable: true }));
    assert.deepEqual(pushes, [base + "/"]);
    assert.equal(frameWrites.at(-1), "about:blank");
    nav.children[1].dispatchEvent(new Event("click", { cancelable: true }));
    assert.equal(pushes.at(-1), base + "/?vista=verticales");
    assert.equal(frameWrites.at(-1), route(""));
  });
}

test("embedded focus is instant and does not repeat for the same card", () => {
  const view = read("vistas/verticales.html");
  const calls = [];
  let highlighted = false;
  const card = {
    classList: {
      add() { highlighted = true; },
      remove() { highlighted = false; },
    },
    setAttribute() {},
    removeAttribute() {},
    getBoundingClientRect: () => ({ top: 900, height: 100 }),
    scrollIntoView: (options) => calls.push(options.behavior),
    focus: (options) => calls.push(options.preventScroll),
  };
  const window = {
    location: { hash: autonomos }, parent: {}, scrollY: 0, innerHeight: 800,
    scrollTo: (options) => calls.push(options.behavior),
  };
  const document = {
    querySelectorAll: () => [card],
    querySelector: () => card,
  };
  vm.runInNewContext(
    view.slice(view.indexOf("      let focusedCard = null;"), view.indexOf('      window.addEventListener("hashchange"')) +
    "\nfocusVerticalFromHash(); focusVerticalFromHash(); window.location.hash = ''; focusVerticalFromHash();",
    { window, document, ID_BY_HASH: { "verticales-autonomos": "ejemplo-autonomo" }, activeCat: "Todas", query: "" },
  );
  assert.deepEqual(calls, ["instant", true]);
  assert.equal(highlighted, false);
});
