const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');

app.set('view engine', 'pug');
const server = http.createServer(app);
const io = require("socket.io")(server);

app.get('/', (req, res) => {
    res.status(200).json({ message: "Message from soundLounge backend" });
});

io.on('connection', (socket) => {

    io.emit("connection-event", "a new user connected!");

    socket.on("client-audio-packet", (blob) => {
        // socket.broadcast.emit("server-audio-packet", blob); // send to all clients except sender!
        io.emit("server-audio-packet", blob); // send to all clients, including sender!
    })

    console.log('User connected to socket.io server!');
});

if (module === require.main) {
    const PORT = parseInt(process.env.PORT) || 8080;
    server.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });
}

module.exports = server;
