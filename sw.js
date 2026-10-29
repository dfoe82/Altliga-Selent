/* Service Worker: zeigt Push-Nachrichten an und öffnet beim Antippen die App */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', ev => {
  let p = {};
  try { p = ev.data ? ev.data.json() : {}; } catch (e) { p = { data: { body: ev.data ? ev.data.text() : '' } }; }
  const d = p.data || {}, n = p.notification || {};
  const title = d.title || n.title || 'Neue Nachricht';
  const opts = { body: d.body || n.body || '', data: { url: d.url || self.registration.scope } };
  if (d.tag) { opts.tag = d.tag; opts.renotify = true; }
  ev.waitUntil(self.registration.showNotification(title, opts));
});
self.addEventListener('notificationclick', ev => {
  ev.notification.close();
  const url = (ev.notification.data && ev.notification.data.url) || self.registration.scope;
  ev.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.startsWith(self.registration.scope) && 'focus' in w) return w.focus();
    return self.clients.openWindow(url);
  }));
});
