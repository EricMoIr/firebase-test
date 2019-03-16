let messaging;
async function init() {
    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyAuxCYwAnyJaqM_sqrJvGdQaDVT_3DqgFs",
        authDomain: "test-41eff.firebaseapp.com",
        databaseURL: "https://test-41eff.firebaseio.com",
        projectId: "test-41eff",
        storageBucket: "test-41eff.appspot.com",
        messagingSenderId: "423758456957"
    };
    firebase.initializeApp(config);
    // [START get_messaging_object]
    // Retrieve Firebase Messaging object.
    messaging = firebase.messaging();
    // [END get_messaging_object]
    // [START set_public_vapid_key]
    // Add the public key generated from the console here.
    messaging.usePublicVapidKey('BLF5AhWEZSyXmctrqT62GYC3kI47r-ZqEtmm0zKWLAcR2yyvO5hvQPIJLEaADAqqDGPSnbLmi5qNyywpDfYD54s');
    // [END set_public_vapid_key]
    initButtons();
    await requestPermission();
    resetUI();

    // [START refresh_token]
    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(function () {
        createToken().then(function (refreshedToken) {
            console.log('Token refreshed.');
            // Indicate that the new Instance ID token has not yet been sent to the
            // app server.
            setTokenSentToServer(false);
            // Send Instance ID token to app server.
            sendTokenToServer(refreshedToken);
            // [START_EXCLUDE]
            // Display new Instance ID token and clear UI of all previous messages.
            resetUI();
            // [END_EXCLUDE]
        }).catch(function (err) {
            console.log('Unable to retrieve refreshed token ', err);
            showToken('Unable to retrieve refreshed token ', err);
        });
    });
    // [END refresh_token]

    // [START receive_message]
    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a service worker
    //   `messaging.setBackgroundMessageHandler` handler.
    messaging.onMessage(function (payload) {
        console.log('Message received. ', payload);
        // [START_EXCLUDE]
        // Update the UI to include the received message.
        appendMessage(payload);
        // [END_EXCLUDE]
    });
    // [END receive_message]

    function resetUI() {
        clearMessages();
        $("#token").hide();
        $("#loading").show();
        // [START get_token]
        // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        createToken().then(function (currentToken) {
            $("#loading").hide();
            $("#token").show();
            if (currentToken) {
                sendTokenToServer(currentToken);
                updateUIForPushEnabled(currentToken);
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                updateUIForPushPermissionRequired();
                setTokenSentToServer(false);
            }
        }).catch(function (err) {
            console.log('An error occurred while retrieving token. ', err);
            showToken('Error retrieving Instance ID token. ', err);
            setTokenSentToServer(false);
        });
        // [END get_token]
    }


    function showToken(currentToken) {
        return;
        // Show token in console and UI.
        var tokenElement = document.querySelector('#token');
        tokenElement.textContent = currentToken;
    }

    // Send the Instance ID token your application server, so that it can:
    // - send messages back to this app
    // - subscribe/unsubscribe the token from topics
    function sendTokenToServer(currentToken) {
        if (!isTokenSentToServer()) {
            console.log('Sending token to server...');
            // TODO(developer): Send the current token to your server.
            setTokenSentToServer(true);
        } else {
            console.log('Token already sent to server so won\'t send it again ' +
                'unless it changes');
        }

    }

    function isTokenSentToServer() {
        return window.localStorage.getItem('sentToServer') === '1';
    }

    function setTokenSentToServer(sent) {
        window.localStorage.setItem('sentToServer', sent ? '1' : '0');
    }

    function showHideDiv(divId, show) {
        return;
        const div = document.querySelector('#' + divId);
        if (show) {
            div.style = 'display: visible';
        } else {
            div.style = 'display: none';
        }
    }

    async function requestPermission() {
        console.log('Requesting permission...');
        // [START request_permission]
        try {
            await messaging.requestPermission();
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve an Instance ID token for use with FCM.
            // [START_EXCLUDE]
            // In many cases once an app has been granted notification permission, it
            // should update its UI reflecting this.
            resetUI();
        } catch(err) {
            console.log('Unable to get permission to notify.', err);
        };
        // [END request_permission]
    }

    async function deleteToken() {
        $("#token").empty();
        return new Promise((resolve, reject) => {
            createToken().then((token) => {
                messaging.deleteToken(token).then(() => {
                    resolve();
                    setTokenSentToServer(false);
                });
            }).catch((error) => {
                console.error("Couldn't delete token");
                reject(error);
            });
        });
    }

    async function createToken() {
        try {
            await messaging.requestPermission();
            return await messaging.getToken();
        } catch (error) {
            console.error("Couldn't create token");
        }
    }

    async function resetToken() {
        // Delete Instance ID token.
        // [START delete_token]
        $("#loading").show();
        await deleteToken();
        await createToken();
        $("#loading").hide();
        resetUI();
    }

    // Add a message to the messages element.
    function appendMessage(payload) {
        const messagesElement = document.querySelector('#messages');
        const dataHeaderELement = document.createElement('h5');
        const dataElement = document.createElement('pre');
        dataElement.style = 'overflow-x:hidden;';
        dataHeaderELement.textContent = 'Received message:';
        dataElement.textContent = JSON.stringify(payload, null, 2);
        messagesElement.appendChild(dataHeaderELement);
        messagesElement.appendChild(dataElement);
    }

    // Clear the messages element of all children.
    function clearMessages() {
        const messagesElement = document.querySelector('#messages');
        while (messagesElement.hasChildNodes()) {
            messagesElement.removeChild(messagesElement.lastChild);
        }
    }

    function updateUIForPushEnabled(currentToken) {
        // showHideDiv(tokenDivId, true);
        // showHideDiv(permissionDivId, false);
        // showToken(currentToken);
    }

    function updateUIForPushPermissionRequired() {
        // showHideDiv(tokenDivId, false);
        // showHideDiv(permissionDivId, true);
    }

    function initButtons() {
        async function askNotif(timeout) {
            fetch("/notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: await createToken(),
                    timeout,
                }),
            });
        }

        $("#resetToken").click(resetToken);
        $("#deleteToken").click(deleteToken);
        $("#notifNow").click(async () => {
            await askNotif(0);
        });
        $("#notif10").click(async () => {
            await askNotif(10000);
        });
    }
}

(async function () {
    $(document).ready(async () => {
        try {
            await init();
        } catch (error) {
            console.error("Error while starting the app");
            console.error(error);
        }
    });
})();