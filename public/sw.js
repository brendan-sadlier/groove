const VERSION = 'v3'
const STATIC_CACHE = `groove-static-${VERSION}`
const PRECACHE = [
  '/offline.html',
  '/manifest.webmanifest',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png',
  '/groove.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('groove-static-') && k !== STATIC_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return // never cache API/auth

  // Navigations: network-first, offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match('/offline.html')
          .then((r) => r ?? new Response('Offline', { status: 503 })),
      ),
    )
    return
  }

  // Static assets: stale-while-revalidate.
  if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((res) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (res && res.status === 200) cache.put(request, res.clone())
            return res
          })
          .catch(() => cached)
        return cached ?? network
      }),
    )
  }
})
