'use strict';

// [START appengine_websockets_app]
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

require('dotenv').config();

// Socket IO server

const io = new Server({
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        allowedHeaders: ["soundLounge-auth-test"],
    }
});

io.on('connection', (socket) => {

    io.emit("connection-event", "a new user connected!");

    socket.on("client-audio-packet", (blob) => { // This should never occur with new backend implementation
        console.log("audio packed received!");
        socket.broadcast.emit("server-audio-packet", blob); // send to all clients except sender!
        // io.emit("server-audio-packet", blob); // send to all clients, including sender!
    })

    // JWT Proof of concept testing

    socket.on("generateJWT", (data) => {

        let token;

        try {
            token = jwt.sign(data, process.env.JWTSECRET);
            io.emit("signedToken", token);

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

    console.log('User connected to socket.io server!');

    /*
        Get socket connection headers
        console.log(socket.handshake.headers);
    */

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