const axios = require("axios");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const serviceAccount = require("./test-41eff-firebase-adminsdk-zy78b-0dbab16830.json");

const PORT = process.env.PORT || 5000;

// const certOptions = {
//   key: fs.readFileSync(path.resolve('cert/server.key')),
//   cert: fs.readFileSync(path.resolve('cert/server.crt'))
// };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-41eff.firebaseio.com"
});

const app = express();

app.use(bodyParser.json())

app.use(express.static("public"));

app.post("/notification", async (req, res) => {
    try {
        const { token, timeout } = req.body;
        queueNotification(token, timeout);
        res.send("The notification was queued");
    } catch(error) {
        res.status(500);
        console.error("Error enviando push");
        console.error(error);
        res.send(error);
    }
});

function queueNotification(token, timeout) {
    setTimeout(() => sendNotification(token), timeout);
}

async function sendNotification(to) {
    const notification = {
      'title': 'Portugal vs. Denmark',
      'body': '5 to 1',
      'icon': 'firebase-logo.png',
      'click_action': 'https://localhost:5000'
    };
    try {
        const data = {
            notification,
            to,
        };

        const options = {
            url: "https://fcm.googleapis.com/fcm/send",
            data,
            method: "POST",
            headers: {
                Authorization: "key=AAAAYqn46H0:APA91bGCnj_QgzLftDGoQ1YE8QO8tWp03Pz0qaeUmZtvsb48NbiI78tTPs2KuIJPlXyM3oZH1jC3iiTxNV73RQDT-Ei37-C_WXyYuSjVjpOvOiAmm6ElbYg1g2zjQh7gpFCcv5GPdUfo",
                "Content-Type": "application/json",
            },
        }
        const response = await axios(options);
    } catch(error) {
        console.log(error);
    }
    // var message = {
    //     notification: {
    //         title: '$GOOG up 1.43% on the day',
    //         body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
    //     },
    //     token: registrationToken
    // };

    // // Send a message to the device corresponding to the provided
    // // registration token.
    // return admin.messaging().send(message);
}

app.listen(PORT, () => console.log("App started listening"));
// const server = https.createServer(certOptions, app)
// server.listen(443);
