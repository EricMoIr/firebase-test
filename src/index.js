const fs = require('fs')
const path = require('path')
const https = require('https');
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const serviceAccount = require("./test-41eff-firebase-adminsdk-zy78b-0dbab16830.json");

const certOptions = {
  key: fs.readFileSync(path.resolve('cert/server.key')),
  cert: fs.readFileSync(path.resolve('cert/server.crt'))
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-41eff.firebaseio.com"
});

const app = express();

app.use(bodyParser.json())

app.use(express.static("public"));

app.post("/notification", async (req, res) => {
    try {
        await sendNotification(req.body.registrationToken);
        res.send("Se debio haber mandado bien la push");
    } catch(error) {
        res.status(500);
        console.error("Error enviando push");
        console.error(error);
        res.send(error);
    }
});

function sendNotification(registrationToken) {
    var message = {
        notification: {
            title: '$GOOG up 1.43% on the day',
            body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
        },
        token: registrationToken
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    return admin.messaging().send(message);
}

const server = https.createServer(certOptions, app)
server.listen(443);
