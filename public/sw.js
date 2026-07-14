self.addEventListener('push', function(event) {
  const data = event.data ? event.data.text() : 'Nouvelle notification !';
  
  event.waitUntil(
    self.registration.showNotification('Physis Alerte', {
      body: data,
      icon: '/vite.svg',
      vibrate: [200, 100, 200]
    })
  );
});