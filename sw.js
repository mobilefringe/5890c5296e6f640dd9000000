'use strict';
var linkToOpen= "/" ;
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
        if(response.message.link!== null && response.message.link !== "") {
            linkToOpen = response.message.link;
        }
        
        console.log(options.image);
        return self.registration.showNotification(title, options);
    });

  event.waitUntil(pushInfoPromise);
});

self.addEventListener('notificationclick', function(event) {
    var postData= {};
    postData.data = push_message;
    // $.post("https://mallmaverickstaging.com/api/v4/twinpine/add_webpush_click", postData, function(data, status, xhr){
    //     console.log(data,status);
    // });
    // postAjax('https://mallmaverickstaging.com/api/v4/twinpine/add_webpush_click', postData, function(data){ console.log(data); });
    const pushInfoPromise = fetch("https://mallmaverickstaging.com/api/v4/twinpine/add_webpush_click",
    {
        method: "POST",
        body: postData
    })
    .then(function(res){ 
        return res.json(); 
        
    })
    .then(function(data){ 
        console.log( JSON.stringify( data ) ) 
        
    });
    console.log('[Service Worker] Notification click Received.',linkToOpen);
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(linkToOpen)
    );
});

self.addEventListener('notificationclose', function(event) {
    var postData= {};
    postData.data = push_message;
    // $.post("https://mallmaverickstaging.com/api/v4/twinpine/add_webpush_close", postData, function(data, status, xhr){
    //     console.log(data,status);
    // });
    // postAjax('https://mallmaverickstaging.com/api/v4/twinpine/add_webpush_close', postData, function(data){ console.log(data); });
    console.log('[Service Worker] Notification close Received.');
    // event.notification.close();
    
    // event.waitUntil(
    //     clients.openWindow(linkToOpen)
    // );
});
function postAjax(url, data, success) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}