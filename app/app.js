// Cutline finder logic: URL state, filter / sort / render, computed stats.
const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
const pctOf = (d) => Math.round((1 - d.sale / d.usual) * 100);
const saveOf = (d) => d.usual - d.sale;
const HERO = DEALS.find((d) => d.name === HERO_NAME);
const VERDICT_LABEL = Object.fromEntries(VERDICTS.map((v) => [v.key, v.label]));
const SORT_LABEL = { pct: "% off", saved: "$ saved", low: "price low \u2192 high", high: "price high \u2192 low" };

function readState() {
  const p = new URLSearchParams(location.search);
  return {
    q: p.get("q") || "",
    cat: p.get("cat") || "all",
    store: p.get("store") || "all",
    min: Number(p.get("min") || 0),
    max: Number(p.get("max") || 0),
    real: p.get("real") === "1",
    verdict: p.get("verdict") || "all",
    sort: p.get("sort") || "pct",
  };
}
let state = readState();
const filtersActive = () =>
  state.q !== "" || state.cat !== "all" || state.store !== "all" || state.min > 0 || state.max > 0 || state.real || state.verdict !== "all";

function syncUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.cat !== "all") p.set("cat", state.cat);
  if (state.store !== "all") p.set("store", state.store);
  if (state.min > 0) p.set("min", String(state.min));
  if (state.max > 0) p.set("max", String(state.max));
  if (state.real) p.set("real", "1");
  if (state.verdict !== "all") p.set("verdict", state.verdict);
  if (state.sort !== "pct") p.set("sort", state.sort);
  const qs = p.toString();
  history.replaceState(null, "", qs ? "?" + qs : location.pathname);
}

function matchDeal(d) {
  if (state.cat !== "all" && d.cat !== state.cat) return false;
  if (state.store !== "all" && d.store !== state.store) return false;
  if (state.verdict !== "all" && d.verdict !== state.verdict) return false;
  if (pctOf(d) < state.min) return false;
  if (state.max > 0 && d.sale >= state.max) return false;
  if (state.real && d.verdict !== "new-low" && d.verdict !== "strong") return false;
  if (state.q) {
    const hay = (d.name + " " + d.store + " " + d.cat).toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  return true;
}
const SORTERS = {
  pct: (a, b) => pctOf(b) - pctOf(a) || saveOf(b) - saveOf(a),
  saved: (a, b) => saveOf(b) - saveOf(a) || pctOf(b) - pctOf(a),
  low: (a, b) => a.sale - b.sale,
  high: (a, b) => b.sale - a.sale,
};

function renderStats() {
  const total = DEALS.length;
  const lows = DEALS.filter((d) => d.verdict === "new-low").length;
  const saving = DEALS.reduce((s, d) => s + saveOf(d), 0);
  const avg = Math.round(DEALS.reduce((s, d) => s + pctOf(d), 0) / total);
  const stores = new Set(DEALS.map((d) => d.store)).size;
  $("stats").innerHTML = "";
  const parts = [
    ["<b>" + total + " deals</b>", null],
    ["<span class=\"nl\">" + lows + " new lows</span>", null],
    ["<b>" + money(Math.round(saving * 100) / 100) + "</b>&nbsp;total savings", null],
    [stores + " stores", null],
    ["avg&nbsp;<b>" + avg + "% off</b>", null],
    ["verified " + CHECKED_ON, null],
  ];
  parts.forEach(([html], i) => {
    if (i) $("stats").insertAdjacentHTML("beforeend", "<span class=\"sep\">\u00b7</span>");
    $("stats").insertAdjacentHTML("beforeend", html);
  });
  $("headCount").textContent = total + " deals";
}

function renderHero() {
  const collapsed = filtersActive();
  $("hero").style.display = collapsed ? "none" : "";
  $("heroChip").classList.toggle("on", collapsed);
  if (collapsed) {
    $("chipLink").textContent = HERO.name;
    $("chipLink").href = HERO.url;
    $("chipPct").textContent = "\u2212" + pctOf(HERO) + "%";
    $("chipPrice").textContent = money(HERO.sale) + " at " + HERO.store;
    return;
  }
  $("heroName").textContent = HERO.name;
  $("heroChips").innerHTML = "";
  const chip = (t) => { const s = document.createElement("span"); s.className = "chip"; s.textContent = t; $("heroChips").appendChild(s); };
  chip(HERO.store);
  chip(HERO.cat);
  const door = document.createElement("span");
  door.className = "door";
  door.textContent = "Doorbuster \u2014 ends 28 Nov";
  $("heroChips").appendChild(door);
  $("heroSale").textContent = money(HERO.sale);
  $("heroPct").textContent = "\u2212" + pctOf(HERO) + "%";
  $("heroUsual").textContent = money(HERO.usual);
  $("heroSave").textContent = "Save " + money(Math.round(saveOf(HERO) * 100) / 100);
  $("heroCta").href = HERO.url;
}

function renderPills() {
  const box = $("pills");
  box.innerHTML = "";
  const mk = (label, cat, count) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pill" + (state.cat === cat ? " on" : "");
    b.innerHTML = "";
    const t = document.createTextNode(label + " ");
    const n = document.createElement("b");
    n.textContent = count;
    b.append(t, n);
    b.onclick = () => { state.cat = cat; update(); };
    box.appendChild(b);
  };
  mk("All", "all", DEALS.length);
  CATEGORIES.forEach((c) => mk(c, c, DEALS.filter((d) => d.cat === c).length));
}

function renderVerdictSeg() {
  const box = $("verdictSeg");
  box.innerHTML = "";
  const counts = Object.fromEntries(VERDICTS.map((v) => [v.key, DEALS.filter((d) => d.verdict === v.key).length]));
  const mk = (label, key, count) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = state.verdict === key ? "on" : "";
    b.textContent = count == null ? label : label + " " + count;
    b.onclick = () => { state.verdict = key; update(); };
    box.appendChild(b);
  };
  mk("All", "all", DEALS.length);
  VERDICTS.forEach((v) => mk(v.label, v.key, counts[v.key]));
}

function renderStoreSelect() {
  const sel = $("store");
  if (sel.options.length) { sel.value = state.store; return; }
  const stores = [...new Set(DEALS.map((d) => d.store))];
  const add = (label, val) => { const o = document.createElement("option"); o.value = val; o.textContent = label; sel.appendChild(o); };
  add("All stores", "all");
  stores.forEach((s) => add(s + " (" + DEALS.filter((d) => d.store === s).length + ")", s));
  sel.value = state.store;
}

function renderGrid(list) {
  const grid = $("grid");
  grid.innerHTML = "";
  if (!list.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No deals match those filters. Clear a filter to see more.";
    grid.appendChild(p);
    return;
  }
  const tpl = $("cardTpl");
  list.forEach((d) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    card.href = d.url;
    if (d.verdict === "new-low") card.classList.add("new-low");
    card.querySelector(".sc").textContent = d.store + " \u00b7 " + d.cat;
    const chip = card.querySelector(".verdict");
    chip.textContent = VERDICT_LABEL[d.verdict].toUpperCase();
    chip.classList.add("v-" + d.verdict);
    card.querySelector(".cname").textContent = d.name;
    card.querySelector(".sale").textContent = money(d.sale);
    card.querySelector(".pct").textContent = "\u2212" + pctOf(d) + "%";
    card.querySelector(".compare s").textContent = money(d.usual);
    card.querySelector(".save").textContent = "save " + money(Math.round(saveOf(d) * 100) / 100);
    card.querySelector(".note").textContent = d.note;
    const also = card.querySelector(".also");
    if (d.also.length) {
      also.innerHTML = "";
      also.appendChild(document.createTextNode("Also "));
      d.also.forEach(([s, pr], i) => {
        if (i) also.appendChild(document.createTextNode(" \u00b7 "));
        const b = document.createElement("b");
        b.textContent = s + " " + money(pr);
        also.appendChild(b);
      });
    }
    card.querySelector(".src").textContent = d.store + " \u00b7 " + CHECKED_ON + " \u00b7 " + d.source;
    grid.appendChild(card);
  });
}

function renderResult(shown) {
  const bits = ["Showing <b>" + shown + " of " + DEALS.length + "</b>"];
  if (state.verdict !== "all") bits.push(VERDICT_LABEL[state.verdict]);
  if (state.cat !== "all") bits.push(state.cat);
  if (state.store !== "all") bits.push(state.store);
  if (state.min > 0) bits.push("\u2265" + state.min + "% off");
  if (state.max > 0) bits.push("under $" + state.max);
  if (state.real) bits.push("real deals only");
  if (state.q) bits.push("matching \u201c" + state.q + "\u201d");
  bits.push("sorted by " + SORT_LABEL[state.sort]);
  $("resultLine").innerHTML = bits.join(" \u00b7 ");
}

function renderLegend() {
  const box = $("legend");
  box.innerHTML = "";
  VERDICTS.forEach((v) => {
    const s = document.createElement("span");
    const b = document.createElement("b");
    b.textContent = v.label.toUpperCase();
    s.append(b, document.createTextNode(" = " + v.hint));
    box.appendChild(s);
  });
}

function update() {
  syncUrl();
  const matched = DEALS.filter(matchDeal).sort(SORTERS[state.sort]);
  const collapsed = filtersActive();
  const shown = collapsed ? matched : matched.filter((d) => d !== HERO);
  renderHero();
  renderPills();
  renderVerdictSeg();
  renderStoreSelect();
  renderGrid(shown);
  renderResult(matched.length);
  $("clearAll").classList.toggle("on", collapsed);
  $("q").value = state.q;
  $("searchBox").classList.toggle("filled", state.q !== "");
  $("minOff").value = String(state.min);
  $("maxPrice").value = String(state.max);
  $("realOnly").classList.toggle("on", state.real);
  $("realOnly").setAttribute("aria-pressed", String(state.real));
  $("sort").value = state.sort;
}

$("q").addEventListener("input", (e) => { state.q = e.target.value.trim(); update(); });
$("clearQ").addEventListener("click", () => { state.q = ""; update(); $("q").focus(); });
$("store").addEventListener("change", (e) => { state.store = e.target.value; update(); });
$("minOff").addEventListener("change", (e) => { state.min = Number(e.target.value); update(); });
$("maxPrice").addEventListener("change", (e) => { state.max = Number(e.target.value); update(); });
$("realOnly").addEventListener("click", () => { state.real = !state.real; update(); });
$("sort").addEventListener("change", (e) => { state.sort = e.target.value; update(); });
$("clearAll").addEventListener("click", () => {
  state = { q: "", cat: "all", store: "all", min: 0, max: 0, real: false, verdict: "all", sort: "pct" };
  update();
});
$("copyLink").addEventListener("click", () => {
  const done = () => { $("copyLink").textContent = "Link copied"; setTimeout(() => { $("copyLink").textContent = "Copy link to this view"; }, 1500); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(done, done);
  else done();
});

renderStats();
renderLegend();
update();
