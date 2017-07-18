'use strict';
var linkToOpen= window.location.href ;
var push_message ;
self.addEventListener('push', function(event) {

    const pushInfoPromise = fetch('https://mallmaverickstaging.com/api/v4/twinpine/get_webpush_message')
    .then(function(response) {
        //console.log(response.json());
        return response.json();
    })
    .then(function(response) {
        push_message = response;
        console.log(response.message);
        const title = response.message.title || 'We have something to tell you';
        const options = {
            body: response.message.body,
            icon: "https://mallmaverickstaging.com" + response.icon_url,
            badge: response.message.badge,
            image: "https://mallmaverickstaging.com" + response.image_url,
            requireInteraction: true  
        };
        linkToOpen = response.message.link;
        console.log(options.image);
        return self.registration.showNotification(title, options);
    });

  event.waitUntil(pushInfoPromise);
});

self.addEventListener('notificationclick', function(event) {
    postData= {};
    postData.data = push_message;
    $.post("https://mallmaverickstaging.com/api/v4/twinpine/add_webpush_click", postData, function(data, status, xhr){
        console.log(data,status);
    });
    console.log('[Service Worker] Notification click Received.',linkToOpen);
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(linkToOpen)
    );
});

self.addEventListener('notificationclose', , function(event) {
    postData= {};
    postData.data = push_message;
    $.post("https://mallmaverickstaging.com/api/v4/twinpine/add_webpush_click", postData, function(data, status, xhr){
        console.log(data,status);
    });
    console.log('[Service Worker] Notification click Received.',linkToOpen);
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(linkToOpen)
    );
});
