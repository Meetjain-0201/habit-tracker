export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, reason: 'not_supported' }
  }
  if (Notification.permission === 'granted') {
    return { granted: true }
  }
  if (Notification.permission === 'denied') {
    return { granted: false, reason: 'denied' }
  }
  const result = await Notification.requestPermission()
  return { granted: result === 'granted', reason: result }
}

export function sendNotification(title, body, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (!navigator.serviceWorker?.ready) return
  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      ...options,
    })
  })
}

export function scheduleNotificationToday(hour, minute, title, body) {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  const delay = target - now
  if (delay <= 0) return null
  const id = setTimeout(() => sendNotification(title, body), delay)
  return id
}

export function scheduleDailyReminders() {
  const reminders = [
    { hour: 7, minute: 30, title: 'Good morning, Meet! ☀️', body: 'Take your B12 now, before breakfast.' },
    { hour: 9, minute: 0, title: 'Morning skin routine 🧴', body: 'Cleanser, Niacinamide, Moisturizer, SPF' },
    { hour: 10, minute: 0, title: 'Breakfast time 🥣', body: 'Have breakfast and morning supplements.' },
    { hour: 13, minute: 30, title: 'Lunch time 🍱', body: 'Take Calcium/Mag/Zinc/D3 with your meal.' },
    { hour: 16, minute: 0, title: 'Gym check ⏰', body: 'Gym at 4PM or 7PM today? Lock it in.' },
    { hour: 19, minute: 0, title: 'Evening check-in 🌙', body: "Dinner + Calcium/Mag/Zinc/D3. How's the day going?" },
    { hour: 20, minute: 0, title: 'Applications 💼', body: 'Done your cold outreach and job apps today?' },
    { hour: 21, minute: 0, title: 'Skin evening routine 🌙', body: 'Cleanser, Retinol, Moisturizer' },
    { hour: 23, minute: 0, title: 'Sleep time 😴', body: 'Aim to sleep by 11PM. Log your wake time for tomorrow.' },
  ]
  return reminders.map((r) =>
    scheduleNotificationToday(r.hour, r.minute, r.title, r.body)
  )
}
