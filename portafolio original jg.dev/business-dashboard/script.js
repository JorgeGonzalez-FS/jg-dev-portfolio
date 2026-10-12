/* Nexo Business Dashboard | Lógica
   1. Datos de ejemplo (los datos son inventados)
   2. Utilidades de formato
   3. Indicadores (KPI)
   4. Gráfico de barras y gráfico de dona (SVG generado con JS)
   5. Pedidos recientes
   6. Tabla de pedidos: búsqueda, filtro, orden y exportación
   7. Cambio de vista y arranque */

/* ---------- 1. Datos ---------- */
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const REVENUE = [18200, 21400, 19800, 24600, 27100, 25800, 29300, 31200, 28700, 33500, 36800, 41200];
const ORDERS = [182, 210, 198, 240, 262, 251, 284, 301, 277, 322, 351, 396];
const CUSTOMERS = [64, 72, 60, 85, 91, 88, 102, 110, 97, 121, 134, 150];

const CATEGORIES = [
  { name: "Electrónica", share: 38, color: "#3b8cff" },
  { name: "Hogar", share: 24, color: "#8b6cf6" },
  { name: "Moda", share: 21, color: "#2dd4a0" },
  { name: "Deportes", share: 17, color: "#f5b53d" }
];

const CLIENTS = ["Ana Torres", "Luis Méndez", "Carla Ruiz", "Diego Salas", "Marta Vega", "Pablo Ortiz", "Sofía Luna", "Javier Rojas", "Elena Paredes", "Hugo Campos"];
const PRODUCTS = ["Auriculares Pulse", "Teclado mecánico", "Lámpara de escritorio", "Zapatillas Trail", "Mochila urbana", "Monitor 27\"", "Set de cocina", "Bicicleta estática", "Chaqueta ligera", "Altavoz portátil"];

/* Genera 30 pedidos de forma determinista: siempre salen los mismos */
const ORDER_LIST = Array.from({ length: 30 }, (_, i) => {
  let estado = "Completado";
  if (i % 4 === 1) estado = "Enviado";
  if (i % 7 === 0) estado = "Pendiente";
  if (i % 11 === 10) estado = "Cancelado";
  const date = new Date(2026, 8, 30 - i);
  return {
    id: 1030 - i,
    cliente: CLIENTS[(i * 3) % CLIENTS.length],
    producto: PRODUCTS[(i * 7) % PRODUCTS.length],
    fecha: date.toISOString().slice(0, 10),
    total: Math.round((40 + ((i * 137) % 460) + (i % 3) * 12.5) * 100) / 100,
    estado
  };
});

/* ---------- 2. Formato ---------- */
const money = (n, decimals = 0) =>
  "$" + n.toLocaleString("es-MX", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const shortMoney = (n) => "$" + Math.round(n / 1000) + "k";
const formatDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const esc = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (id) => document.getElementById(id);

/* ---------- 3. KPI ---------- */
function renderKpis(range) {
  const last = MONTHS.length - 1;
  const sum = (arr) => arr.slice(-range).reduce((a, b) => a + b, 0);
  const ticket = (i) => REVENUE[i] / ORDERS[i];

  const kpis = [
    { label: "Ingresos", color: "var(--blue)", value: money(sum(REVENUE)), now: REVENUE[last], prev: REVENUE[last - 1] },
    { label: "Pedidos", color: "var(--violet)", value: sum(ORDERS).toLocaleString("es-MX"), now: ORDERS[last], prev: ORDERS[last - 1] },
    { label: "Clientes nuevos", color: "var(--green)", value: sum(CUSTOMERS).toLocaleString("es-MX"), now: CUSTOMERS[last], prev: CUSTOMERS[last - 1] },
    { label: "Ticket medio", color: "var(--amber)", value: money(sum(REVENUE) / sum(ORDERS), 2), now: ticket(last), prev: ticket(last - 1) }
  ];

  $("kpis").innerHTML = kpis.map((k) => {
    const change = ((k.now - k.prev) / k.prev) * 100;
    const cls = change >= 0 ? "up" : "down";
    const sign = change >= 0 ? "▲ +" : "▼ ";
    return `
      <article class="kpi">
        <p class="kpi-label"><span class="kpi-dot" style="background:${k.color}"></span>${k.label}</p>
        <p class="kpi-value">${k.value}</p>
        <p class="kpi-delta"><b class="${cls}">${sign}${change.toFixed(1)}%</b> frente al mes anterior</p>
      </article>`;
  }).join("");
}

/* ---------- 4. Gráficos ---------- */
function renderBarChart(range) {
  const labels = MONTHS.slice(-range);
  const values = REVENUE.slice(-range);
  const W = 640, H = 280, left = 48, right = 8, top = 12, bottom = 30;
  const plotW = W - left - right, plotH = H - top - bottom;
  const step = 10000;                                   /* cada línea de la cuadrícula = 10.000 */
  const steps = Math.ceil(Math.max(...values) / step);  /* cuántas líneas hacen falta */
  const max = step * steps;
  const slot = plotW / values.length;
  const barW = Math.min(34, slot * 0.58);

  let grid = "";
  for (let t = 0; t <= steps; t++) {
    const y = top + plotH - (plotH * t) / steps;
    grid += `<line class="grid-line" x1="${left}" x2="${W - right}" y1="${y}" y2="${y}"/>`;
    grid += `<text x="${left - 8}" y="${y + 4}" text-anchor="end">${shortMoney(step * t)}</text>`;
  }

  const bars = values.map((v, i) => {
    const h = (v / max) * plotH;
    const x = left + slot * i + (slot - barW) / 2;
    const y = top + plotH - h;
    const isLast = i === values.length - 1 ? " last" : "";
    return `
      <rect class="bar${isLast}" x="${x}" y="${y}" width="${barW}" height="${h}" rx="4">
        <title>${labels[i]}: ${money(v)}</title>
      </rect>
      <text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle">${labels[i]}</text>`;
  }).join("");

  $("bar-chart").innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de barras de ingresos por mes"><g class="axis">${grid}${bars}</g></svg>`;
}

function renderDonut(range) {
  const r = 60, c = 2 * Math.PI * r;
  const total = REVENUE.slice(-range).reduce((a, b) => a + b, 0);
  let offset = 0;

  const arcs = CATEGORIES.map((cat) => {
    const dash = (c * cat.share) / 100;
    const arc = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${cat.color}" stroke-width="22"
      stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)"><title>${cat.name}: ${cat.share}%</title></circle>`;
    offset += dash;
    return arc;
  }).join("");

  $("donut-chart").innerHTML = `
    <svg viewBox="0 0 160 160" role="img" aria-label="Gráfico de dona de ventas por categoría">
      ${arcs}
      <text class="donut-total" x="80" y="82">${shortMoney(total)}</text>
      <text class="donut-label" x="80" y="100">ingresos</text>
    </svg>`;

  $("legend").innerHTML = CATEGORIES.map((cat) =>
    `<li><span><i style="background:${cat.color}"></i>${cat.name}</span><b>${cat.share}%</b></li>`).join("");
}

/* ---------- 5. Pedidos recientes ---------- */
function renderRecent() {
  $("recent").innerHTML = ORDER_LIST.slice(0, 5).map((o) => `
    <li>
      <span class="who">${esc(o.cliente)}</span>
      <span class="what">${esc(o.producto)}</span>
      <span class="badge ${o.estado.toLowerCase()}">${o.estado}</span>
      <span class="amount">${money(o.total, 2)}</span>
    </li>`).join("");
}

/* ---------- 6. Tabla de pedidos ---------- */
const state = { q: "", status: "", sortKey: "fecha", dir: -1 };

function getVisibleOrders() {
  const q = state.q.trim().toLowerCase();
  return ORDER_LIST
    .filter((o) => !state.status || o.estado === state.status)
    .filter((o) => !q || `${o.id} ${o.cliente} ${o.producto}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const x = a[state.sortKey], y = b[state.sortKey];
      const result = typeof x === "number" ? x - y : String(x).localeCompare(String(y), "es");
      return result * state.dir;
    });
}

function renderTable() {
  const rows = getVisibleOrders();
  $("rows").innerHTML = rows.length
    ? rows.map((o) => `
      <tr>
        <td>#${o.id}</td>
        <td>${esc(o.cliente)}</td>
        <td>${esc(o.producto)}</td>
        <td>${formatDate(o.fecha)}</td>
        <td class="num">${money(o.total, 2)}</td>
        <td><span class="badge ${o.estado.toLowerCase()}">${o.estado}</span></td>
      </tr>`).join("")
    : `<tr><td class="empty" colspan="6">No hay pedidos que coincidan con la búsqueda.</td></tr>`;

  $("count").textContent = `Mostrando ${rows.length} de ${ORDER_LIST.length} pedidos`;

  document.querySelectorAll("th").forEach((th) => {
    const key = th.querySelector("button").dataset.sort;
    th.setAttribute("aria-sort", key === state.sortKey ? (state.dir === 1 ? "ascending" : "descending") : "none");
  });
}

function exportCsv() {
  const header = ["Pedido", "Cliente", "Producto", "Fecha", "Total", "Estado"];
  const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = getVisibleOrders().map((o) =>
    [o.id, o.cliente, o.producto, o.fecha, o.total.toFixed(2), o.estado].map(cell).join(","));
  const csv = "\uFEFF" + [header.map(cell).join(","), ...lines].join("\n");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "pedidos-nexo.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

$("search").addEventListener("input", (e) => { state.q = e.target.value; renderTable(); });
$("status").addEventListener("change", (e) => { state.status = e.target.value; renderTable(); });
$("export").addEventListener("click", exportCsv);
document.querySelectorAll("th button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.sort;
    state.dir = state.sortKey === key ? -state.dir : 1;
    state.sortKey = key;
    renderTable();
  });
});

/* ---------- 7. Vistas y arranque ---------- */
const TITLES = {
  resumen: ["Resumen", "Así van las ventas de Nexo Store."],
  pedidos: ["Pedidos", "Busca, filtra y exporta los pedidos."]
};

function setView(name) {
  $("view-resumen").hidden = name !== "resumen";
  $("view-pedidos").hidden = name !== "pedidos";
  $("range-box").hidden = name !== "resumen";
  $("page-title").textContent = TITLES[name][0];
  $("page-sub").textContent = TITLES[name][1];
  document.querySelectorAll(".nav-btn").forEach((b) => {
    const active = b.dataset.view === name;
    b.classList.toggle("active", active);
    if (active) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
}

document.querySelectorAll("[data-view]").forEach((el) => {
  el.addEventListener("click", () => setView(el.dataset.view));
});

function renderSummary() {
  const range = Number($("range").value);
  renderKpis(range);
  renderBarChart(range);
  renderDonut(range);
}
$("range").addEventListener("change", renderSummary);

renderSummary();
renderRecent();
renderTable();
