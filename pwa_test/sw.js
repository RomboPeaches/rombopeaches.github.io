const BASE = "/pwa_test/";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("pwa-cache").then(cache => {
      return cache.addAll([
        BASE,
        BASE + "index.html",
        BASE + "manifest.json",
        BASE + "icon-192.png",
        BASE + "icon-512.png"
      ]);
    })
  );
});
