'use strict';
var linkToOpen= "www.google.ca";
self.addEventListener('push', function(event) {

    const pushInfoPromise = fetch('https://mallmaverickstaging.com/api/v4/twinpine/get_webpush_message')
    .then(function(response) {
        //console.log(response.json());
        return response.json();
    })
    .then(function(response) {
        console.log(response.message);
        const title = response.message.title || 'We have something to tell you';
        const options = {
            body: response.message.body,
            icon: "https://mallmaverickstaging.com" + response.message.icon_url,
            badge: response.message.badge,
            image: "https://mallmaverickstaging.com" + response.message.image
        };
        linkToOpen = response.message.link;
        console.log(options.image);
        return self.registration.showNotification(title, options);
    });

  event.waitUntil(pushInfoPromise);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.',linkToOpen);

  event.notification.close();

  event.waitUntil(
    clients.openWindow(linkToOpen)
  );
});
