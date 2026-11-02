// Meldingenserver voor Diepvriesvoorraad. Draait gratis als Cloudflare Worker.
//
// Wat hij bewaart: per toestel het push-adres en een lijst datums waarop een melding moet komen.
// Geen productnamen: die blijven op je gsm. De app toont ze zelf als de melding binnenkomt.
//
// Nodig in Cloudflare:
//   - KV-binding met de naam SUBS
//   - Cron trigger, bv. "0 7 * * *" (elke ochtend 8 u of 9 u Belgische tijd)
// De sleutels voor push maakt de server zelf aan bij de eerste keer.

const ALLOWED_ORIGINS = ['https://arthur336-art.github.io', 'http://localhost:8000'];
const SUBJECT = 'https://arthur336-art.github.io/Diepvriesvoorraad/';
const MAX_DATES = 400;
// Alleen naar echte push-diensten sturen (Apple, Google, Mozilla, Microsoft).
const PUSH_HOSTS = [/\.push\.apple\.com$/, /^fcm\.googleapis\.com$/, /\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/];
const isPushEndpoint = url => {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && PUSH_HOSTS.some(re => re.test(u.hostname));
  } catch { return false; }
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const { pathname } = new URL(request.url);

    try {
      if (request.method === 'GET' && (pathname === '/' || pathname === '/key')) {
        const keys = await getKeys(env);
        return json({ ok: true, publicKey: keys.publicKey });
      }
      if (request.method !== 'POST') return json({ error: 'not found' }, 404);
      const body = await request.json();

      if (pathname === '/sync') {
        const sub = body.subscription;
        if (!sub || typeof sub.endpoint !== 'string' || !isPushEndpoint(sub.endpoint)) {
          return json({ error: 'bad subscription' }, 400);
        }
        const dates = (Array.isArray(body.dates) ? body.dates : [])
          .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
          .sort()
          .slice(0, MAX_DATES);
        const id = await hash(sub.endpoint);
        const old = JSON.parse((await env.SUBS.get(`sub:${id}`)) || 'null');
        await env.SUBS.put(`sub:${id}`, JSON.stringify({
          endpoint: sub.endpoint,
          dates,
          lastSent: old?.lastSent || '',
        }));
        return json({ ok: true, dates: dates.length });
      }

      if (pathname === '/unsubscribe') {
        if (typeof body.endpoint === 'string') await env.SUBS.delete(`sub:${await hash(body.endpoint)}`);
        return json({ ok: true });
      }

      if (pathname === '/test') {
        if (typeof body.endpoint !== 'string') return json({ error: 'no endpoint' }, 400);
        const known = await env.SUBS.get(`sub:${await hash(body.endpoint)}`);
        if (!known) return json({ error: 'unknown device' }, 404);
        const status = await sendPush(env, body.endpoint);
        return json({ ok: status >= 200 && status < 300, status });
      }

      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 500);
    }
  },

  // Elke ochtend: stuur een melding naar elk toestel met een datum die vandaag of eerder valt
  // en waarvoor nog geen melding verstuurd is.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDaily(env));
  },
};

export async function runDaily(env, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(now);
  let cursor;
  let sent = 0;
  do {
    const page = await env.SUBS.list({ prefix: 'sub:', cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const { name } of page.keys) {
      const rec = JSON.parse((await env.SUBS.get(name)) || 'null');
      if (!rec) continue;
      const due = rec.dates.some(d => d <= today && d > (rec.lastSent || ''));
      if (!due) continue;
      const status = await sendPush(env, rec.endpoint);
      if (status === 404 || status === 410) {
        await env.SUBS.delete(name); // toestel bestaat niet meer
      } else if (status >= 200 && status < 300) {
        rec.lastSent = today;
        await env.SUBS.put(name, JSON.stringify(rec));
        sent++;
      }
    }
  } while (cursor);
  return { today, sent };
}

// ---------- Web Push zonder inhoud ----------
// De melding zelf heeft geen tekst. De app op je gsm vult de tekst in met je eigen voorraad.

async function sendPush(env, endpoint) {
  const keys = await getKeys(env);
  const aud = new URL(endpoint).origin;
  const jwt = await signJwt(keys, { aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SUBJECT });
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      TTL: String(24 * 3600),
      Urgency: 'normal',
      Authorization: `vapid t=${jwt}, k=${keys.publicKey}`,
      'Content-Length': '0',
    },
  });
  return res.status;
}

async function getKeys(env) {
  const stored = await env.SUBS.get('vapid');
  if (stored) return JSON.parse(stored);
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  const keys = { jwk, publicKey: b64url(raw) };
  await env.SUBS.put('vapid', JSON.stringify(keys));
  return keys;
}

async function signJwt(keys, claims) {
  const enc = s => b64url(new TextEncoder().encode(JSON.stringify(s)));
  const input = `${enc({ typ: 'JWT', alg: 'ES256' })}.${enc(claims)}`;
  const key = await crypto.subtle.importKey('jwk', keys.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(input));
  return `${input}.${b64url(new Uint8Array(sig))}`;
}

async function hash(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return b64url(new Uint8Array(d)).slice(0, 32);
}

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
