// Code Pad service worker. The app opens offline, and the libraries it downloads from CDNs
// (the code font, the JavaScript parser, Python) are kept after the first download.
const SHELL = 'codepad-shell-v2';
const CDN = 'codepad-cdn-v1';
// The app's address on every domain that serves it (gazimasud.com/code-pad, and this project's own).
const APP = '/code-pad';
const FILES = [APP, APP + '/manifest.webmanifest', APP + '/icons/icon.svg', APP + '/icons/icon-192.png', APP + '/icons/icon-512.png', APP + '/icons/icon-maskable-512.png', APP + '/icons/apple-touch-icon.png'];
// Versioned URLs that never change once published.
const IMMUTABLE = ['https://cdn.jsdelivr.net/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== CDN).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.endsWith('/sw.js')) return;
    e.respondWith(fresh(e, SHELL, req.mode === 'navigate' ? APP : null));
  } else if (IMMUTABLE.some((p) => req.url.startsWith(p))) {
    e.respondWith(kept(req));
  } else if (url.origin === 'https://fonts.googleapis.com') {
    e.respondWith(fresh(e, CDN, null));
  }
});

// The cached copy straight away, refreshed in the background for next time.
// Pages are all the same app, so every navigation is stored under the app's own address.
async function fresh(e, name, key) {
  const cache = await caches.open(name);
  const req = e.request;
  const hit = await cache.match(key || req, { ignoreSearch: true });
  const net = fetch(req).then((res) => {
    if (res.ok) return cache.put(key || req, res.clone()).then(() => res);
    return res;
  });
  if (hit) {
    e.waitUntil(net.catch(() => {}));
    return hit;
  }
  return net;
}

// Cache first: these files are versioned, so a stored copy is never stale.
// They're fetched with CORS whatever asked for them (a script tag, importScripts, fetch), so the one
// stored copy is readable and can answer every later request for the same URL.
async function kept(req) {
  const cache = await caches.open(CDN);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
  if (res.ok) await cache.put(req.url, res.clone());
  return res;
}
