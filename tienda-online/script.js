/* AURORA Tienda Online | Lógica
   1. Catálogo de productos (datos de ejemplo)
   2. Ilustraciones SVG de cada producto
   3. Filtros, búsqueda y orden
   4. Carrito (se guarda en el navegador con localStorage)
   5. Panel del carrito, compra simulada y avisos */

/* ---------- 1. Datos ---------- */
const PRODUCTS = [
  { id: "one",     name: "Aurora One",           cat: "Auriculares", desc: "Over-ear con cancelación de ruido.",  price: 189, type: "over",    color: "#1b1f2a", accent: "#ff5a3c", tag: "Nuevo" },
  { id: "studio",  name: "Aurora Studio",        cat: "Auriculares", desc: "Sonido de estudio y 40 h de batería.", price: 249, type: "over",    color: "#c9ced8", accent: "#14171f" },
  { id: "air",     name: "Aurora Air",           cat: "Earbuds",     desc: "Ligeros, con estuche de carga.",       price: 99,  type: "buds",    color: "#f7f8fb", accent: "#3b4cff" },
  { id: "sport",   name: "Aurora Sport",         cat: "Earbuds",     desc: "Resistentes al sudor y al agua.",      price: 79,  type: "buds",    color: "#2d4bff", accent: "#ffffff", tag: "Oferta" },
  { id: "mini",    name: "Pulse Mini",           cat: "Altavoces",   desc: "Altavoz de bolsillo con 12 h de uso.", price: 59,  type: "speaker", color: "#ff5a3c", accent: "#ffffff" },
  { id: "max",     name: "Pulse Max",            cat: "Altavoces",   desc: "Graves potentes para casa o jardín.",  price: 129, type: "speaker", color: "#1b1f2a", accent: "#ff5a3c" },
  { id: "cable",   name: "Cable trenzado USB-C", cat: "Accesorios",  desc: "1,5 m, preparado para carga rápida.",  price: 19,  type: "cable",   color: "#14171f", accent: "#ff5a3c" },
  { id: "estuche", name: "Estuche rígido",       cat: "Accesorios",  desc: "Protege tus auriculares al viajar.",   price: 24,  type: "case",    color: "#4a5163", accent: "#ff5a3c" }
];

const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toLocaleString("es-MX");
const productById = (id) => PRODUCTS.find((p) => p.id === id);

/* ---------- 2. Ilustraciones ---------- */
function art(p) {
  const c = p.color, a = p.accent;
  const light = ["#c9ced8", "#f7f8fb"].includes(c);
  const edge = light ? 'stroke="#a9b0c0" stroke-width="2"' : "";
  let body = "";

  if (p.type === "over") {
    body = `
      <path d="M42 118V100a58 58 0 0 1 116 0v18" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
      <rect x="30" y="108" width="34" height="62" rx="17" fill="${c}" ${edge}/>
      <rect x="136" y="108" width="34" height="62" rx="17" fill="${c}" ${edge}/>
      <rect x="38" y="120" width="9" height="38" rx="4.5" fill="${a}"/>
      <rect x="153" y="120" width="9" height="38" rx="4.5" fill="${a}"/>`;
  } else if (p.type === "buds") {
    body = `
      <rect x="48" y="110" width="104" height="62" rx="26" fill="${c}" ${edge}/>
      <path d="M48 138h104" stroke="${light ? "#a9b0c0" : "rgba(255,255,255,.35)"}" stroke-width="2"/>
      <circle cx="100" cy="156" r="4" fill="${a}"/>
      <g fill="${c}" ${edge}><circle cx="76" cy="64" r="17"/><rect x="68" y="74" width="11" height="32" rx="5.5"/>
      <circle cx="124" cy="64" r="17"/><rect x="121" y="74" width="11" height="32" rx="5.5"/></g>`;
  } else if (p.type === "speaker") {
    body = `
      <rect x="54" y="34" width="92" height="136" rx="30" fill="${c}"/>
      <circle cx="100" cy="88" r="28" fill="rgba(255,255,255,.18)"/>
      <circle cx="100" cy="88" r="14" fill="rgba(255,255,255,.3)"/>
      <circle cx="100" cy="142" r="8" fill="${a}"/>`;
  } else if (p.type === "cable") {
    body = `
      <g fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round">
        <circle cx="100" cy="100" r="58"/><circle cx="100" cy="100" r="42"/><circle cx="100" cy="100" r="26"/>
        <path d="M158 100c0 40 14 58 30 62"/></g>
      <rect x="170" y="150" width="26" height="22" rx="5" fill="${c}"/>
      <rect x="176" y="156" width="14" height="6" rx="2" fill="${a}"/>`;
  } else {
    body = `
      <rect x="82" y="40" width="36" height="22" rx="11" fill="none" stroke="${c}" stroke-width="8"/>
      <rect x="38" y="56" width="124" height="104" rx="32" fill="${c}"/>
      <path d="M52 104h96" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="128" cy="104" r="8" fill="${a}"/>`;
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true">${body}</svg>`;
}

/* ---------- 3. Filtros, búsqueda y orden ---------- */
const filters = { cat: "Todos", q: "", sort: "destacados" };
const CATEGORIES = ["Todos", ...new Set(PRODUCTS.map((p) => p.cat))];

function visibleProducts() {
  const q = filters.q.trim().toLowerCase();
  const list = PRODUCTS
    .filter((p) => filters.cat === "Todos" || p.cat === filters.cat)
    .filter((p) => !q || `${p.name} ${p.cat} ${p.desc}`.toLowerCase().includes(q));

  if (filters.sort === "precio-asc") list.sort((a, b) => a.price - b.price);
  if (filters.sort === "precio-desc") list.sort((a, b) => b.price - a.price);
  if (filters.sort === "nombre") list.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return list;
}

function renderChips() {
  $("chips").innerHTML = CATEGORIES.map((c) =>
    `<button class="chip" type="button" data-cat="${c}" aria-pressed="${c === filters.cat}">${c}</button>`).join("");
}

function renderProducts() {
  const list = visibleProducts();
  $("products").innerHTML = list.map((p) => `
    <article class="product">
      <div class="art">${art(p)}${p.tag ? `<span class="tag">${p.tag}</span>` : ""}</div>
      <div class="info">
        <p class="cat">${p.cat}</p>
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="buy">
          <span class="price">${money(p.price)}</span>
          <button class="add" type="button" data-add="${p.id}" aria-label="Añadir ${p.name} al carrito">Añadir</button>
        </div>
      </div>
    </article>`).join("");

  $("empty").hidden = list.length > 0;
  $("results").textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`;
}

$("chips").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  filters.cat = btn.dataset.cat;
  renderChips();
  renderProducts();
});
$("search").addEventListener("input", (e) => { filters.q = e.target.value; renderProducts(); });
$("sort").addEventListener("change", (e) => { filters.sort = e.target.value; renderProducts(); });
$("products").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (btn) addToCart(btn.dataset.add);
});

/* ---------- 4. Carrito ---------- */
let cart = loadCart();   /* { idProducto: cantidad } */

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("aurora-cart")) || {};
    const clean = {};
    Object.keys(saved).forEach((id) => {
      if (productById(id) && Number.isInteger(saved[id]) && saved[id] > 0) clean[id] = saved[id];
    });
    return clean;
  } catch (e) {
    return {};
  }
}
function saveCart() {
  try { localStorage.setItem("aurora-cart", JSON.stringify(cart)); } catch (e) { /* sin almacenamiento: no pasa nada */ }
}

function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function cartTotal() { return Object.keys(cart).reduce((sum, id) => sum + productById(id).price * cart[id], 0); }

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const badge = $("cart-count");
  badge.classList.remove("bump");
  void badge.offsetWidth;            /* reinicia la animación */
  badge.classList.add("bump");
  showToast(`${productById(id).name} añadido al carrito`);
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const ids = Object.keys(cart);
  $("cart-count").textContent = cartCount();
  $("cart-empty").hidden = ids.length > 0;
  $("drawer-foot").hidden = ids.length === 0;
  $("cart-total").textContent = money(cartTotal());

  $("cart-list").innerHTML = ids.map((id) => {
    const p = productById(id);
    return `
      <li class="cart-item">
        <div class="cart-art">${art(p)}</div>
        <div>
          <p class="cart-name">${p.name}</p>
          <p class="cart-unit">${money(p.price)} c/u</p>
          <div class="qty">
            <button type="button" data-qty="${id}" data-delta="-1" aria-label="Quitar una unidad de ${p.name}">−</button>
            <span aria-live="polite">${cart[id]}</span>
            <button type="button" data-qty="${id}" data-delta="1" aria-label="Añadir una unidad de ${p.name}">+</button>
          </div>
        </div>
        <div>
          <p class="line-total">${money(p.price * cart[id])}</p>
          <button class="remove" type="button" data-remove="${id}" aria-label="Eliminar ${p.name} del carrito">Eliminar</button>
        </div>
      </li>`;
  }).join("");
}

$("cart-list").addEventListener("click", (e) => {
  const qty = e.target.closest("[data-qty]");
  const remove = e.target.closest("[data-remove]");
  if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.delta));
  if (remove) { delete cart[remove.dataset.remove]; saveCart(); renderCart(); }
});
$("clear-cart").addEventListener("click", () => { cart = {}; saveCart(); renderCart(); });

/* ---------- 5. Panel, compra simulada y avisos ---------- */
const drawer = $("drawer");
const overlay = $("overlay");
let lastFocus = null;

function setDrawer(open) {
  if (open) lastFocus = document.activeElement;
  drawer.classList.toggle("open", open);
  drawer.inert = !open;
  overlay.hidden = !open;
  /* Con el panel abierto, el resto de la página no recibe foco */
  document.querySelectorAll("header, main, footer").forEach((el) => { el.inert = open; });
  document.body.style.overflow = open ? "hidden" : "";
  if (open) $("close-cart").focus();
  else if (lastFocus) lastFocus.focus();
}

$("open-cart").addEventListener("click", () => setDrawer(true));
$("close-cart").addEventListener("click", () => setDrawer(false));
overlay.addEventListener("click", () => setDrawer(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("open")) setDrawer(false);
});

const checkout = $("checkout");
$("checkout-btn").addEventListener("click", () => {
  $("checkout-text").textContent =
    `Gracias por probar la tienda. Tu carrito tenía ${cartCount()} ${cartCount() === 1 ? "artículo" : "artículos"} por un total de ${money(cartTotal())}.`;
  setDrawer(false);
  cart = {};
  saveCart();
  renderCart();
  checkout.showModal();
});
$("checkout-close").addEventListener("click", () => checkout.close());

let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

/* Arranque */
renderChips();
renderProducts();
renderCart();
