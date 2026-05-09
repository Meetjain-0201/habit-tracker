const CACHE_NAME = 'habit-tracker-v1'
const CORE_ASSETS = ['/', '/index.html']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  )
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
