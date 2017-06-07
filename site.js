var site_json = {
                    "name" : "Twin Pine",
                    "default_image" : "//codecloud.cdn.speedyrails.net/sites/5890c5296e6f640dd9000000/image/jpeg/1485886146000/twinlogo.jpg",
                    "time_zone" : "T08:00:00Z",
                    "social_feed" : "//longbeach.mallmaverick.com/api/v2/longbeach/social.json"
                };
const applicationServerPublicKey = 'BKuWECJCzyrubz6501vVsoB5gUMFgAsi7m7AgD_1HFPLO9Fq2L3SGjDgHpRNRFV7P3vNRaP0cTwwqS01twoG2DE=';
var pushButton;
function activatePushButton() {
    pushButton = document.querySelector('#allowPush');
     initialiseUI();
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

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
   
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}

function initialiseUI() {
  $(pushButton).click(function() {
      console.log("clicking away");
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

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
      subscribeUser();
    }

    updateBtn();
  });
}

function updateBtn() {
    
  if (Notification.permission === 'denied') {
    const subscriptionJson = document.querySelector('.popup_json');
    const subscriptionDetails = document.querySelector('.popup_content');
    
    document.querySelector('.popup_header').textContent = "Oh NO!";
    subscriptionJson.textContent = "You have blocked notifications from us. Please enable it from settings and try again!";
    //const popup_home =  document.querySelector('.popup_home');
    //const receiveN = document.querySelector('.receiveNotificationHeader');
    //console.log(receiveN);
    //receiveN.parentNode.removeChild(receiveN);
    //custom_backdrop.parentNode.removeChild(custom_backdrop);
    $('.receiveNotificationHeader').remove();
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
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

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    
    const subscriptionJson = document.querySelector('.popup_json');
    const subscriptionDetails = document.querySelector('.popup_content');
    document.querySelector('.popup_header').textContent = "Oh NO!";
    subscriptionJson.textContent = "You have blocked notifications from us. Please enable it from settings and try again!";
    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.popup_json');
  const subscriptionDetails =
    document.querySelector('.popup_content');

  if (subscription) {
    
    console.log((subscription).toJSON());
    var postSuccess = true;//postToServer(JSON.stringify(subscription));
    if(postSuccess) {
        document.querySelector('.popup_header').textContent = "THANK YOU!";
        subscriptionJson.textContent = "Thank you for enrolling to receive notification from us!";
        subscriptionDetails.classList.remove('is-invisible');
    }
    else {
        document.querySelector('.popup_header').textContent = "SORRY!";
        subscriptionJson.textContent = "We've ran into an error processing your request. Please try again later!";
        //subscriptionDetails.classList.add('is-invisible');
    }
    
  } else {
    //subscriptionDetails.classList.add('is-invisible');
  }
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}
function postToServer (subscriptionData){
    $.ajax({
            url: "localhost:3000/postpushsubscription",
            type: "POST",
            dataType: 'jsonp',
            data: subscriptionData,
            success: function(response){   
                return true;
                //alert("Thank you for enabling notification.");
			},
            error: function(xhr, ajaxOptions, thrownError){
                return false;    
            // alert("Please try again later.");
			}
        })    
}