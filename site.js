var site_json = {
                    "name" : "Twin Pine",
                    "default_image" : "//codecloud.cdn.speedyrails.net/sites/5890c5296e6f640dd9000000/image/jpeg/1485886146000/twinlogo.jpg",
                    "time_zone" : "T08:00:00Z",
                    "social_feed" : "//longbeach.mallmaverick.com/api/v2/longbeach/social.json"
                };
const applicationServerPublicKey = 'BCAfjvLW8NcXbiNzky7G63eyp94KA29XANq7zB30hBd-eIyHGBFCTkPy0rVHEAEvs0H3ltWgIiQs_Kawyfmxcdg=';
var pushButton;
var type1, type2, store_id;
function activatePushButton(typ1,typ2, store) {
    pushButton = $('#allowPush');
    
     initialiseUI();
     type1 = typ1; 
     type2 = typ2;
     store_id = store.id;
    //console.log(pushButton);
}

let isSubscribed = false;
let swRegistration = null;

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
        subscriptionDetails.classList.remove('is-invisible');
      
    } else {
      console.log('User is NOT subscribed.');
      subscribeUser();
    }
     if($(window).width() > 768){
        $('<div class="modal-backdrop custom_backdrop_notif"></div>').appendTo(document.body);
        $('<div class="allow_notif_custom"> <i class="fa fa-long-arrow-up" aria-hidden="true"></i> Click allow to stay updated with us! </div>').appendTo(document.body);
    }
    
     
    updateBtn();
  });
}
function subscriptionExist () {
    // Set the initial subscription value
    if(swRegistration) {
        swRegistration.pushManager.getSubscription().then(function(subscription) {
        isSubscribed = !(subscription === null);
    
        //updateSubscriptionOnServer(subscription);
        const subscriptionJson = $('.popup_json');
        const subscriptionDetails = $('.popup_content');
        if (isSubscribed) {
            $('.custom_backdrop_notif').remove();
            $('.allow_notif_custom').remove();
            console.log('User IS subscribed.');
            console.log(JSON.stringify(subscription));
            $('.popup_header').text("THANK YOU!");
            subscriptionJson.text("");//You have already enrolled to receive notification from us!");
            subscriptionDetails.classList.remove('is-invisible');
            $('#allowPush').style.display = 'none';
            $("#disablePush").show();
        }
      });
    }
  
}
function updateBtn() {
    
  if (Notification.permission === 'denied') {
    const subscriptionJson = $('.popup_json');
    const subscriptionDetails = $('.popup_content');
    $('.custom_backdrop_notif').remove();
    $('.allow_notif_custom').remove();
    $('.popup_header').textContent = "Oh NO!";
    subscriptionJson.text("You have blocked notifications from us. Please enable it from settings and try again!");
   
    $('.receiveNotificationHeader').remove();
    pushButton.text('Push Messaging Blocked.');
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

//   if (isSubscribed) {
//     pushButton.textContent = 'Disable Push Messaging';
//   } else {
//     pushButton.textContent = 'Enable Push Messaging';
//   }

//   pushButton.disabled = false;
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
    
    const subscriptionJson = $('.popup_json');
    const subscriptionDetails = $('.popup_content');
    $('.popup_header').textContent = "Oh NO!";
    subscriptionJson.textContent = "You have blocked notifications from us. Please enable it from settings and try again!";
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
            $("#disablePush").show();
            $('.popup_header').text("THANK YOU!");
            $('.popup_json').text("Thank you for enrolling to receive notification from us!");
            subscriptionDetails.classList.remove('is-invisible');
        }
        else{
            $('.popup_header').text("SORRY!");
            $('.popup_json').text("We've ran into an error processing your request. Please try again later!");  
        }
    });
    
  } else {
    //subscriptionDetails.classList.add('is-invisible');
  }
}

function unsubscribeUser() {
    var postData= {};
   
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
      var post_status = "";
    if (subscription) {
      postData.data = (subscription).toJSON();
      postData.data.type1=type1;
      postData.data.type2=type2;
      postData.data.store_id=store_id;
      $.post("https://mallmaverickstaging.com/api/v4/twinpine/unsubscribe_webpush", postData, function(data, status, xhr){
        console.log(data,status);
        post_status = status;
            if(status == "success"){
                $('.popup_header').text("Stay updated with what's new. Get notifications from us about mall news, promotions and more!");
                $('.popup_json').text("Please allow notifications, when prompted!");
                return subscription.unsubscribe();
            }
            else{
                $('.popup_header').text("SORRY!");
                $('.popup_json').text("We've ran into an error processing your request. Please try again later!");  
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
        $('.popup_header').text("SORRY!");
        $('.popup_json').text("We've ran into an error processing your request. Please try again later!");  
    }
    else {
        $('.popup_header').text("Stay updated with what's new. Get notifications from us about mall news, promotions and more!");
                $('.popup_json').text("Please allow notifications, when prompted!");
        console.log('User is unsubscribed.');
    }
    
    
    isSubscribed = false;

    updateBtn();
    
  });
}
// function postToServer (subscriptionData){

       
// }