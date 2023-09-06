const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5173/"
]

const corsOptions = {
    origin: allowedOrigins,
}

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.status(200).json({ message: "Message from soundLounge backend" });
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(8010, () => {
    console.log('listening on 8010');
});