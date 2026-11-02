const CACHE = 'dvv-v7';
const V = '7';
const DATA_CACHE = 'dvv-data';
const FILES = [
  './', 'index.html', `style.css?v=${V}`, `app.js?v=${V}`, `recipes.js?v=${V}`, 'manifest.json', 'icon.svg',
  `vendor/barcode-detector.js?v=${V}`, 'vendor/zxing_reader.wasm',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== DATA_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Eigen bestanden: eerst netwerk, dan cache.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Alleen eigen bestanden. Productinfo en de meldingenserver gaan rechtstreeks.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // no-cache: altijd bij de server navragen of er een nieuwe versie is.
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Tik op een melding: app openen.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const open = list.find(c => 'focus' in c);
      return open ? open.focus() : self.clients.openWindow('./');
    })
  );
});

// Push van de meldingenserver. De server stuurt geen tekst: we maken die hier met je eigen voorraad.
self.addEventListener('push', e => e.waitUntil(showStockNotification()));

async function showStockNotification() {
  let items = [];
  try {
    const res = await (await caches.open(DATA_CACHE)).match('items.json');
    if (res) items = await res.json();
  } catch {}
  const d = new Date();
  const z = n => String(n).padStart(2, '0');
  const today = `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  const bad = items.filter(i => i.limit < today).map(i => i.name);
  const warn = items.filter(i => i.limit >= today && i.warnFrom <= today).map(i => i.name);
  const list = names => names.slice(0, 3).join(', ') + (names.length > 3 ? ` en ${names.length - 3} meer` : '');
  let title = 'Voorraad';
  let body = 'Kijk even of alles in je diepvries en frigo nog goed is.';
  if (bad.length || warn.length) {
    title = bad.length ? 'Er ligt iets te lang in' : 'Er moet iets op';
    body = [bad.length && `Te lang: ${list(bad)}.`, warn.length && `Binnenkort op: ${list(warn)}.`].filter(Boolean).join(' ');
  }
  try { if (self.navigator.setAppBadge) await self.navigator.setAppBadge(bad.length + warn.length || 0); } catch {}
  await self.registration.showNotification(title, { body, icon: 'icon.svg', badge: 'icon.svg', tag: 'voorraad' });
}
