// We2 Push Service Worker — v3 Edge-compatible
// Registers push events, shows notifications, handles clicks

const CACHE_VERSION = 'we2-v3-push-v1'

// ---------- Lifecycle ----------
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ---------- Push ----------
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const { title, body, icon, badge, image, tag, data, actions } = payload

    // Enrich with locale-aware defaults if not provided
    const notificationOptions = {
      body: body || 'You have a new update from We2',
      icon: icon || '/icons/icon-192.png',
      badge: badge || '/icons/icon-192.png',
      image: image || undefined,
      tag: tag || 'we2-default',
      data: data || {},
      actions: actions || [],
      vibrate: [200, 100, 200],
      requireInteraction: false,
      timestamp: Date.now(),
    }

    event.waitUntil(
      self.registration.showNotification(title || 'We2', notificationOptions)
    )

    // Log engagement (fire-and-forget analytics)
    if (data && data.logId) {
      logEngagement(data.logId, 'delivered')
    }
  } catch (err) {
    // Fallback: plain text notification
    try {
      const text = event.data.text()
      event.waitUntil(
        self.registration.showNotification('We2', {
          body: text,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        })
      )
    } catch (e) {
      console.error('[We2 SW] Failed to show notification:', e)
    }
  }
})

// ---------- Notification Click ----------
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const { data } = event.notification
  let targetUrl = '/en'

  if (data && data.url) {
    targetUrl = data.url
  } else if (data && data.locale) {
    targetUrl = `/${data.locale}`
  }

  // Log click engagement
  if (data && data.logId) {
    logEngagement(data.logId, 'clicked')
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          return client.navigate(targetUrl)
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// ---------- Push Subscription Change ----------
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // VAPID public key — replace with your production key
          'BDRSu0-qBq3ySiWVXckGQsMQBs9o7SRfvq2NpvlLsv1CvSJRNtYtVNZZH9OlcWkzG4RTJukPqqQB5_WWfv3JEf8'
        ),
      })
      .then((subscription) => {
        // Send new subscription to server
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth')),
          }),
        })
      })
      .catch((err) => console.error('[We2 SW] Subscription refresh failed:', err))
  )
})

// ---------- Helpers ----------
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function logEngagement(logId, eventType) {
  try {
    await fetch('/api/push/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId, eventType, timestamp: Date.now() }),
    })
  } catch (e) {
    // Silently fail — analytics should not break UX
  }
}