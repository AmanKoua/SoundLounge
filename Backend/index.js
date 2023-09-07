const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// const io = new Server(server);

// Socket IO server

const io = new Server({
    cors: {
        origin: "http://localhost:5173"
    }
});

io.on('connection', (socket) => {

    // socket.on("emit-test", (msg) => {
    //     io.emit("server-emit-test", "This is an emission from the server!");
    //     console.log(msg);
    // })

    socket.on("client-audio-packet", (blob) => {
        console.log("audio packet! " + blob);
    })

    console.log('User connected to socket.io server!');
});

io.listen(8010);


// Express REST API

/*
Allowed origins list does not seem to be required to esablish a socket io connection.
*/

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5173/",
]

const corsOptions = {
    origin: allowedOrigins,
}

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.status(200).json({ message: "Message from soundLounge backend" });
});

server.listen(8011, () => {
    console.log('listening on 8011');
});