'use strict';

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log('[Service Worker] Push had this data: "${event.data.text()}"');

  const title = 'Mall Maverick';
  const options = {
    body: event.message//'Mall Maverick Rocks!',
    // icon: '//codecloud.cdn.speedyrails.net/sites/5890c5296e6f640dd9000000/image/png/1496327260000/823841_message_512x512.png',
    // badge: 'images/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://developers.google.com/web/')
  );
});
