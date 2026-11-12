const SHELL = "truthlens-shell-v2";
const RUNTIME = "truthlens-runtime-v2";
const STATIC = "truthlens-static-v2";
const CURRENT = new Set([SHELL, RUNTIME, STATIC]);

const SHELL_URLS = [
  "/offline",
  "/academy",
  "/academy/what-cybersecurity-means",
  "/academy/devices-and-updates",
  "/academy/harmful-software",
  "/academy/shared-networks",
  "/academy/when-something-goes-wrong",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !CURRENT.has(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isPageRequest(request)) {
    event.respondWith(networkFirst(request));
  }
});

function isPageRequest(request) {
  if (request.mode === "navigate" || request.destination === "document") return true;
  return request.headers.get("RSC") === "1" || request.headers.get("Next-Router-Prefetch") === "1";
}

async function precacheShell() {
  const cache = await caches.open(SHELL);
  await Promise.all(SHELL_URLS.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) await cache.put(url, response);
    } catch {
      // One missed page should not throw away the rest of the reading.
    }
  }));
}

function urlFor(request) {
  const url = new URL(request.url);
  return url.pathname;
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone()).catch(() => {});
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate" || request.destination === "document") {
      const shell = await caches.open(SHELL);
      const saved = await shell.match(urlFor(request));
      if (saved) return saved;
      const offline = await shell.match("/offline");
      if (offline) return offline;
    }
    return new Response("You are offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
