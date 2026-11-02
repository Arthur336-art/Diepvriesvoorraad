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
  { id: 'saus',       label: 'Dips / sauzen / smeersels', diepvries: 90, frigo: 14 },
  { id: 'eieren',     label: 'Eieren',                  diepvries: 270, frigo: 28 },
  { id: 'ander',      label: 'Ander',                   diepvries: 180, frigo: 5 },
];
const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Regels om de soort te raden. Volgorde telt: specifiek eerst.
// TAG_RULES kijken naar de categorieën van Open Food Facts (Engels, bv. en:frozen-chicken-breasts).
// NAME_RULES kijken naar de productnaam (NL, FR, EN). Een woord met ^ moet aan het begin van een woord staan.
const TAG_RULES = [
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
const PRODUCTS_KEY = 'dvv.products.v1';
const LOC_ICON = { diepvries: '❄️', frigo: '🧊' };

const $ = s => document.querySelector(s);
const state = {
  items: load(STORE_KEY, []),
  products: load(PRODUCTS_KEY, {}),
  filter: 'alles',
  query: '',
  mode: 'in',
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
  } catch { toast('Opslaan mislukt'); }
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
    p.textContent = state.items.length ? 'Niets gevonden.' : 'Nog niets in voorraad. Tik op Erin om te scannen.';
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
    el.querySelector('.name').textContent = (i.qty > 1 ? `${i.qty}× ` : '') + i.name;
    el.querySelector('.meta').textContent =
      `${CAT[i.category].label} · erin ${fmtDate(i.added)} (${i.s.days ? humanDays(i.s.days) + " geleden" : "vandaag"})`;
    el.querySelector('.badge').textContent = badgeText(i.s);
    el.addEventListener('click', () => openItem({ id: i.id }));
    list.append(el);
  }
}
function count(all, loc) {
  const n = all.filter(i => i.location === loc).length;
  return n ? `(${n})` : '';
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
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
        if (hit) { onCode(hit.rawValue); return; }
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

async function onCode(code) {
  if (scanBusy) return;
  scanBusy = true;
  code = String(code).trim();
  if (navigator.vibrate) navigator.vibrate(80);
  await closeScan();
  if (state.mode === 'in') await handleIn(code);
  else handleOut(code);
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
async function lookup(code) {
  let p;
  try { p = await fetchProduct(code); }
  catch { toast('Geen verbinding, typ zelf een naam'); return null; }
  if (!p) { toast('Product niet gevonden, typ zelf een naam'); return null; }
  const base = (p.product_name_nl || p.product_name || p.product_name_fr || p.product_name_en ||
    p.generic_name_nl || p.generic_name || '').trim();
  const brand = (p.brands || '').split(',')[0].trim();
  // Merk niet dubbel tonen als het al in de naam staat.
  const name = (brand && !base.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${base}` : base).trim();
  const tags = [...(p.categories_tags || []), ...(p.food_groups_tags || [])];
  const nameForGuess = [base, p.generic_name_nl, p.generic_name].filter(Boolean).join(' ');
  const category = guessCategory(nameForGuess, tags);
  if (!name && !category) { toast('Product niet gevonden, typ zelf een naam'); return null; }
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
  if (state.editingId) {
    Object.assign(state.items.find(i => i.id === state.editingId), data);
    toast('Aangepast');
  } else {
    state.items.push({ id: uid(), ...data });
    toast(`${data.name} staat in de ${data.location}`);
  }
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
  if (item.qty > 1) {
    item.qty -= 1;
    toast(`${item.name} eruit, nog ${item.qty} over`);
  } else {
    state.items.splice(idx, 1);
    toast(`${item.name} eruit`);
  }
  save();
  render();
}

// ---------- Menu ----------

function renderShelfTable() {
  const rows = CATEGORIES.map(c =>
    `<tr><td>${c.label}</td><td>${humanDays(c.diepvries)}</td><td>${humanDays(c.frigo)}</td></tr>`).join('');
  $('#shelfTable').innerHTML =
    `<table><thead><tr><th>Soort</th><th>Diepvries</th><th>Frigo</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function exportData() {
  const blob = new Blob(
    [JSON.stringify({ items: state.items, products: state.products, exported: new Date().toISOString() }, null, 2)],
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
    if (code) onCode(code);
  });
  $('#noBarcode').addEventListener('click', async () => {
    await closeScan();
    if (state.mode === 'in') openItem({});
    else handleOut('');
  });

  document.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', () => b.closest('dialog').close()));
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

  $('#menuBtn').addEventListener('click', () => $('#menuDlg').showModal());
  $('#exportBtn').addEventListener('click', exportData);
  $('#importFile').addEventListener('change', e => e.target.files[0] && importData(e.target.files[0]));
  $('#notifyBtn').addEventListener('click', enableNotify);
  $('#calendarAllBtn').addEventListener('click', () => downloadCalendar(state.items, 'voorraad-herinneringen.ics'));

  render();
  notifyOnce();
  // Scanner al op de achtergrond klaarzetten, zodat hij meteen werkt.
  setTimeout(() => getDetector().catch(() => {}), 500);
  // Status opnieuw berekenen als de app terug open komt (bv. volgende dag).
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); notifyOnce(); } });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
}

init();
