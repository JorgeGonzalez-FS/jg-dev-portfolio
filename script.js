/* JG Dev | Comportamiento de la página
   Tres funciones: cambiar tema, abrir el menú móvil y
   resaltar en el menú la sección que se está viendo. */

(function () {
  var root = document.documentElement;

  /* Tema claro / oscuro */
  try {
    var saved = localStorage.getItem("jg-theme");
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}
  document.getElementById("theme-toggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("jg-theme", next); } catch (e) {}
  });

  /* Menú móvil */
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("menu");
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* Enlace activo según la sección visible */
  var links = {};
  menu.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var ids = Object.keys(links);
  var targets = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function setActive(id) {
    ids.forEach(function (k) { links[k].removeAttribute("aria-current"); });
    if (links[id]) links[id].setAttribute("aria-current", "true");
  }
  setActive("inicio");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }
})();
