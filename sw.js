
const CACHE_NAME = 'suameta-pdv-v3';

// O Service Worker apenas atua como uma ponte para detecção de atualização
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições para APIs externas (como Supabase)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Estratégia Network First para garantir que sempre busquemos o arquivo mais novo do servidor
  event.respondWith(
    fetch(event.request).catch(() => {
      // Se falhar (offline), tenta buscar no cache
      return caches.match(event.request);
    })
  );
});
