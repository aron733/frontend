self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      title: data.title || 'VOKYVO',
      body: data.body || ''
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'VOKYVO', options)
  );
  
  // Sauvegarde les messages manqués pour les afficher quand l'app s'ouvre
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length === 0) {
        // L'app est fermée, sauvegarde le message
        self.caches.open('vokyvo-notifications').then((cache) => {
          cache.put(
            '/notifications-manquees',
            new Response(JSON.stringify({
              titre: data.title || 'VOKYVO',
              corps: data.body || '',
              url: data.url || '/',
              date: new Date().toISOString()
            }))
          );
        });
      } else {
        // L'app est ouverte, envoie un message
        clients.forEach((client) => {
          client.postMessage({
            type: 'NOTIFICATION',
            title: data.title || 'VOKYVO',
            body: data.body || ''
          });
        });
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
