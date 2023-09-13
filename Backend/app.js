'use strict';

// [START appengine_websockets_app]
const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

// Socket IO server

const io = new Server({
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"]
    }
});

io.on('connection', (socket) => {

    io.emit("connection-event", "a new user connected!");

    socket.on("client-audio-packet", (blob) => { // This should never occur with new backend implementation
        socket.broadcast.emit("server-audio-packet", blob); // send to all clients except sender!
        // io.emit("server-audio-packet", blob); // send to all clients, including sender!
    })

    socket.on("client-socket-test", (msg) => {
        io.emit("server-socket-test", msg);
    })

    console.log('User connected to socket.io server!');
});

if (module === require.main) {
    const PORT = parseInt(process.env.PORT) || 8080;
    io.listen(PORT, () => {
        console.log("IO listening on " + PORT);
    });
}


// Express REST API

/*
Allowed origins list does not seem to be required to esablish a socket io connection.
*/

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5173/",
    "http://localhost:5174",
    "http://localhost:5173/",
]

const corsOptions = {
    origin: allowedOrigins,
}

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    const PORT = parseInt(process.env.PORT) || 8080;
    res.status(200).json({ message: "Message from soundLounge backend " + PORT });
});

// if (module === require.main) {
//     const PORT = parseInt(process.env.PORT) || 8080;
//     server.listen(PORT, () => {
//         console.log(`App listening on port ${PORT}`);
//         console.log('Press Ctrl+C to quit.');
//     });
// }
// [END appengine_websockets_app]

module.exports = server;

// ----------------------------------------------------------------------