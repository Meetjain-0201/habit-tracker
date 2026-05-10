const CACHE_NAME = 'habit-tracker-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  if (url.origin !== self.location.origin) return
  if (e.request.method !== 'GET') return

  // Network-first for the HTML shell so a new deploy is picked up immediately.
  // Hashed static assets are cache-first since their URLs change per build.
  const isNavigation =
    e.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json'

  if (isNavigation) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone()
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy))
          return resp
        })
        .catch(() => caches.match(e.request))
    )
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(
        (cached) =>
          cached ||
          fetch(e.request).then((resp) => {
            if (resp.ok) {
              const copy = resp.clone()
              caches.open(CACHE_NAME).then((c) => c.put(e.request, copy))
            }
            return resp
          })
      )
    )
  }
})

self.addEventListener('push', (e) => {
  let payload = { title: 'Habit Tracker', body: 'You have a new reminder.' }
  if (e.data) {
    try {
      payload = { ...payload, ...e.data.json() }
    } catch {
      payload.body = e.data.text()
    }
  }
  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      if (list.length) return list[0].focus()
      return clients.openWindow('/')
    })
  )
})
