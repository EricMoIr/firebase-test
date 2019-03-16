async function init() {
    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyAuxCYwAnyJaqM_sqrJvGdQaDVT_3DqgFs",
        authDomain: "test-41eff.firebaseapp.com",
        databaseURL: "https://test-41eff.firebaseio.com",
        projectId: "test-41eff",
        storageBucket: "",
        messagingSenderId: "423758456957"
    };
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    // This is my public key gotten from settings/cloudmessaging/
    messaging.usePublicVapidKey("BLF5AhWEZSyXmctrqT62GYC3kI47r-ZqEtmm0zKWLAcR2yyvO5hvQPIJLEaADAqqDGPSnbLmi5qNyywpDfYD54s");

    try {
        await messaging.requestPermission();
        console.log("Notification permission granted.");

        // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        try {
            const currentToken = await messaging.getToken();
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
        } catch(err) {
            console.log('An error occurred while retrieving token. ', err);
            showToken('Error retrieving Instance ID token. ', err);
            setTokenSentToServer(false);
        };


    } catch(err) {
        console.log('Unable to get permission to notify.', err);
    };

    function sendTokenToServer(token) {
        fetch("http://localhost:8081/test-41eff/us-central1/notification", {
            method: "POST",
            body: token,
        });
    }
}
(async function() {
    try {
        await init();
    } catch(error) {
        console.error("Error while starting the app");
        console.error(error);
    }
})()