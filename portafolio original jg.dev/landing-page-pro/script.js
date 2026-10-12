/* Landing Page Pro | Comportamiento
   1. Cabecera que cambia al hacer scroll
   2. Menú móvil
   3. Botones de plan que rellenan el formulario
   4. Validación del formulario de contacto */

(function () {
  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");

  /* 1. La cabecera se vuelve sólida cuando bajamos de la portada */
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* 2. Menú móvil: abrir y cerrar */
  function setMenu(open) {
    menu.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }
  burger.addEventListener("click", function () {
    setMenu(!menu.classList.contains("open"));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  /* 3. Al elegir un plan, el formulario ya lo trae seleccionado */
  var planSelect = document.getElementById("plan");
  document.querySelectorAll("[data-plan]").forEach(function (link) {
    link.addEventListener("click", function () {
      planSelect.value = link.getAttribute("data-plan");
    });
  });

  /* 4. Validación del formulario */
  var form = document.getElementById("form");
  var success = document.getElementById("success");
  var successText = document.getElementById("success-text");
  var again = document.getElementById("again");

  var rules = {
    nombre: function (v) { return v.trim().length >= 2 ? "" : "Escribe tu nombre."; },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Escribe un correo válido, por ejemplo nombre@correo.com.";
    },
    mensaje: function (v) { return v.trim().length >= 10 ? "" : "Cuéntanos un poco más (mínimo 10 caracteres)."; }
  };

  function check(name) {
    var input = form.elements[name];
    var message = rules[name](input.value);
    document.getElementById("err-" + name).textContent = message;
    input.classList.toggle("invalid", message !== "");
    input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
    return message === "";
  }

  Object.keys(rules).forEach(function (name) {
    form.elements[name].addEventListener("blur", function () { check(name); });
    form.elements[name].addEventListener("input", function () {
      if (form.elements[name].classList.contains("invalid")) check(name);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var results = Object.keys(rules).map(check);
    if (results.indexOf(false) !== -1) {
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    var name = form.elements.nombre.value.trim().split(" ")[0];
    successText.textContent = "Gracias, " + name + ". Esto es una demostración, así que tu mensaje no se ha enviado a ningún sitio.";
    form.hidden = true;
    success.hidden = false;
  });

  again.addEventListener("click", function () {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    form.elements.nombre.focus();
  });
})();
