'use strict';
var linkToOpen= "www.google.ca";
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
    
    $.post("https://mallmaverickstaging.com/api/v4/twinpine/subscribe_webpush", postData, function(data, status, xhr){
        console.log(data,status);
        if(status == "success"){
            document.querySelector('.popup_header').textContent = "THANK YOU!";
            subscriptionJson.textContent = "Thank you for enrolling to receive notification from us!";
            subscriptionDetails.classList.remove('is-invisible');
        }
        else{
            document.querySelector('.popup_header').textContent = "SORRY!";
            subscriptionJson.textContent = "We've ran into an error processing your request. Please try again later!";  
        }
    });
  event.notification.close();

  event.waitUntil(
    clients.openWindow(linkToOpen)
  );
});
