const CACHE_NAME = "work-ctrl-public-shell-v2";
const SHELL = ["/", "/manifest.webmanifest", "/icon"];
const PUBLIC_NAVIGATION_PATHS = new Set(["/", "/about", "/privacy", "/workflow-audit"]);

function isPublicNavigation(url) {
  return PUBLIC_NAVIGATION_PATHS.has(url.pathname)
    || url.pathname.startsWith("/services/")
    || url.pathname.startsWith("/work/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) return;
  const url = new URL(request.url);
  if (request.mode !== "navigate" || url.origin !== self.location.origin || !isPublicNavigation(url)) return;
  event.respondWith(fetch(request).then((response) => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
    }
    return response;
  }).catch(async () => (await caches.match(request)) || (await caches.match("/"))));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(self.registration.showNotification(data.title || "Yorkstead Studio", {
    body: data.body,
    icon: data.icon || "/icon",
    badge: data.badge || "/icon",
    tag: "work-ctrl-daily-reminder",
    renotify: true,
    data: { url: data.url || "/#tasks" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/#tasks";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const existing = clients[0];
    if (existing) { existing.navigate(url); return existing.focus(); }
    return self.clients.openWindow(url);
  }));
});
