// DealBeacon app logic: filter, search and sort the deal list.
// Reads its initial state from the URL query (?q=&cat=&store=&min=&sort=)
// so a filtered view can be linked to and screenshotted.

import { DEALS, VERDICTS, CATEGORIES, STORES, CHECKED_AT } from "./deals.js";

const $ = (sel) => document.querySelector(sel);

const state = {
  q: "",
  cat: "All",
  store: "All",
  min: 0,
  sort: "pct",
};

function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}

function pctOf(d) {
  return Math.round((1 - d.sale / d.usual) * 100);
}

function savedOf(d) {
  return d.usual - d.sale;
}

function readParams() {
  const p = new URLSearchParams(location.search);
  if (p.get("q")) state.q = p.get("q");
  if (p.get("cat") && CATEGORIES.includes(p.get("cat"))) state.cat = p.get("cat");
  if (p.get("store") && STORES.includes(p.get("store"))) state.store = p.get("store");
  if (p.get("min")) state.min = Number(p.get("min")) || 0;
  if (p.get("sort")) state.sort = p.get("sort");
}

function writeParams() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.cat !== "All") p.set("cat", state.cat);
  if (state.store !== "All") p.set("store", state.store);
  if (state.min) p.set("min", String(state.min));
  if (state.sort !== "pct") p.set("sort", state.sort);
  const qs = p.toString();
  history.replaceState(null, "", qs ? "?" + qs : location.pathname);
}

function filteredDeals() {
  const q = state.q.trim().toLowerCase();
  let list = DEALS.filter((d) => {
    if (state.cat !== "All" && d.category !== state.cat) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (pctOf(d) < state.min) return false;
    if (q && !(d.product + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    pct: (a, b) => pctOf(b) - pctOf(a) || savedOf(b) - savedOf(a),
    save: (a, b) => savedOf(b) - savedOf(a),
    low: (a, b) => a.sale - b.sale,
    high: (a, b) => b.sale - a.sale,
  }[state.sort] || ((a, b) => pctOf(b) - pctOf(a));
  return list.slice().sort(by);
}

function verdictChip(d) {
  const v = VERDICTS[d.verdict];
  return `<span class="verdict verdict-${d.verdict}" title="${v.note}">${v.label}</span>`;
}

function cardHtml(d) {
  const pct = pctOf(d);
  const also = d.alsoAt.length
    ? `<p class="also">Also: ${d.alsoAt.map((a) => `${a.store} ${money(a.price)}`).join(" · ")}</p>`
    : "";
  return `<article class="card" data-id="${d.id}">
    <div class="card-top">
      <span class="cat">${d.category}</span>
      <span class="store">${d.store}</span>
    </div>
    <h3>${d.product}</h3>
    <div class="prices">
      <span class="sale">${money(d.sale)}</span>
      <span class="usual"><s>${money(d.usual)}</s></span>
      <span class="off">−${pct}%</span>
    </div>
    <p class="save">You save ${money(savedOf(d))}</p>
    ${verdictChip(d)}
    <p class="evidence">${d.evidence}</p>
    ${also}
    <p class="meta">Checked ${CHECKED_AT}<br>Source: ${d.source}</p>
    <a class="buy" href="${d.link}" target="_blank" rel="noopener">View at ${d.store} →</a>
  </article>`;
}

function render() {
  const list = filteredDeals();
  const grid = $("#grid");
  grid.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<p class="empty">No deals match those filters. Try clearing the search or lowering the discount filter.</p>`;
  const totalSave = list.reduce((s, d) => s + savedOf(d), 0);
  $("#count").textContent =
    `${list.length} of ${DEALS.length} deals · total savings on screen ${money(totalSave)}`;
  $("#stats-best").textContent = list.length ? `Best on screen: ${list[0].product} — ${money(list[0].sale)} (−${pctOf(list[0])}%)` : "";
}

function fillSelect(sel, values, current) {
  const el = $(sel);
  el.innerHTML = values.map((v) => `<option value="${v}"${v === current ? " selected" : ""}>${v}</option>`).join("");
}

function bindControls() {
  $("#q").value = state.q;
  fillSelect("#cat", CATEGORIES, state.cat);
  fillSelect("#store", STORES, state.store);
  fillSelect("#min", [], String(state.min));
  $("#min").innerHTML =
    `<option value="0"${state.min === 0 ? " selected" : ""}>Any discount</option>` +
    `<option value="30"${state.min === 30 ? " selected" : ""}>30% or more</option>` +
    `<option value="50"${state.min === 50 ? " selected" : ""}>50% or more</option>`;
  $("#sort").value = state.sort;

  $("#q").addEventListener("input", (e) => { state.q = e.target.value; writeParams(); render(); });
  $("#cat").addEventListener("change", (e) => { state.cat = e.target.value; writeParams(); render(); });
  $("#store").addEventListener("change", (e) => { state.store = e.target.value; writeParams(); render(); });
  $("#min").addEventListener("change", (e) => { state.min = Number(e.target.value); writeParams(); render(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; writeParams(); render(); });
  $("#reset").addEventListener("click", () => {
    Object.assign(state, { q: "", cat: "All", store: "All", min: 0, sort: "pct" });
    bindControls();
    writeParams();
    render();
  });
}

readParams();
bindControls();
render();
