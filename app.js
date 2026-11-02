'use strict';

// Richtlijnen houdbaarheid in dagen. Diepvries op -18 °C, frigo op 4 °C.
const CATEGORIES = [
  { id: 'rundvlees',  label: 'Rund / lam / kalf',       diepvries: 270, frigo: 3 },
  { id: 'varken',     label: 'Varkensvlees',            diepvries: 180, frigo: 3 },
  { id: 'gehakt',     label: 'Gehakt / worst',          diepvries: 90,  frigo: 1 },
  { id: 'gevogelte',  label: 'Kip / gevogelte',         diepvries: 270, frigo: 2 },
  { id: 'vis_vet',    label: 'Vette vis (zalm, makreel)', diepvries: 90, frigo: 2 },
  { id: 'vis_mager',  label: 'Magere vis (kabeljauw)',  diepvries: 180, frigo: 2 },
  { id: 'schaaldier', label: 'Garnalen / schaaldieren', diepvries: 90,  frigo: 2 },
  { id: 'groenten',   label: 'Groenten',                diepvries: 300, frigo: 7 },
  { id: 'fruit',      label: 'Fruit',                   diepvries: 300, frigo: 7 },
  { id: 'brood',      label: 'Brood / gebak',           diepvries: 90,  frigo: 5 },
  { id: 'maaltijd',   label: 'Restjes / bereide maaltijd', diepvries: 90, frigo: 3 },
  { id: 'soep',       label: 'Soep / saus',             diepvries: 120, frigo: 4 },
  { id: 'zuivel',     label: 'Melk / yoghurt',          diepvries: 90,  frigo: 5 },
  { id: 'kaas',       label: 'Kaas',                    diepvries: 120, frigo: 21 },
  { id: 'beleg',      label: 'Vleeswaren / beleg',      diepvries: 60,  frigo: 4 },
  { id: 'ijs',        label: 'IJs',                     diepvries: 60,  frigo: 1 },
  { id: 'kantenklaar',label: 'Kant-en-klaar product',   diepvries: 180, frigo: 5 },
  { id: 'aardappel',  label: 'Frieten / kroketten',     diepvries: 240, frigo: 3 },
  { id: 'vega',       label: 'Vegetarisch (tofu, veggie)', diepvries: 180, frigo: 5 },
  { id: 'saus',       label: 'Dips / sauzen / smeersels', diepvries: 90, frigo: 14 },
  { id: 'eieren',     label: 'Eieren',                  diepvries: 270, frigo: 28 },
  { id: 'ander',      label: 'Ander',                   diepvries: 180, frigo: 5 },
];
const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Regels om de soort te raden. Volgorde telt: specifiek eerst.
// TAG_RULES kijken naar de categorieën van Open Food Facts (Engels, bv. en:frozen-chicken-breasts).
// NAME_RULES kijken naar de productnaam (NL, FR, EN). Een woord met ^ moet aan het begin van een woord staan.
const TAG_RULES = [
  ['vega',       ['meat-analogue', 'meat-substitute', 'meat-alternative', 'vegetarian-burger', 'vegan-burger', 'tofu', 'tempeh', 'seitan', 'falafel']],
  ['ijs',        ['ice-cream', 'frozen-dessert', 'sorbet', 'glaces']],
  ['soep',       ['soup']],
  ['saus',       ['sauces', 'dips', 'spreads', 'mayonnaise', 'ketchup', 'hummus', 'pesto']],
  ['aardappel',  ['fries', 'potato', 'croquette', 'rosti', 'frites']],
  ['kantenklaar',['pizza', 'meals', 'lasagn', 'quiche', 'nugget', 'snack', 'prepared', 'ready', 'spring-roll', 'burrito']],
  ['gehakt',     ['minced', 'ground-', 'sausage', 'burger', 'meatball', 'hamburger']],
  ['beleg',      ['cold-cut', 'hams', 'salami', 'charcuterie', 'sliced-meat', 'pate', 'bacon-slice', 'cooked-ham']],
  ['gevogelte',  ['chicken', 'poultr', 'turkey', 'duck']],
  ['vis_vet',    ['salmon', 'mackerel', 'herring', 'tuna', 'trout', 'sardine']],
  ['schaaldier', ['shrimp', 'prawn', 'mussel', 'crustacean', 'scampi', 'seafood', 'squid', 'calamar']],
  ['vis_mager',  ['fish', 'cod', 'pollock', 'hake', 'pangasius', 'plaice', 'tilapia']],
  ['varken',     ['pork', 'bacon', 'spare-rib']],
  ['rundvlees',  ['beef', 'veal', 'lamb', 'meat']],
  ['kaas',       ['cheese']],
  ['eieren',     ['eggs']],
  ['zuivel',     ['milk', 'yogurt', 'yoghurt', 'dairy', 'cream', 'butter', 'dessert', 'pudding', 'quark']],
  ['brood',      ['bread', 'viennoiserie', 'pastr', 'croissant', 'cake', 'waffle', 'pancake', 'baguette']],
  ['groenten',   ['vegetable', 'spinach', 'peas', 'beans', 'broccoli', 'legume', 'herbs', 'mushroom', 'onion', 'carrot']],
  ['fruit',      ['fruit', 'berr', 'strawberr', 'raspberr', 'mango', 'cherr']],
];
const NAME_RULES = [
  ['vega',       ['vegetari', 'veggie', 'vegan', 'tofu', 'tempeh', 'seitan', 'quorn', 'falafel', 'plantaardig', 'vegaburger', 'vega ', '^vega$', 'garden gourmet', 'beyond meat']],
  ['ijs',        ['roomijs', '^ijsje', '^ijs ', '^ijs$', 'sorbet', '^glace', '^ice cream', 'magnum', 'cornetto']],
  ['soep',       ['soep', 'soupe', '^soup', 'bouillon']],
  ['saus',       ['saus', '^sauce', '^dip', 'mayonaise', 'mayonnaise', 'ketchup', 'hummus', 'pesto', 'tapenade', 'smeerpasta']],
  ['aardappel',  ['friet', 'frites', '^fries', 'kroket', 'croquette', 'aardappel', 'pommes', 'patat', 'rösti', 'rosti', 'gratin']],
  ['kantenklaar',['pizza', 'lasagne', 'maaltijd', 'quiche', 'nugget', 'loempia', 'bitterbal', 'frikandel', 'burrito', 'wrap', 'stoofvlees', 'balletjes in', 'vol-au-vent', 'stoemp', 'spaghetti', 'bolognese', 'ovenschotel', 'macaroni']],
  ['gehakt',     ['gehakt', 'haché', 'hache', 'worst', 'saucisse', 'burger', 'chipolata', 'merguez', '^boulette']],
  ['beleg',      ['salami', 'ham ', '^ham$', 'jambon', 'filet de saxe', 'boterhamworst', 'vleeswaren', 'paté', 'pate', 'américain', 'americain', 'préparé', 'kipfilet beleg']],
  ['gevogelte',  ['^kip', 'kalkoen', '^eend', 'poulet', 'chicken', 'dinde', 'kalkoen']],
  ['vis_vet',    ['zalm', 'saumon', 'salmon', 'makreel', 'maquereau', 'haring', 'hareng', 'tonijn', 'thon', 'forel', 'truite', 'paling', 'sardine']],
  ['schaaldier', ['garnaal', 'garnalen', 'scampi', 'mosselen', 'moules', 'crevette', 'inktvis', 'calamar', 'zeevruchten', 'fruits de mer']],
  ['vis_mager',  ['kabeljauw', 'cabillaud', 'koolvis', 'colin', 'heek', 'pangasius', 'tilapia', 'schol', 'vissticks', 'fish stick', 'vis ', '^vis$', 'visfilet', 'poisson', '^fish']],
  ['varken',     ['varken', 'porc', '^pork', '^spek$', 'spekblokjes', 'spekreepjes', 'lardon', 'spare', 'ribbetjes', 'kotelet', 'côte de porc']],
  ['rundvlees',  ['rund', 'boeuf', 'bœuf', 'beef', 'steak', 'biefstuk', 'entrecote', 'kalf', '^veau', '^lam', 'agneau', '^vlees']],
  ['groenten',   ['groent', 'légume', 'legume', 'spinazie', 'épinard', 'erwt', 'petits pois', 'bonen', 'haricot', 'broccoli', 'bloemkool', 'wortel', 'carotte', '^ui$', '^uien', 'oignon', 'paprika', 'champignon', 'prei', 'poireau', 'courgette', '^mais$', 'maïs', 'kruiden', 'peterselie', 'spruit', 'wok']],
  ['zuivel',     ['platte kaas', 'kwark', 'skyr', 'cottage']],
  ['kaas',       ['kaas', 'fromage', 'cheese', 'gouda', 'brie', 'camembert', 'mozzarella', 'parmezaan', 'emmental', 'feta']],
  ['eieren',     ['eieren', '^ei$', 'oeufs', 'œufs', '^eggs']],
  ['zuivel',     ['melk', '^lait', 'yoghurt', 'yogurt', 'yaourt', 'room', 'crème', 'creme', '^boter$', 'roomboter', 'beurre', 'pudding', 'platte kaas', 'skyr', 'kwark', 'danone', 'alpro']],
  ['brood',      ['brood', '^pain', 'baguette', 'croissant', 'pistolet', 'koffiekoek', 'taart', 'cake', 'wafel', 'gaufre', 'pannenkoek', 'crêpe', 'sandwich', 'boterkoek']],
  ['fruit',      ['fruit', 'aardbei', 'fraise', 'framboos', 'framboise', 'bessen', 'baies', 'mango', '^kersen', 'cerise', 'banaan', 'appel', 'pomme ', 'peer', 'ananas', 'smoothie']],
];

const DAY = 86400000;
const WARN_DAYS = { diepvries: 30, frigo: 1 };
const STORE_KEY = 'dvv.items.v1';
const SHOP_KEY = 'dvv.shopping.v1';
const PRODUCTS_KEY = 'dvv.products.v1';
const LOC_ICON = { diepvries: '❄️', frigo: '🧊' };

const $ = s => document.querySelector(s);
const state = {
  items: load(STORE_KEY, []),
  products: load(PRODUCTS_KEY, {}),
  shopping: load(SHOP_KEY, []),
  filter: 'alles',
  query: '',
  mode: 'in',
  batch: null,
  editingId: null,
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state.items));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(state.products));
    localStorage.setItem(SHOP_KEY, JSON.stringify(state.shopping));
  } catch { toast('Opslaan mislukt'); }
  writeSwData();
  schedulePushSync();
  scheduleBackup();
}

function today() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function toISO(d) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function fromISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtDate(s) {
  return fromISO(s).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Houdbaar-tot datum: THT van de verpakking als die er is, anders erin-datum + richtlijn.
function limitDate(item) {
  const guide = new Date(fromISO(item.added).getTime() + CAT[item.category][item.location] * DAY);
  if (!item.expiry) return guide;
  const exp = fromISO(item.expiry);
  // In de diepvries telt de richtlijn als die later valt dan de THT van een vers product.
  return item.location === 'diepvries' ? new Date(Math.max(exp, guide)) : exp;
}

function status(item) {
  const left = Math.round((limitDate(item) - today()) / DAY);
  const days = Math.round((today() - fromISO(item.added)) / DAY);
  let level = 'ok';
  if (left < 0) level = 'bad';
  else if (left <= WARN_DAYS[item.location]) level = 'warn';
  return { left, days, level };
}

function humanDays(n) {
  if (n >= 60) return `${Math.round(n / 30)} maanden`;
  if (n >= 14) return `${Math.round(n / 7)} weken`;
  return n === 1 ? '1 dag' : `${n} dagen`;
}
function badgeText(s) {
  if (s.left < 0) return `${humanDays(-s.left)} te lang`;
  if (s.left === 0) return 'Vandaag op';
  return `nog ${humanDays(s.left)}`;
}

// ---------- Weergave ----------

function render() {
  const all = state.items.map(i => ({ ...i, s: status(i) }));
  $('#cntAlles').textContent = all.length ? `(${all.length})` : '';
  $('#cntDiepvries').textContent = count(all, 'diepvries');
  $('#cntFrigo').textContent = count(all, 'frigo');

  const bad = all.filter(i => i.s.level === 'bad').length;
  const warn = all.filter(i => i.s.level === 'warn').length;
  const bar = $('#alertBar');
  if (bad) {
    bar.textContent = `${bad} ${bad === 1 ? 'product ligt' : 'producten liggen'} er te lang in.` +
      (warn ? ` ${warn} binnenkort.` : '');
    bar.className = 'alert';
  } else if (warn) {
    bar.textContent = `${warn} ${warn === 1 ? 'product moet' : 'producten moeten'} binnenkort op.`;
    bar.className = 'alert warn';
  } else {
    bar.className = 'alert hidden';
  }

  updateBadge();
  const q = state.query.toLowerCase();
  const shown = all
    .filter(i => state.filter === 'alles' || i.location === state.filter)
    .filter(i => !q || i.name.toLowerCase().includes(q) || CAT[i.category].label.toLowerCase().includes(q))
    .sort((a, b) => a.s.left - b.s.left);

  const list = $('#list');
  list.replaceChildren();
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = state.items.length
      ? 'Niets gevonden.'
      : 'Nog niets in voorraad. Tik op Erin om te scannen. Nieuwe gsm? Haal je backup terug via het menu ⋮.';
    list.append(p);
    return;
  }
  for (const i of shown) {
    const el = document.createElement('div');
    el.className = `item ${i.s.level}`;
    el.innerHTML = `
      <span class="loc"></span>
      <div class="main">
        <div class="name"></div>
        <div class="meta"></div>
      </div>
      <span class="badge ${i.s.level}"></span>`;
    el.querySelector('.loc').textContent = LOC_ICON[i.location];
    if (i.photo) {
      const img = document.createElement('img');
      img.className = 'thumb';
      img.alt = '';
      photoUrl(i.id).then(url => { if (url) img.src = url; else img.remove(); });
      el.querySelector('.loc').replaceWith(img);
    }
    el.querySelector('.name').textContent = (i.qty > 1 ? `${i.qty}× ` : '') + i.name;
    el.querySelector('.meta').textContent =
      `${CAT[i.category].label} · erin ${fmtDate(i.added)} (${i.s.days ? humanDays(i.s.days) + " geleden" : "vandaag"})`;
    el.querySelector('.badge').textContent = badgeText(i.s);
    el.addEventListener('click', () => openItem({ id: i.id }));
    const row = document.createElement('div');
    row.className = 'swipe';
    const bg = document.createElement('div');
    bg.className = 'swipe-bg';
    bg.textContent = '－ Eruit';
    row.append(bg, el);
    attachSwipe(row, el, i.id);
    list.append(row);
  }
  const tip = document.createElement('p');
  tip.className = 'swipe-tip';
  tip.textContent = 'Tip: swipe een product naar links om het eruit te halen.';
  list.append(tip);
}
function count(all, loc) {
  const n = all.filter(i => i.location === loc).length;
  return n ? `(${n})` : '';
}

let toastTimer;
// Korte melding onderaan. actions: lijst van { label, run } voor knoppen.
function toast(msg, actions = []) {
  if (!Array.isArray(actions)) actions = actions ? [actions] : [];
  const t = $('#toast');
  $('#toastMsg').textContent = msg;
  const box = $('#toastActions');
  box.replaceChildren();
  for (const a of actions) {
    const btn = document.createElement('button');
    btn.textContent = a.label;
    btn.addEventListener('click', () => { t.classList.add('hidden'); a.run(); });
    box.append(btn);
  }
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), actions.length ? 7000 : 2800);
}

// ---------- Scanner ----------

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'qr_code'];
let stream = null;
let loopTimer = null;
let detectorPromise = null;
let scanBusy = false;

// Ingebouwde scanner (Android Chrome) als die EAN kent, anders de meegeleverde ZXing-scanner (iPhone).
function getDetector() {
  if (!detectorPromise) detectorPromise = (async () => {
    if ('BarcodeDetector' in window) {
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        if (supported.includes('ean_13')) {
          return new window.BarcodeDetector({ formats: FORMATS.filter(f => supported.includes(f)) });
        }
      } catch {}
    }
    const api = window.BarcodeDetectionAPI;
    if (!api) throw new Error('scanner niet geladen');
    const wasm = new URL('vendor/zxing_reader.wasm', location.href).href;
    await api.prepareZXingModule({
      overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasm : prefix + path) },
      fireImmediately: true,
    });
    return new api.BarcodeDetector({ formats: FORMATS });
  })();
  detectorPromise.catch(() => { detectorPromise = null; });
  return detectorPromise;
}

async function openScan(mode) {
  state.mode = mode;
  $('#scanTitle').textContent = mode === 'in' ? 'Scan wat erin gaat' : 'Scan wat eruit gaat';
  $('#noBarcode').textContent = mode === 'in' ? 'Zonder barcode toevoegen' : 'Kies uit de lijst';
  $('#manualCode').value = '';
  $('#scanMsg').textContent = 'Camera starten...';
  state.batch = null;
  $('#batchToggle').classList.toggle('hidden', mode !== 'in');
  renderBatch();
  $('#scanDlg').showModal();
  scanBusy = false;
  await startCamera();
}

async function startCamera() {
  const video = $('#video');
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
  } catch {
    stream = null;
    $('#scanMsg').textContent = 'Geen toegang tot de camera. Maak een foto van de barcode of typ hem hieronder.';
    return;
  }
  if (!$('#scanDlg').open) { stopCamera(); return; }
  const track = stream.getVideoTracks()[0];
  try { await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }); } catch {}
  video.srcObject = stream;
  try { await video.play(); } catch {}
  let detector;
  try {
    detector = await getDetector();
  } catch {
    $('#scanMsg').textContent = 'Scanner laden mislukt. Typ de barcode hieronder.';
    return;
  }
  $('#scanMsg').textContent = 'Hou de barcode in het kader, 10 à 15 cm van de camera.';
  const tick = async () => {
    if (!stream || scanBusy) return;
    if (video.readyState >= 2 && video.videoWidth) {
      try {
        const found = await detector.detect(video);
        const hit = found.find(b => b.rawValue);
        if (hit) {
          onCode(hit.rawValue);
          if (!state.batch) return;
          // Snel scannen: blijven kijken. addToBatch negeert dezelfde barcode zolang hij in beeld blijft.
          loopTimer = setTimeout(tick, 300);
          return;
        }
        emptyTicks += 1;
      } catch {}
    }
    loopTimer = setTimeout(tick, 150);
  };
  tick();
}

function stopCamera() {
  clearTimeout(loopTimer);
  loopTimer = null;
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  const video = $('#video');
  video.pause();
  video.srcObject = null;
}

async function closeScan() {
  stopCamera();
  if ($('#scanDlg').open) $('#scanDlg').close();
}

// Reserve: foto van de barcode. Een foto is scherper dan het live beeld.
async function scanPhoto(file) {
  $('#scanMsg').textContent = 'Foto bekijken...';
  try {
    const detector = await getDetector();
    const bitmap = await createImageBitmap(file);
    const found = await detector.detect(bitmap);
    const hit = found.find(b => b.rawValue);
    if (hit) { onCode(hit.rawValue); return; }
    $('#scanMsg').textContent = 'Geen barcode gevonden. Neem de foto van dichterbij en zorg dat hij scherp is.';
  } catch {
    $('#scanMsg').textContent = 'Foto lezen mislukt. Typ de barcode hieronder.';
  }
}

async function onCode(code, typed = false) {
  if (state.batch && state.mode === 'in') { addToBatch(String(code).trim(), typed); return; }
  if (scanBusy) return;
  scanBusy = true;
  code = String(code).trim();
  if (navigator.vibrate) navigator.vibrate(80);
  await closeScan();
  if (state.mode === 'in') await handleIn(code);
  else handleOut(code);
}

// ---------- Snel scannen ----------
// De camera blijft open. Elke scan komt in een lijst; op het einde sla je alles in één keer op.

let lastBatchCode = '';
let emptyTicks = 0;   // aantal keer na elkaar dat de camera geen barcode zag

function toggleBatch() {
  state.batch = state.batch ? null : [];
  renderBatch();
  if (state.batch) $('#scanMsg').textContent = 'Scan het ene product na het andere. Tik op Alles opslaan als je klaar bent.';
}

// Dezelfde barcode telt pas opnieuw als hij tussendoor uit beeld was.
// Zo telt een product dat je stil voor de camera houdt maar één keer.
function addToBatch(code, typed = false) {
  if (!code) return;
  if (!typed) {
    const outOfView = emptyTicks >= 2;
    emptyTicks = 0;
    if (code === lastBatchCode && !outOfView) return;
    lastBatchCode = code;
  }
  if (navigator.vibrate) navigator.vibrate(60);
  const same = state.batch.find(e => e.barcode === code);
  if (same) {
    same.qty += 1;
    $('#scanMsg').textContent = `${same.name || 'Product'}: nu ${same.qty} stuks`;
    renderBatch();
    return;
  }
  const known = state.products[code];
  const entry = {
    key: uid(),
    barcode: code,
    name: known?.name || '',
    category: known?.category || 'ander',
    location: known?.location || (state.filter === 'frigo' ? 'frigo' : 'diepvries'),
    qty: 1,
    loading: !known,
  };
  state.batch.unshift(entry);
  $('#scanMsg').textContent = `Gescand: ${entry.name || code}`;
  renderBatch();
  if (!known) {
    lookup(code, true).then(prod => {
      entry.loading = false;
      if (prod) {
        if (!entry.name) entry.name = prod.name;
        if (prod.category) entry.category = prod.category;
        if (prod.location) entry.location = prod.location;
        $('#scanMsg').textContent = `Gescand: ${entry.name}`;
      } else {
        $('#scanMsg').textContent = `Niet gevonden: ${code}. Typ zelf een naam.`;
      }
      renderBatch();
    });
  }
}

function renderBatch() {
  const on = !!state.batch;
  $('#batchToggle').classList.toggle('on', on);
  $('#batchToggle').textContent = on ? '⚡ Snel scannen staat aan' : '⚡ Snel scannen: meerdere na elkaar';
  $('#batchPanel').classList.toggle('hidden', !on);
  $('#scanDlg').classList.toggle('batch', on);
  $('#noBarcode').classList.toggle('hidden', on);
  if (!on) return;
  const box = $('#batchList');
  box.replaceChildren();
  if (!state.batch.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'Nog niets gescand.';
    box.append(p);
  }
  for (const e of state.batch) {
    const row = document.createElement('div');
    row.className = 'batch-row' + (!e.name && !e.loading && e.missing ? ' missing' : '');
    row.innerHTML = `
      <button type="button" class="loc-btn" aria-label="Diepvries of frigo"></button>
      <input placeholder="Naam" autocomplete="off">
      <span class="qty"><button type="button">−</button><b></b><button type="button">+</button></span>
      <button type="button" class="del" aria-label="Verwijderen">✕</button>
      <select></select>`;
    const [locBtn, minus, plus, del] = [row.querySelector('.loc-btn'), ...row.querySelectorAll('.qty button'), row.querySelector('.del')];
    locBtn.textContent = LOC_ICON[e.location];
    locBtn.addEventListener('click', () => { e.location = e.location === 'diepvries' ? 'frigo' : 'diepvries'; renderBatch(); });
    const input = row.querySelector('input');
    input.value = e.name;
    if (e.loading) input.placeholder = 'Opzoeken...';
    input.addEventListener('input', () => { e.name = input.value; e.missing = false; });
    input.addEventListener('change', () => {
      if (e.category === 'ander') { const g = guessCategory(e.name); if (g) { e.category = g; renderBatch(); } }
    });
    row.querySelector('.qty b').textContent = e.qty;
    minus.addEventListener('click', () => { if (e.qty > 1) { e.qty -= 1; renderBatch(); } });
    plus.addEventListener('click', () => { e.qty += 1; renderBatch(); });
    del.addEventListener('click', () => { state.batch = state.batch.filter(x => x !== e); renderBatch(); });
    const sel = row.querySelector('select');
    sel.replaceChildren(...CATEGORIES.map(c => new Option(c.label, c.id)));
    sel.value = e.category;
    sel.addEventListener('change', () => { e.category = sel.value; });
    box.append(row);
  }
  const n = state.batch.reduce((t, e) => t + e.qty, 0);
  $('#batchSave').textContent = n ? `Alles opslaan (${n})` : 'Alles opslaan';
  $('#batchSave').disabled = !n;
}

async function saveBatch() {
  const list = state.batch || [];
  const missing = list.filter(e => !e.name.trim());
  if (missing.length) {
    missing.forEach(e => { e.missing = true; });
    renderBatch();
    $('#scanMsg').textContent = `Vul nog ${missing.length === 1 ? 'één naam' : missing.length + ' namen'} in (rood omrand).`;
    return;
  }
  const added = toISO(today());
  for (const e of list.slice().reverse()) {
    const data = { barcode: e.barcode, name: e.name.trim(), location: e.location, category: e.category, qty: e.qty, added, expiry: '' };
    state.items.push({ id: uid(), ...data });
    if (e.barcode) state.products[e.barcode] = { name: data.name, category: data.category, location: data.location };
  }
  const n = list.reduce((t, e) => t + e.qty, 0);
  state.batch = null;
  save();
  await closeScan();
  render();
  toast(`${n} ${n === 1 ? 'product' : 'producten'} opgeslagen`);
}

// Niet per ongeluk een halve lijst kwijtspelen.
function confirmDropBatch() {
  if (!state.batch || !state.batch.length) return true;
  return confirm(`Je hebt ${state.batch.length} gescande producten nog niet opgeslagen. Toch sluiten?`);
}

// ---------- Erin ----------

async function handleIn(code) {
  let prod = code ? state.products[code] : null;
  if (code && !prod) {
    toast('Product opzoeken...');
    prod = await lookup(code);
  }
  openItem({ barcode: code, prod });
}

async function fetchProduct(code) {
  const fields = [
    'product_name', 'product_name_nl', 'product_name_fr', 'product_name_en', 'generic_name_nl', 'generic_name',
    'brands', 'categories_tags', 'food_groups_tags', 'quantity',
  ].join(',');
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (res.status === 404) return null;
      if (res.ok) {
        const data = await res.json();
        return data.status === 1 ? data.product : null;
      }
    } catch {
      // netwerkfout: één keer opnieuw proberen
    } finally {
      clearTimeout(t);
    }
  }
  throw new Error('offline');
}

// Zoekt het product op. Geeft { name, category, location } of null.
async function lookup(code, quiet = false) {
  const say = msg => { if (!quiet) toast(msg); };
  let p;
  try { p = await fetchProduct(code); }
  catch { say('Geen verbinding, typ zelf een naam'); return null; }
  if (!p) { say('Product niet gevonden, typ zelf een naam'); return null; }
  const base = (p.product_name_nl || p.product_name || p.product_name_fr || p.product_name_en ||
    p.generic_name_nl || p.generic_name || '').trim();
  const brand = (p.brands || '').split(',')[0].trim();
  // Merk niet dubbel tonen als het al in de naam staat.
  const name = (brand && !base.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${base}` : base).trim();
  const tags = [...(p.categories_tags || []), ...(p.food_groups_tags || [])];
  const nameForGuess = [base, p.generic_name_nl, p.generic_name].filter(Boolean).join(' ');
  const category = guessCategory(nameForGuess, tags);
  if (!name && !category) { say('Product niet gevonden, typ zelf een naam'); return null; }
  return { name, category, location: guessLocation(tags, category), size: (p.quantity || '').trim() };
}

function matchRules(rules, text, wordStart) {
  const t = ` ${text.toLowerCase()} `;
  for (const [id, words] of rules) {
    for (const w of words) {
      if (w.startsWith('^')) {
        const word = w.slice(1).replace(/\$$/, '');
        const re = new RegExp(`[^a-zà-ÿœ]${word.replace(/[.*+?()[\]\\]/g, '\\$&')}${w.endsWith('$') ? '[^a-zà-ÿœ]' : ''}`);
        if (re.test(t)) return id;
      } else if (t.includes(w)) return id;
    }
  }
  return null;
}

// Eerst de naam die je zelf eerder gaf, dan de naam, dan de categorieën van Open Food Facts.
function guessCategory(name, tags = []) {
  const known = Object.values(state.products).find(p => p.name.toLowerCase() === name.trim().toLowerCase());
  if (known) return known.category;
  return matchRules(NAME_RULES, name) || matchRules(TAG_RULES, tags.join(' ')) || null;
}

// Diepvries of frigo raden uit de categorieën van Open Food Facts.
function guessLocation(tags, category) {
  const t = tags.join(' ');
  if (/frozen|surgel|diepvries|tiefkühl|ice-cream/.test(t) || category === 'ijs') return 'diepvries';
  if (/chilled|fresh|dairies|dairy|cheese|cold-cut|yogurt|refrigerated/.test(t)) return 'frigo';
  if (['zuivel', 'kaas', 'beleg', 'eieren', 'saus'].includes(category)) return 'frigo';
  return null;
}

function fillCategories() {
  const sel = $('#itemForm').elements.category;
  sel.replaceChildren(...CATEGORIES.map(c => new Option(c.label, c.id)));
}

function openItem({ id = null, barcode = '', prod = null }) {
  const f = $('#itemForm');
  f.reset();
  state.editingId = id;
  const item = id ? state.items.find(i => i.id === id) : null;
  const src = item || {
    barcode,
    name: prod?.name || '',
    location: prod?.location || (state.filter === 'frigo' ? 'frigo' : 'diepvries'),
    category: prod?.category || 'ander',
    qty: 1,
    added: toISO(today()),
    expiry: '',
  };
  f.dataset.barcode = src.barcode || '';
  f.elements.name.value = src.name;
  f.elements.location.value = src.location;
  f.elements.category.value = src.category;
  f.elements.qty.value = src.qty;
  f.elements.added.value = src.added;
  f.elements.expiry.value = src.expiry || '';
  $('#itemTitle').textContent = item ? 'Bewerken' : 'Erin';
  $('#itemBarcode').textContent = [
    src.barcode && `Barcode ${src.barcode}`,
    prod?.size,
    prod?.name && 'herkend',
  ].filter(Boolean).join(' · ');
  f.elements.calendar.checked = !item && calendarPref();
  state.pendingPhoto = undefined;
  showFormPhoto(null);
  if (item?.photo) photoUrl(item.id).then(url => { if (state.editingId === item.id) showFormPhoto(url); });
  $('#itemDelete').classList.toggle('hidden', !item);
  $('#itemDelete').textContent = item && item.qty > 1 ? 'Eén eruit' : 'Eruit';
  updateHint();
  $('#itemDlg').showModal();
  if (!src.name) setTimeout(() => f.elements.name.focus(), 50);
}

function updateHint() {
  const f = $('#itemForm');
  const c = CAT[f.elements.category.value];
  const loc = f.elements.location.value;
  $('#itemHint').textContent =
    `Richtlijn ${loc}: ${humanDays(c[loc])}. ` +
    (loc === 'frigo' ? 'Staat er een THT op de verpakking, vul die in.' : 'Ingevroren op de erin-datum.');
}

function saveItem(e) {
  e.preventDefault();
  const f = $('#itemForm');
  const data = {
    barcode: f.dataset.barcode || '',
    name: f.elements.name.value.trim(),
    location: f.elements.location.value,
    category: f.elements.category.value,
    qty: Math.max(1, parseInt(f.elements.qty.value, 10) || 1),
    added: f.elements.added.value || toISO(today()),
    expiry: f.elements.expiry.value || '',
  };
  if (!data.name) return;
  let id = state.editingId;
  if (id) {
    Object.assign(state.items.find(i => i.id === id), data);
    toast('Aangepast');
  } else {
    id = uid();
    state.items.push({ id, ...data });
    toast(`${data.name} staat in de ${data.location}`);
  }
  const target = state.items.find(i => i.id === id);
  if (state.pendingPhoto) {
    target.photo = true;
    photoPut(id, state.pendingPhoto);
  } else if (state.pendingPhoto === null) {
    delete target.photo;
    photoDel(id);
  }
  state.pendingPhoto = undefined;
  if (data.barcode) {
    state.products[data.barcode] = { name: data.name, category: data.category, location: data.location };
  }
  const wantsCalendar = f.elements.calendar.checked;
  if (!state.editingId) setCalendarPref(wantsCalendar);
  save();
  $('#itemDlg').close();
  render();
  if (wantsCalendar) {
    const saved = state.editingId ? state.items.find(i => i.id === state.editingId) : state.items[state.items.length - 1];
    downloadCalendar([saved], `herinnering-${slug(saved.name)}.ics`);
  }
}

// ---------- Agenda ----------

function calendarPref() {
  try { return localStorage.getItem('dvv.calendar') === '1'; } catch { return false; }
}
function setCalendarPref(on) {
  try { localStorage.setItem('dvv.calendar', on ? '1' : '0'); } catch {}
}
function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'product';
}
function icsText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/[;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
}
// Regels langer dan 75 tekens afbreken, zoals de agenda-standaard vraagt.
function icsFold(line) {
  const out = [];
  while (line.length > 74) { out.push(line.slice(0, 74)); line = ' ' + line.slice(74); }
  out.push(line);
  return out.join('\r\n');
}
function icsDate(d, hh = 9, mm = 0) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}T${z(hh)}${z(mm)}00`;
}

// Eén afspraak per product, om 9 u op de dag dat het op moet.
// Alarm op die dag, en op voorhand: diepvries 7 dagen, frigo 1 dag.
function buildCalendar(items) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Diepvriesvoorraad//NL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const i of items) {
    const limit = limitDate(i);
    const day = limit < today() ? today() : limit;
    const where = i.location === 'diepvries' ? 'diepvries' : 'frigo';
    const ahead = i.location === 'diepvries' ? 7 : 1;
    const daysLeft = Math.round((day - today()) / DAY);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${i.id}@diepvriesvoorraad`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(day, 9, 0)}`,
      `DTEND:${icsDate(day, 9, 15)}`,
      icsFold(`SUMMARY:${icsText(`${i.name} moet op (${where})`)}`),
      icsFold(`DESCRIPTION:${icsText(`Erin sinds ${fmtDate(i.added)}. Vandaag is de houdbaarheid in de ${where} om.`)}`),
      'BEGIN:VALARM', 'ACTION:DISPLAY', icsFold(`DESCRIPTION:${icsText(`${i.name} moet vandaag op`)}`), 'TRIGGER:PT0M', 'END:VALARM',
    );
    if (daysLeft > ahead) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY',
        icsFold(`DESCRIPTION:${icsText(`${i.name} moet binnenkort op`)}`), `TRIGGER:-P${ahead}D`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

function downloadCalendar(items, filename) {
  if (!items.length) { toast('Er zit nog niets in de voorraad'); return; }
  const blob = new Blob([buildCalendar(items)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  toast('Tik op "Voeg toe" om de herinnering in je agenda te zetten');
}

// ---------- Eruit ----------

function handleOut(code) {
  const matches = state.items
    .filter(i => !code || i.barcode === code)
    .sort((a, b) => status(a).left - status(b).left);
  if (!matches.length) {
    const known = state.products[code];
    toast(known ? `${known.name} zit niet in de voorraad` : 'Dit product zit niet in de voorraad');
    return;
  }
  if (matches.length === 1 && code) {
    takeOut(matches[0].id);
    return;
  }
  openPick(matches);
}

function openPick(matches) {
  const box = $('#pickList');
  box.replaceChildren();
  for (const i of matches) {
    const s = status(i);
    const b = document.createElement('button');
    b.className = 'pick';
    b.innerHTML = '<span></span><span class="badge"></span>';
    b.firstChild.textContent = `${LOC_ICON[i.location]} ${i.qty > 1 ? i.qty + '× ' : ''}${i.name} · ${fmtDate(i.added)}`;
    b.lastChild.textContent = badgeText(s);
    b.lastChild.classList.add(s.level);
    b.addEventListener('click', () => { $('#pickDlg').close(); takeOut(i.id); });
    box.append(b);
  }
  $('#pickDlg').showModal();
}

function takeOut(id) {
  const idx = state.items.findIndex(i => i.id === id);
  if (idx < 0) return;
  const item = state.items[idx];
  const before = { ...item };
  const undo = {
    label: 'Ongedaan',
    run: () => {
      const cur = state.items.find(i => i.id === id);
      if (cur) cur.qty = before.qty;
      else state.items.splice(Math.min(idx, state.items.length), 0, before);
      save();
      render();
      toast(`${before.name} staat er terug in`);
    },
  };
  if (item.qty > 1) {
    item.qty -= 1;
    toast(`${item.name} eruit, nog ${item.qty} over`, [undo]);
  } else {
    state.items.splice(idx, 1);
    // Foto pas later wissen, zodat ongedaan maken nog kan.
    if (item.photo) setTimeout(() => { if (!state.items.some(i => i.id === id)) photoDel(id); }, 10000);
    const same = i => (item.barcode && i.barcode === item.barcode) || i.name.toLowerCase() === item.name.toLowerCase();
    if (state.items.some(same) || onShoppingList(item.name)) {
      toast(`${item.name} eruit`, [undo]);
    } else {
      toast(`${item.name} is op.`, [undo, { label: '🛒 Op lijst', run: () => addShopping(item.name) }]);
    }
  }
  save();
  render();
}

// Swipe naar links om één stuk eruit te halen.
function attachSwipe(row, card, id) {
  let x0 = 0, y0 = 0, dx = 0, tracking = false, dragging = false, moved = false;
  const reset = () => {
    card.classList.remove('dragging');
    card.style.transform = '';
    setTimeout(() => { if (!dragging) row.classList.remove('active'); }, 200);
  };
  card.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    x0 = e.clientX; y0 = e.clientY; dx = 0;
    tracking = true; dragging = false; moved = false;
  });
  card.addEventListener('pointermove', e => {
    if (!tracking) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (!dragging) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      // Verticaal of naar rechts: gewoon scrollen.
      if (Math.abs(my) > Math.abs(mx) || mx > 0) { tracking = false; return; }
      dragging = true;
      moved = true;
      card.classList.add('dragging');
      row.classList.add('active');
      try { card.setPointerCapture(e.pointerId); } catch {}
    }
    dx = Math.min(0, mx);
    card.style.transform = `translateX(${dx}px)`;
  });
  const end = () => {
    if (!tracking) return;
    tracking = false;
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    if (dx < -Math.min(110, row.offsetWidth * 0.3)) {
      card.style.transform = 'translateX(-110%)';
      if (navigator.vibrate) navigator.vibrate(30);
      setTimeout(() => takeOut(id), 180);
    } else {
      reset();
    }
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', () => { tracking = false; dragging = false; reset(); });
  // Na een swipe geen klik doorlaten.
  card.addEventListener('click', e => {
    if (moved) { e.stopImmediatePropagation(); moved = false; }
  }, true);
}

// ---------- Boodschappenlijst ----------

function onShoppingList(name) {
  return state.shopping.some(s => !s.done && s.name.toLowerCase() === name.trim().toLowerCase());
}

function addShopping(name) {
  name = name.trim();
  if (!name) return;
  if (onShoppingList(name)) { toast(`${name} staat al op je lijst`); return; }
  state.shopping.push({ id: uid(), name, done: false });
  save();
  renderShopping();
  toast(`${name} staat op je boodschappenlijst`);
}

function renderShopping() {
  const open = state.shopping.filter(s => !s.done).length;
  const dot = $('#shopCount');
  dot.textContent = open;
  dot.classList.toggle('hidden', !open);

  const ul = $('#shopList');
  ul.replaceChildren();
  if (!state.shopping.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'Je lijst is leeg.';
    ul.append(li);
    return;
  }
  // Open items eerst, afgevinkte onderaan.
  const sorted = [...state.shopping].sort((a, b) => a.done - b.done);
  for (const s of sorted) {
    const li = document.createElement('li');
    li.className = s.done ? 'done' : '';
    li.innerHTML = '<input type="checkbox"><span></span><button aria-label="Verwijderen">✕</button>';
    const cb = li.querySelector('input');
    cb.checked = s.done;
    cb.addEventListener('change', () => { s.done = cb.checked; save(); renderShopping(); });
    li.querySelector('span').textContent = s.name;
    li.querySelector('span').addEventListener('click', () => { s.done = !s.done; save(); renderShopping(); });
    li.querySelector('button').addEventListener('click', () => {
      state.shopping = state.shopping.filter(x => x.id !== s.id);
      save();
      renderShopping();
    });
    ul.append(li);
  }
}

async function shareShopping() {
  const open = state.shopping.filter(s => !s.done).map(s => `- ${s.name}`);
  if (!open.length) { toast('Er staat niets op je lijst'); return; }
  const text = `Boodschappen:\n${open.join('\n')}`;
  try {
    if (navigator.share) { await navigator.share({ text }); return; }
  } catch (e) {
    if (e.name === 'AbortError') return;
  }
  try { await navigator.clipboard.writeText(text); toast('Lijst gekopieerd'); }
  catch { toast('Delen lukt niet in deze browser'); }
}

// ---------- Wat kan ik koken ----------

const MEAT_CATS = ['rundvlees', 'varken', 'gehakt', 'gevogelte', 'beleg'];
const FISH_CATS = ['vis_vet', 'vis_mager', 'schaaldier'];
const DIET_ALLOWED = { veg: ['veg'], fish: ['veg', 'fish'], meat: ['veg', 'fish', 'meat'] };
const DIET_LABEL = { veg: 'vegetarisch', fish: 'vis en vegetarisch', meat: 'alles' };
const DIET_ICON = { veg: '🥦', fish: '🐟', meat: '🥩' };

// Eetstijl afleiden uit wat er in je diepvries en frigo ligt.
function autoDiet() {
  if (state.items.some(i => MEAT_CATS.includes(i.category))) return 'meat';
  if (state.items.some(i => FISH_CATS.includes(i.category))) return 'fish';
  return 'veg';
}
function dietChoice() { return lsGet('dvv.diet') || 'auto'; }
function currentDiet() { const c = dietChoice(); return c === 'auto' ? autoDiet() : c; }

// Getal dat elke dag anders is, zodat je elke dag andere nieuwe gerechten ziet.
function dailyRank(name) {
  let h = 0;
  for (const ch of name + toISO(today())) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// Score per gerecht: producten die te lang liggen tellen het zwaarst.
function suggestRecipes(diet) {
  const weight = { bad: 5, warn: 3, ok: 1 };
  const banned = diet === 'veg' ? [...MEAT_CATS, ...FISH_CATS] : diet === 'fish' ? MEAT_CATS : [];
  const stock = state.items.filter(i => !banned.includes(i.category)).map(i => ({ ...i, s: status(i) }));
  const allowed = RECIPES.filter(r => DIET_ALLOWED[diet].includes(r.diet));
  const pick = list => {
    // Per soort maar één product laten meetellen, het dringendste.
    const best = {};
    for (const i of list) if (!best[i.category] || i.s.left < best[i.category].s.left) best[i.category] = i;
    return Object.values(best);
  };
  const have = [];
  const discover = [];
  for (const r of allowed) {
    const mains = stock.filter(i => r.main.includes(i.category));
    const extras = pick(stock.filter(i => r.extra.includes(i.category) && !mains.includes(i)));
    if (mains.length) {
      const used = [...pick(mains), ...extras];
      const score = used.reduce((n, i) => n + weight[i.s.level] * (mains.includes(i) ? 2 : 1), 0);
      const urgent = used.some(i => i.s.level !== 'ok');
      have.push({ r, used: used.sort((a, b) => a.s.left - b.s.left), score: score + (urgent ? 100 : 0) });
    } else {
      discover.push({ r, used: extras, score: extras.length * 1000 + (dailyRank(r.name) % 1000) });
    }
  }
  return {
    have: have.sort((a, b) => b.score - a.score).slice(0, 10),
    discover: discover.sort((a, b) => b.score - a.score).slice(0, 8),
  };
}

function recipeCard({ r, used }, diet, missing) {
  const card = document.createElement('div');
  card.className = 'recipe';
  card.innerHTML = '<h4><span></span><span class="diet"></span></h4><div class="chips"></div><p class="need hidden"></p><p class="tip"></p><a target="_blank" rel="noopener">Recept zoeken →</a>';
  card.querySelector('h4 span').textContent = r.name;
  card.querySelector('.diet').textContent = `${DIET_ICON[r.diet]} ${{ veg: 'vegetarisch', fish: 'vis', meat: 'vlees' }[r.diet]}`;
  const chips = card.querySelector('.chips');
  for (const i of used) {
    const c = document.createElement('span');
    c.className = `badge ${i.s.level}`;
    c.textContent = `${LOC_ICON[i.location]} ${i.name}`;
    chips.append(c);
  }
  if (missing) {
    const need = card.querySelector('.need');
    need.classList.remove('hidden');
    need.textContent = 'Nog kopen: ' + r.main.map(c => CAT[c].label.toLowerCase()).join(' of ');
  }
  card.querySelector('.tip').textContent = r.tip;
  const q = `recept ${r.name}${diet === 'veg' && !/vegetari|veggie/i.test(r.name) ? ' vegetarisch' : ''}`;
  card.querySelector('a').href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  return card;
}

function renderCook() {
  const choice = dietChoice();
  const diet = currentDiet();
  document.querySelectorAll('#dietTabs button').forEach(b => b.classList.toggle('active', b.dataset.diet === choice));
  $('#dietInfo').textContent = choice === 'auto'
    ? (state.items.length
      ? `Op basis van je voorraad: ${DIET_LABEL[diet]}. Wat eerst op moet staat bovenaan.`
      : 'Wat eerst op moet staat bovenaan.')
    : `Je ziet alleen gerechten: ${DIET_LABEL[diet]}.`;
  const box = $('#cookList');
  box.replaceChildren();
  const { have, discover } = suggestRecipes(diet);
  const head = text => { const h = document.createElement('h3'); h.className = 'cook-head'; h.textContent = text; box.append(h); };
  head('Met wat je hebt');
  if (!have.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = state.items.length
      ? 'Geen gerecht gevonden met wat je hebt. Kies bij je producten een soort, dan vindt de app meer.'
      : 'Je voorraad is leeg.';
    box.append(p);
  }
  for (const x of have) box.append(recipeCard(x, diet, false));
  if (discover.length) {
    head('Nieuw om te proberen');
    for (const x of discover) box.append(recipeCard(x, diet, true));
  }
}

// ---------- Menu ----------

function renderShelfTable() {
  const rows = CATEGORIES.map(c =>
    `<tr><td>${c.label}</td><td>${humanDays(c.diepvries)}</td><td>${humanDays(c.frigo)}</td></tr>`).join('');
  $('#shelfTable').innerHTML =
    `<table><thead><tr><th>Soort</th><th>Diepvries</th><th>Frigo</th></tr></thead><tbody>${rows}</tbody></table>`;
}

async function exportData() {
  const photos = {};
  for (const i of state.items) {
    if (!i.photo) continue;
    const blob = await photoGet(i.id);
    if (blob) photos[i.id] = await blobToDataUrl(blob);
  }
  const blob = new Blob(
    [JSON.stringify({ items: state.items, products: state.products, shopping: state.shopping, photos, exported: new Date().toISOString() }, null, 2)],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `voorraad-${toISO(today())}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.items)) throw new Error();
    const valid = data.items.filter(i => i && i.name && CAT[i.category] && WARN_DAYS[i.location] !== undefined && i.added);
    if (!confirm(`${valid.length} producten terugzetten? De huidige lijst wordt vervangen.`)) return;
    state.items = valid.map(i => ({ ...i, id: i.id || uid(), qty: i.qty || 1 }));
    state.products = data.products || {};
    state.shopping = Array.isArray(data.shopping) ? data.shopping : state.shopping;
    for (const [id, url] of Object.entries(data.photos || {})) {
      try { await photoPut(id, await (await fetch(url)).blob()); } catch {}
    }
    renderShopping();
    save();
    render();
    $('#menuDlg').close();
    toast('Backup teruggezet');
  } catch {
    toast('Dit bestand is geen geldige backup');
  }
}

async function enableNotify() {
  if (!('Notification' in window)) {
    toast('Meldingen werken alleen als de app op je beginscherm staat');
    return;
  }
  const p = await Notification.requestPermission();
  toast(p === 'granted' ? 'Je krijgt een melding als je de app opent en er iets op moet' : 'Meldingen staan uit');
  if (p === 'granted') { updateBadge(); notifyOnce(true); }
}

// Rood getal op het app-icoon: aantal producten dat te lang ligt of binnenkort op moet.
function updateBadge() {
  if (!('setAppBadge' in navigator)) return;
  const n = state.items.filter(i => status(i).level !== 'ok').length;
  (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {});
}

async function notifyOnce(force = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const key = 'dvv.notified';
  const d = toISO(today());
  try { if (!force && localStorage.getItem(key) === d) return; } catch {}
  const all = state.items.map(i => ({ i, s: status(i) }));
  const bad = all.filter(x => x.s.level === 'bad').map(x => x.i.name);
  const warn = all.filter(x => x.s.level === 'warn').map(x => x.i.name);
  if (!bad.length && !warn.length) return;
  try { localStorage.setItem(key, d); } catch {}
  const list = names => names.slice(0, 3).join(', ') + (names.length > 3 ? ` en ${names.length - 3} meer` : '');
  const body = [bad.length && `Te lang: ${list(bad)}.`, warn.length && `Binnenkort op: ${list(warn)}.`]
    .filter(Boolean).join(' ');
  const title = bad.length ? 'Er ligt iets te lang in' : 'Er moet iets op';
  const opts = { body, icon: 'icon.svg', badge: 'icon.svg', tag: 'voorraad' };
  // iPhone kent alleen meldingen via de service worker.
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) { await reg.showNotification(title, opts); return; }
  } catch {}
  try { new Notification(title, opts); } catch {}
}

// ---------- Foto's ----------
// Foto's staan in IndexedDB: daar is meer plaats dan in localStorage.

let dbPromise = null;
function db() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open('dvv', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('photos');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}
async function photoTx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('photos', mode);
    const req = fn(tx.objectStore('photos'));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
  });
}
const photoUrls = new Map();
async function photoGet(id) {
  try { return await photoTx('readonly', st => st.get(id)); } catch { return null; }
}
async function photoPut(id, blob) {
  try {
    await photoTx('readwrite', st => st.put(blob, id));
    if (photoUrls.has(id)) URL.revokeObjectURL(photoUrls.get(id));
    photoUrls.delete(id);
    render();
  } catch { toast('Foto opslaan mislukt'); }
}
async function photoDel(id) {
  try { await photoTx('readwrite', st => st.delete(id)); } catch {}
  if (photoUrls.has(id)) URL.revokeObjectURL(photoUrls.get(id));
  photoUrls.delete(id);
}
async function photoUrl(id) {
  if (photoUrls.has(id)) return photoUrls.get(id);
  const blob = await photoGet(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  photoUrls.set(id, url);
  return url;
}
function blobToDataUrl(blob) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(blob);
  });
}
// Foto verkleinen tot max 480 px, zodat er veel in passen.
async function shrinkPhoto(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 480 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.75));
}
function showFormPhoto(url) {
  const img = $('#itemPhoto');
  img.classList.toggle('hidden', !url);
  if (url) img.src = url; else img.removeAttribute('src');
  $('#itemPhotoDel').classList.toggle('hidden', !url);
}

// ---------- Meldingen als de app dicht is ----------
// De service worker leest items.json om de tekst van de melding te maken.
// De server krijgt alleen datums, geen namen.

const PUSH_URL_KEY = 'dvv.pushServer';
const DEFAULT_PUSH_SERVER = 'https://voorraad-push.artbox2009.workers.dev';

function stockForSw() {
  return state.items.map(i => {
    const limit = limitDate(i);
    const warnFrom = new Date(limit.getTime() - WARN_DAYS[i.location] * DAY);
    return { name: i.name, location: i.location, limit: toISO(limit), warnFrom: toISO(warnFrom) };
  });
}

async function writeSwData() {
  try {
    const c = await caches.open('dvv-data');
    await c.put('items.json', new Response(JSON.stringify(stockForSw()), { headers: { 'Content-Type': 'application/json' } }));
  } catch {}
}

// Datums waarop een melding moet komen: begin van oranje, de dag zelf, en daarna wekelijks nog 2 keer.
function pushDates() {
  const t = toISO(today());
  const dates = new Set();
  let lastPast = '';
  for (const x of stockForSw()) {
    const limit = fromISO(x.limit);
    for (const d of [x.warnFrom, x.limit, toISO(new Date(limit.getTime() + 7 * DAY)), toISO(new Date(limit.getTime() + 14 * DAY))]) {
      if (d >= t) dates.add(d);
      else if (d > lastPast) lastPast = d;
    }
  }
  // Eén datum uit het verleden volstaat om een melding te krijgen voor wat nu al te lang ligt.
  if (lastPast) dates.add(lastPast);
  return [...dates].sort();
}

function pushServer() {
  try { return (localStorage.getItem(PUSH_URL_KEY) || '').replace(/\/+$/, ''); } catch { return ''; }
}

async function pushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

let pushTimer = null;
function schedulePushSync() {
  if (!pushServer()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(syncPush, 1500);
}

async function syncPush() {
  const server = pushServer();
  if (!server) return false;
  try {
    const sub = await pushSubscription();
    if (!sub) return false;
    const res = await fetch(`${server}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), dates: pushDates() }),
    });
    return res.ok;
  } catch { return false; }
}

function b64ToBytes(b64) {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - b64.length % 4) % 4));
  return Uint8Array.from(s, c => c.charCodeAt(0));
}

async function enablePush(url) {
  const status = $('#pushStatus');
  url = url.trim().replace(/\/+$/, '');
  if (!/^https:\/\/.+/.test(url)) { status.textContent = 'Plak het volledige adres, beginnend met https://'; return; }
  if (!('PushManager' in window)) {
    status.textContent = 'Dit werkt alleen als je de app opent via het icoon op je beginscherm (iPhone met iOS 16.4 of nieuwer).';
    return;
  }
  status.textContent = 'Verbinden...';
  let key;
  try {
    const res = await fetch(`${url}/key`);
    key = (await res.json()).publicKey;
    if (!key) throw new Error();
  } catch {
    status.textContent = 'De server antwoordt niet. Kijk of het adres klopt.';
    return;
  }
  if (await Notification.requestPermission() !== 'granted') {
    status.textContent = 'Je gaf geen toestemming voor meldingen. Zet ze aan bij Instellingen, Meldingen, Voorraad.';
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    // Andere server dan vroeger: opnieuw inschrijven met de nieuwe sleutel.
    if (sub && pushServer() !== url) { await sub.unsubscribe(); sub = null; }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
    try { localStorage.setItem(PUSH_URL_KEY, url); } catch {}
    await writeSwData();
    if (!await syncPush()) throw new Error();
    toast('Meldingen staan aan');
  } catch {
    status.textContent = 'Inschrijven mislukt. Probeer opnieuw.';
    return;
  }
  renderPushStatus();
}

async function disablePush() {
  const server = pushServer();
  try {
    const sub = await pushSubscription();
    if (sub) {
      if (server) await fetch(`${server}/unsubscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});
      await sub.unsubscribe();
    }
  } catch {}
  try { localStorage.removeItem(PUSH_URL_KEY); } catch {}
  toast('Meldingen staan uit');
  renderPushStatus();
}

async function testPush() {
  const sub = await pushSubscription().catch(() => null);
  if (!sub) { toast('Meldingen staan niet aan'); return; }
  try {
    const res = await fetch(`${pushServer()}/test`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    toast(res.ok ? 'Test verstuurd. Je krijgt zo een melding.' : 'Test mislukt');
  } catch { toast('Test mislukt'); }
}

async function renderPushStatus() {
  const server = pushServer();
  const sub = await pushSubscription().catch(() => null);
  const on = !!(server && sub);
  $('#pushUrl').value = server || DEFAULT_PUSH_SERVER;
  $('#pushStatus').textContent = on
    ? 'Aan. Je krijgt een melding in de ochtend als er iets op moet, ook als de app dicht is.'
    : '';
  $('#pushTest').classList.toggle('hidden', !on);
  $('#pushOff').classList.toggle('hidden', !on);
}

// ---------- Automatische backup ----------
// Alles wordt op je gsm versleuteld met je backupcode (AES-GCM). De server krijgt alleen
// onleesbare data en een id dat uit de code is afgeleid. Zonder code is de backup niet te lezen.

const BACKUP_CODE_KEY = 'dvv.backupCode';
const BACKUP_TIME_KEY = 'dvv.backupTime';
const BACKUP_PHOTOS_KEY = 'dvv.backupPhotos';
const CODE_CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

function newBackupCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const chars = [...bytes].map(b => CODE_CHARS[b % 32]).join('');
  return chars.match(/.{4}/g).join('-');
}
function normalizeCode(code) {
  const c = code.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1').replace(/[^0-9A-Z]/g, '');
  return c.length === 20 ? c.match(/.{4}/g).join('-') : null;
}
function backupCode() {
  let code = lsGet(BACKUP_CODE_KEY);
  if (!code) { code = newBackupCode(); lsSet(BACKUP_CODE_KEY, code); }
  return code;
}
function backupServerUrl() {
  return pushServer() || DEFAULT_PUSH_SERVER;
}

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}
async function backupKeys(code) {
  const norm = code.replace(/-/g, '');
  const id = [...await sha256(`dvv-id:${norm}`)].map(b => b.toString(16).padStart(2, '0')).join('');
  const key = await crypto.subtle.importKey('raw', await sha256(`dvv-key:${norm}`), 'AES-GCM', false, ['encrypt', 'decrypt']);
  return { id, key };
}
function bytesToB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
async function encryptBytes(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return bytesToB64(out);
}
async function decryptBytes(key, b64) {
  const all = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.subarray(0, 12) }, key, all.subarray(12)));
}

let backupTimer = null;
let backupBusy = false;
function scheduleBackup() {
  clearTimeout(backupTimer);
  backupTimer = setTimeout(runBackup, 5000);
}

async function runBackup() {
  if (backupBusy) { scheduleBackup(); return false; }
  if (!navigator.onLine) return false;
  backupBusy = true;
  try {
    const server = backupServerUrl();
    const { id, key } = await backupKeys(backupCode());
    const payload = { v: 1, saved: new Date().toISOString(), items: state.items, products: state.products, shopping: state.shopping };
    const body = await encryptBytes(key, new TextEncoder().encode(JSON.stringify(payload)));
    const res = await fetch(`${server}/backup/${id}`, { method: 'PUT', body });
    if (!res.ok) throw new Error(res.status === 404 ? 'old-server' : 'failed');

    // Foto's apart: alleen nieuwe uploaden, verwijderde wissen.
    let uploaded = [];
    try { uploaded = JSON.parse(lsGet(BACKUP_PHOTOS_KEY) || '[]'); } catch {}
    const want = state.items.filter(i => i.photo).map(i => i.id);
    for (const pid of want.filter(x => !uploaded.includes(x))) {
      const blob = await photoGet(pid);
      if (!blob) continue;
      const enc = await encryptBytes(key, new Uint8Array(await blob.arrayBuffer()));
      const r = await fetch(`${server}/backup/${id}/photo/${pid}`, { method: 'PUT', body: enc });
      if (r.ok) uploaded.push(pid);
    }
    for (const pid of uploaded.filter(x => !want.includes(x))) {
      const r = await fetch(`${server}/backup/${id}/photo/${pid}`, { method: 'DELETE' }).catch(() => null);
      if (r && r.ok) uploaded = uploaded.filter(x => x !== pid);
    }
    lsSet(BACKUP_PHOTOS_KEY, JSON.stringify(uploaded));
    lsSet(BACKUP_TIME_KEY, payload.saved);
    lsSet('dvv.backupError', '');
    return true;
  } catch (e) {
    lsSet('dvv.backupError', e.message === 'old-server' ? 'old-server' : 'failed');
    return false;
  } finally {
    backupBusy = false;
    if ($('#menuDlg').open) renderBackupStatus();
  }
}

async function restoreBackup(input) {
  const code = normalizeCode(input);
  if (!code) { toast('Een backupcode heeft 20 tekens, bv. ABCD-EFGH-JKMN-PQRS-TVWX'); return; }
  toast('Backup zoeken...');
  try {
    const server = backupServerUrl();
    const { id, key } = await backupKeys(code);
    const res = await fetch(`${server}/backup/${id}`);
    if (res.status === 404) { toast('Geen backup gevonden met deze code'); return; }
    if (!res.ok) throw new Error();
    const data = JSON.parse(new TextDecoder().decode(await decryptBytes(key, await res.text())));
    const when = new Date(data.saved).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    if (!confirm(`Backup van ${when} met ${data.items.length} producten terugzetten? Je huidige lijst wordt vervangen.`)) return;
    state.items = data.items.filter(i => i && i.name && CAT[i.category] && WARN_DAYS[i.location] !== undefined);
    state.products = data.products || {};
    state.shopping = Array.isArray(data.shopping) ? data.shopping : [];
    const got = [];
    for (const i of state.items.filter(x => x.photo)) {
      try {
        const r = await fetch(`${server}/backup/${id}/photo/${i.id}`);
        if (!r.ok) { delete i.photo; continue; }
        await photoPut(i.id, new Blob([await decryptBytes(key, await r.text())], { type: 'image/jpeg' }));
        got.push(i.id);
      } catch { delete i.photo; }
    }
    // Vanaf nu deze code gebruiken, zodat de backup op dezelfde plek verder loopt.
    lsSet(BACKUP_CODE_KEY, code);
    lsSet(BACKUP_PHOTOS_KEY, JSON.stringify(got));
    save();
    render();
    renderShopping();
    renderBackupStatus();
    $('#restoreCode').value = '';
    $('#menuDlg').close();
    toast(`Backup teruggezet: ${state.items.length} producten`);
  } catch {
    toast('Terughalen mislukt. Kijk of de code klopt.');
  }
}

function renderBackupStatus() {
  $('#backupCode').textContent = backupCode();
  const t = lsGet(BACKUP_TIME_KEY);
  const err = lsGet('dvv.backupError');
  const el = $('#backupStatus');
  if (err === 'old-server') {
    el.textContent = 'Backup werkt nog niet: je server moet eerst bijgewerkt worden.';
  } else if (t) {
    const when = new Date(t).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    el.textContent = `Automatisch aan. Laatste backup: ${when}.` + (err ? ' De laatste poging mislukte, de app probeert opnieuw.' : '');
  } else {
    el.textContent = err ? 'Backup mislukt. De app probeert opnieuw als je online bent.' : 'Automatisch aan. Nog geen backup gemaakt.';
  }
}

// ---------- Start ----------

function init() {
  fillCategories();
  renderShelfTable();

  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    state.filter = t.dataset.filter;
    render();
  }));
  $('#search').addEventListener('input', e => { state.query = e.target.value; render(); });

  $('#btnIn').addEventListener('click', () => openScan('in'));
  $('#btnOut').addEventListener('click', () => openScan('out'));

  $('#manualForm').addEventListener('submit', e => {
    e.preventDefault();
    const code = $('#manualCode').value.trim();
    if (state.batch) $('#manualCode').value = '';
    if (code) onCode(code, true);
  });
  $('#noBarcode').addEventListener('click', async () => {
    await closeScan();
    if (state.mode === 'in') openItem({});
    else handleOut('');
  });

  document.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', () => {
      const dlg = b.closest('dialog');
      if (dlg.id === 'scanDlg' && !confirmDropBatch()) return;
      dlg.close();
    }));
  $('#scanDlg').addEventListener('cancel', e => { if (!confirmDropBatch()) e.preventDefault(); });
  $('#batchToggle').addEventListener('click', () => {
    if (state.batch && state.batch.length && !confirmDropBatch()) return;
    toggleBatch();
  });
  $('#batchSave').addEventListener('click', saveBatch);
  $('#scanDlg').addEventListener('close', stopCamera);
  $('#photoInput').addEventListener('change', e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) scanPhoto(file);
  });

  const f = $('#itemForm');
  f.addEventListener('submit', saveItem);
  f.elements.category.addEventListener('change', updateHint);
  f.querySelectorAll('[name=location]').forEach(r => r.addEventListener('change', updateHint));
  f.elements.name.addEventListener('blur', () => {
    if (f.elements.category.value === 'ander') {
      const g = guessCategory(f.elements.name.value);
      if (g) { f.elements.category.value = g; updateHint(); }
    }
  });
  $('#itemDelete').addEventListener('click', () => {
    const id = state.editingId;
    $('#itemDlg').close();
    takeOut(id);
  });

  $('#menuBtn').addEventListener('click', () => { renderPushStatus(); renderBackupStatus(); $('#menuDlg').showModal(); });
  $('#pushForm').addEventListener('submit', e => { e.preventDefault(); enablePush($('#pushUrl').value); });
  $('#pushTest').addEventListener('click', testPush);
  $('#backupCopy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(backupCode()); toast('Code gekopieerd. Plak hem in Notities.'); }
    catch { toast('Kopiëren lukt niet. Schrijf de code over.'); }
  });
  $('#backupNow').addEventListener('click', async () => {
    toast('Backup maken...');
    toast(await runBackup() ? 'Backup gemaakt' : 'Backup mislukt');
  });
  $('#restoreForm').addEventListener('submit', e => { e.preventDefault(); restoreBackup($('#restoreCode').value); });
  $('#pushOff').addEventListener('click', disablePush);
  $('#itemPhotoInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      state.pendingPhoto = await shrinkPhoto(file);
      showFormPhoto(URL.createObjectURL(state.pendingPhoto));
    } catch { toast('Foto lezen mislukt'); }
  });
  $('#itemPhotoDel').addEventListener('click', () => { state.pendingPhoto = null; showFormPhoto(null); });
  $('#cookBtn').addEventListener('click', () => { renderCook(); $('#cookDlg').showModal(); });
  document.querySelectorAll('#dietTabs button').forEach(b => b.addEventListener('click', () => {
    lsSet('dvv.diet', b.dataset.diet);
    renderCook();
  }));
  $('#shopBtn').addEventListener('click', () => { renderShopping(); $('#shopDlg').showModal(); });
  $('#shopForm').addEventListener('submit', e => {
    e.preventDefault();
    addShopping($('#shopInput').value);
    $('#shopInput').value = '';
  });
  $('#shopClear').addEventListener('click', () => {
    state.shopping = state.shopping.filter(s => !s.done);
    save();
    renderShopping();
  });
  $('#shopShare').addEventListener('click', shareShopping);
  $('#exportBtn').addEventListener('click', exportData);
  $('#importFile').addEventListener('change', e => e.target.files[0] && importData(e.target.files[0]));
  $('#notifyBtn').addEventListener('click', enableNotify);
  $('#calendarAllBtn').addEventListener('click', () => downloadCalendar(state.items, 'voorraad-herinneringen.ics'));

  render();
  renderShopping();
  notifyOnce();
  writeSwData();
  // Bij elke start de datums opnieuw doorsturen: zo blijft de server juist.
  schedulePushSync();
  if (state.items.length || state.shopping.length) scheduleBackup();
  // Scanner al op de achtergrond klaarzetten, zodat hij meteen werkt.
  setTimeout(() => getDetector().catch(() => {}), 500);
  // Status opnieuw berekenen als de app terug open komt (bv. volgende dag).
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); notifyOnce(); } });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
}

init();
