'use strict';
var linkToOpen= "";
self.addEventListener('push', function(event) {
//   console.log('[Service Worker] Push Received.');
//   console.log('[Service Worker] Push had this data: "${event.data.text()}"');
//   if (event.data) {
//     console.log(event.data.json());
//   }
  
//   const title = (event.data && event.data.text()) || 'Mall Maverick';
//   const options = {
//     body: 'Mall Maverick Rocks!',
//     icon: '//codecloud.cdn.speedyrails.net/sites/5890c5296e6f640dd9000000/image/png/1496327260000/823841_message_512x512.png',
//     badge: 'images/badge.png'
//   };

//   event.waitUntil(self.registration.showNotification(title, options));
    // const analyticsPromise = pushReceivedTracking();
    const pushInfoPromise = fetch('https://mallmaverickstaging.com/api/v4/twinpine/get_webpush_message')
    .then(function(response) {
        //console.log(response.json());
        return response.json();
    })
    .then(function(response) {
        console.log(response.message[0]);
        const title = response.message[0].title;
        const options = {
            body: response.message[0].body,
            icon: response.message[0].icon,
            badge: response.message[0].badge,
            image: response.message[0].image
        };
        linkToOpen = response.message[0].link
        return self.registration.showNotification(title, options);
    });

  event.waitUntil(pushInfoPromise);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://mallmaverick.com')
  );
});
