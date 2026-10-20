/* Steadfast service worker.
 * Caches only the app shell and static assets (fonts, icons, images, JS/CSS).
 * Never caches API or page data, so no health information is stored by the worker. */
const CACHE = "steadfast-static-v2";
const SHELL = ["/sign-in", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  const isStatic = url.pathname.startsWith("/_next/static/") || /\.(png|jpg|svg|woff2?|ico|webmanifest)$/.test(url.pathname);
  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
            return res;
          }),
      ),
    );
    return;
  }
});
