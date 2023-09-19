'use strict';

// [START appengine_websockets_app]
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

require('dotenv').config();

const User = require("./userModel");

const generateResponsePayload = (type, data, status) => {
    const payload = {
        type: type,
        data: data,
        status: status,
    }
    return payload;
}

// Socket IO server

const io = new Server({
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        allowedHeaders: ["soundLounge-auth-test"],
    }
});

mongoose.connect(process.env.MONGO_URI).then(async () => { // Connect to mongoDb cluster

    console.log('User connected to socket.io server!');

    io.on('connection', (socket) => {

        // Proof of concept audio packet transmission

        io.emit("connection-event", "a new user connected!");

        socket.on("client-audio-packet", (blob) => { // This should never occur with new backend implementation
            console.log("audio packed received!");
            socket.broadcast.emit("server-audio-packet", blob); // send to all clients except sender!
            // io.emit("server-audio-packet", blob); // send to all clients, including sender!
        })


        // User sign up and log in

        socket.on("user-signup", async (payload) => {

            if (!payload) {
                socket.emit("user-signup-response", generateResponsePayload("error", "No signup payload!", 400));
                return;
            }

            const email = payload.email;
            const password = payload.password;
            let user;
            let token;

            if (!email || !password) {
                socket.emit("user-signup-response", generateResponsePayload("error", "No email or password!", 400));
                return;
            }

            if (password.length < 7 || !email.includes("@")) {
                socket.emit("user-signup-response", generateResponsePayload("error", "Invalid email or password!", 400));
                return;
            }

            const tempUsers = await User.find({ email: email });

            if (tempUsers.length > 0) {
                socket.emit("user-signup-response", generateResponsePayload("error", "Email is already in use!", 400));
                return;
            }

            try {
                user = await User.signup(email, password);
                const userId = user._id.valueOf();
                token = jwt.sign(userId, process.env.JWTSECRET);
                // TODO : Finished here!
            } catch (e) {
                console.log(e);
                socket.emit("user-signup-response", generateResponsePayload("error", "User creating failed!", 500));
                return;
            }

            socket.emit("user-signup-response", generateResponsePayload("message", token, 200));
            return;

        })

        // JWT Proof of concept testing

        socket.on("generateJWT", (data) => {

            let token;

            try {
                token = jwt.sign(data, process.env.JWTSECRET);
                socket.emit("signedToken", token);

            } catch (e) {
                console.log(e);
            }

        })

        socket.on("decodeJWT", (data) => {
            let token;

            try {
                token = jwt.verify(data, process.env.JWTSECRET);
                console.log(`The decoded token is: ${token}`);

            } catch (e) {
                console.log(e);
            }
        })


        /*
            Get socket connection headers
            console.log(socket.handshake.headers);
        */

    });

}).catch((e) => {
    console.log(e);
});


if (module === require.main) {
    const PORT = parseInt(process.env.PORT) || 8080;
    io.listen(PORT, () => {
        console.log("IO listening on " + PORT);
    });
}

/*
 Express REST API was removed. Opting do handle everything over socketIO.
*/