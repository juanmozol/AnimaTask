// AnimaTask service worker: lets the app reopen with no connection (airplane mode).
// The page is fetched fresh whenever there is a network; hashed files are cached the first time.
const CACHE = 'animatask-v1';
const SCOPE = self.registration.scope; // e.g. https://user.github.io/AnimaTask/

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const res = await fetch(SCOPE, { cache: 'reload' });
      if (!res.ok) throw new Error('No pude leer la página');
      const html = await res.clone().text();
      await cache.put(SCOPE, res);

      // Everything the page points at, and the fonts/images its stylesheets point at.
      const urls = new Set();
      for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
        const u = new URL(m[1], SCOPE);
        if (u.origin === self.location.origin && !u.pathname.endsWith('/ping.txt')) urls.add(u.href);
      }
      await Promise.all(
        [...urls].map(async u => {
          try {
            const r = await fetch(u, { cache: 'reload' });
            if (!r.ok) return;
            await cache.put(u, r.clone());
            // Fonts and images the stylesheet or the script points at (the creatures are loaded from the script).
            const found = new Set();
            if (u.endsWith('.css')) {
              const css = await r.text();
              for (const m of css.matchAll(/url\(([^)]+)\)/g)) found.add(m[1].trim().replace(/^['"]|['"]$/g, ''));
            } else if (u.endsWith('.js')) {
              const js = await r.text();
              for (const m of js.matchAll(/["'`]([^"'`\s]+\.(?:jpe?g|png|webp|svg|gif|woff2?))["'`]/g)) found.add(m[1]);
            }
            for (const raw of found) {
              if (raw.startsWith('data:')) continue;
              try {
                const fu = new URL(raw, raw.startsWith('/') ? SCOPE : u).href;
                if (new URL(fu).origin !== self.location.origin || (await cache.match(fu))) continue;
                const fr = await fetch(fu);
                if (fr.ok) await cache.put(fu, fr);
              } catch (e) {
                /* a missing file is not fatal */
              }
            }
          } catch (e) {
            /* best effort */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // The online check must always reach the network, never the cache.
  if (url.pathname.endsWith('/ping.txt')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          if (fresh.ok) (await caches.open(CACHE)).put(SCOPE, fresh.clone());
          return fresh;
        } catch (e) {
          return (await caches.match(SCOPE)) || Response.error();
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok && res.type === 'basic') (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (e) {
        return Response.error();
      }
    })()
  );
});
