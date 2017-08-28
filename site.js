var site_json = {
                    "name" : "Twin Pine",
                    "default_image" : "//codecloud.cdn.speedyrails.net/sites/5890c5296e6f640dd9000000/image/jpeg/1485886146000/twinlogo.jpg",
                    "time_zone" : "T08:00:00Z",
                    "social_feed" : "//longbeach.mallmaverick.com/api/v2/longbeach/social.json"
                };
window.subscribed_store_ids = [];
window.subscribed_to_event = false;
window.subscribed_to_promo = false;
const applicationServerPublicKey = 'BCAfjvLW8NcXbiNzky7G63eyp94KA29XANq7zB30hBd-eIyHGBFCTkPy0rVHEAEvs0H3ltWgIiQs_Kawyfmxcdg=';
let pushButton;
let type1, type2, store_id;
let isSubscribed = false;
let swRegistration = null;


function activatePushButton(typ1,typ2, store) {
    pushButton = $('#allowPush');
    //det up different types
    if(("evennts").indexOf(type1) > -1 || ("promo").indexOf(type2) > -1) {
       window.subscribed_to_event = true
    }
    if(("promotions").indexOf(type1) > -1 || ("promotions").indexOf(type2) > -1) {
       window.subscribed_to_event = true
    } 
     initialiseUI();
     type1 = typ1; 
     type2 = typ2;
     store_id = store.id;
    //console.log(pushButton);
    console.log(type1, type2);
}



function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('/sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    subscriptionExist();
    console.log("Subscription exist?");
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
    console.log( 'Service Worker Error');
  });
} else {
  console.warn('Push messaging is not supported');
 
   console.log( 'Push Not Supported');
}



function initialiseUI() {
  $(pushButton).click(function() {
    pushButton.disabled = true;
    addPermissionModal();
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);
    const subscriptionJson = $('.popup_json');
    const subscriptionDetails = $('.popup_content');
    if (isSubscribed) {
        console.log('User IS already subscribed.');
        $('.popup_header').text("THANK YOU!");
        subscriptionJson.text("");//You have already enrolled to receive notification from us!");
      
    } else {
      console.log('User is NOT subscribed.');
      subscribeUser();
    }
    removePermissionModal();
    blockedStatus();
  });
}
function subscriptionExist () {
    // Set the initial subscription value
    if(swRegistration) {
        swRegistration.pushManager.getSubscription().then(function(subscription) {
        isSubscribed = !(subscription === null);
        
        const subscriptionJson = $('.popup_json');
        const subscriptionDetails = $('.popup_content');
        if (isSubscribed) {
            
            console.log("checking for exisitng subscription")
            console.log('User IS already subscribed.');
            
            postData= {};
            postData.data = (subscription).toJSON();
        
            //check what kind of subscription they signed up for
            $.get('https://mallmaverickstaging.com/api/v4/twinpine/get_store_subscriptions', postData, function(data) {
                console.log("Stores");
                console.log(data);
                $.each(data.result, function(key,val) {
                    window.subscribed_store_ids.push(val.store_id);
                });
            });
            $.get('https://mallmaverickstaging.com/api/v4/twinpine/get_event_subscriptions', postData, function(data) {
                console.log("events");
                console.log(data);
                window.subscribed_to_event = true;
            });
            $.get('https://mallmaverickstaging.com/api/v4/twinpine/get_promotion_subscriptions', postData, function(data) {
                console.log("promo");
                console.log(data);
                window.subscribed_to_promo = true;
            });
        }
      });
    }
  
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;
    
    //updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    
    blockedStatus();
    //updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = $('.popup_json');
  const subscriptionDetails = $('.popup_content');

  if (subscription) {
    
    console.log(JSON.stringify(subscription));
    
    postData= {};
    postData.data = (subscription).toJSON();
    postData.data.type1=type1;
    postData.data.type2=type2;
    postData.data.store_id=store_id;
    $.post("https://mallmaverickstaging.com/api/v4/twinpine/subscribe_webpush", postData, function(data, status, xhr){
        console.log(data,status);
        if(status == "success"){
            thankyouSubscribedStatus ();
        }
        else{
            errorSubscribedStatus();
        }
    });
    
  } else {
    //subscriptionDetails.classList.add('is-invisible');
  }
}

function unsubscribeUser() {
    var postData= {};
    var post_status = "";
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
      
    if (subscription) {
      postData.data = (subscription).toJSON();
      postData.data.type1=type1;
      postData.data.type2=type2;
      postData.data.store_id=store_id;
      $.post("https://mallmaverickstaging.com/api/v4/twinpine/unsubscribe_webpush", postData, function(data, status, xhr){
        console.log(data,status);
        post_status = status;
            if(status == "success"){
                defaultSubscribedStatus();
                return subscription.unsubscribe();
            }
            else{
                errorSubscribedStatus();
            }
        });
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    //updateSubscriptionOnServer(null);
    if(post_status !== "success") {
        errorSubscribedStatus();
    }
    else {
        defaultSubscribedStatus();
        console.log('User is unsubscribed.');
    }
    
    
    isSubscribed = false;

    blockedStatus();
    
  });
}

function blockedStatus () {
    if (Notification.permission === 'denied') {
        const subscriptionJson = $('.popup_json');
        const subscriptionDetails = $('.popup_content');
        $('.popup_header').textContent = "Oh NO!";
        subscriptionJson.text("You have blocked notifications from us. Please enable it from settings and try again!");
        
        console.log("blocked status");
        $('.receiveNotificationHeader').remove();
        pushButton.text('Push Messaging Blocked.');
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }
}

function alreadySubscribedStatus () {
    console.log("already subscribed status");
    $('.popup_header').text("THANK YOU!");
    $('.popup_json').text("You have already enrolled to receive notification from us!");//");
    $('#allowPush').hide();
    $("#disablePush").show();
}

function errorSubscribedStatus () {
    console.log("error status");
    $('.popup_header').text("SORRY!");
    $('.popup_json').text("We've ran into an error processing your request. Please try again later!");  
    $('#allowPush').hide();
    $("#disablePush").hide();
}

function defaultSubscribedStatus () {
    console.log("default status");
    $('.popup_header').text("Stay updated with what's new. Get notifications from us about mall news, promotions and more!");
    $('.popup_json').text("Please allow notifications, when prompted!");
    $('#allowPush').show();
    $("#disablePush").hide();
}

function thankyouSubscribedStatus () {
    console.log("thank you status");
    $('.popup_header').text("THANK YOU!");
    $('.popup_json').text("Thank you for enrolling to receive notification from us!");
    $('#allowPush').hide();
    $("#disablePush").show();
}

function addPermissionModal() {
    
    if (Notification.permission === 'default'){

        console.log("notification is shown");
        if($(window).width() > 768){
             //show instructions to click allow
            $('<div class="modal-backdrop custom_backdrop_notif"></div>').appendTo(document.body);
            $('<div class="allow_notif_custom"> <i class="fa fa-long-arrow-up" aria-hidden="true"></i> Click allow to stay updated with us! </div>').appendTo(document.body);
        }
    }
}

function removePermissionModal () {
    
    console.log("notification is removed");
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
        $('.custom_backdrop_notif').remove();
        $('.allow_notif_custom').remove();
    }
}
function unsubscribeOVerride () {
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
        if (subscription) {
           return subscription.unsubscribe();
        }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
    errorSubscribedStatus();
  })
  .then(function() {
    //updateSubscriptionOnServer(null);
    // if(post_status !== "success") {
        
    // }
    // else {
        defaultSubscribedStatus();
        console.log('User is unsubscribed.');
    // }
    
    
    isSubscribed = false;

    blockedStatus();
    
  });
}