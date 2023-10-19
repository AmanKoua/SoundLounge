'use strict';

// [START appengine_websockets_app]
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Server } = require("socket.io");

require('dotenv').config();

const User = require("./userModel");
const Room = require("./roomModel");
const { ObjectId } = require("mongodb");

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

    io.on('connection', (socket) => {

        console.log('User connected to socket.io server!');

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
            } catch (e) {
                console.log(e);
                socket.emit("user-signup-response", generateResponsePayload("error", "User creating failed!", 500));
                return;
            }

            socket.emit("user-signup-response", generateResponsePayload("message", token, 200));
            return;

        })

        // User login 

        socket.on("user-login", async (payload) => {

            if (!payload) {
                socket.emit("user-login-response", generateResponsePayload("error", "No login payload!", 400));
                return;
            }

            const email = payload.email;
            const password = payload.password;
            let token;

            if (!email || !password) {
                socket.emit("user-login-response", generateResponsePayload("error", "No email or password!", 400));
                return;
            }

            if (password.length < 7 || !email.includes("@")) {
                socket.emit("user-login-response", generateResponsePayload("error", "Invalid email or password!", 400));
                return;
            }

            const tempUsers = await User.find({ email: email });

            if (tempUsers.length == 0 || tempUsers.length > 1) {
                socket.emit("user-login-response", generateResponsePayload("error", "No user found for provided email!", 400));
                return;
            }

            const match = await bcrypt.compare(password, tempUsers[0].password);

            if (!match) {
                socket.emit("user-login-response", generateResponsePayload("error", "Invalid password!", 400));
                return;
            }

            try {
                const userId = tempUsers[0]._id.valueOf();
                token = jwt.sign(userId, process.env.JWTSECRET);
            } catch (e) {
                console.log(e);
                socket.emit("user-login-response", generateResponsePayload("error", "User login failed!", 500));
                return;
            }

            socket.emit("user-login-response", generateResponsePayload("message", token, 200));
            return;

        })

        // User create room

        socket.on("user-create-room", async (payload) => {

            if (!payload) {
                socket.emit("user-create-room-response", generateResponsePayload("error", "No create room payload!", 400));
                return;
            }

            const token = payload.token;
            const room = payload.room;

            if (!token || !room) {
                socket.emit("user-create-room-response", generateResponsePayload("error", "No token or room!", 400));
                return;
            }

            // Verify token

            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-create-room-response", generateResponsePayload("error", "Unauthorized room creation request!", 401));
                return;
            }

            const tempUsers = await User.find({ _id: userId });

            if (tempUsers.length == 0 || tempUsers.length > 1) {
                socket.emit("user-create-room-response", generateResponsePayload("error", "No user found for provided token!", 400));
                return;
            }

            let newRoom;

            try {
                newRoom = await Room.initialize(new ObjectId(userId), room.name, room.description, room.audioControlConfiguration, room.rotationTime)
            } catch (e) {
                console.log(e);
                socket.emit("user-create-room-response", generateResponsePayload("error", "Room creation failed!", 500));
                return;
            }

            await User.updateOne({ _id: new ObjectId(userId) }, { $push: { roomsList: newRoom._id } });

            socket.emit("user-create-room-response", generateResponsePayload("message", "room created successfully!", 200));
            return;

        })

        // user-delete-room

        socket.on("user-delete-room", async (payload) => {

            if (!payload) {
                socket.emit("user-delete-room-response", generateResponsePayload("error", "No delete room payload!", 400));
                return;
            }

            const token = payload.token;
            const roomId = payload.roomId;

            if (!token || !roomId) {
                socket.emit("user-delete-room-response", generateResponsePayload("error", "No token or roomId!", 400));
                return;
            }

            // Verify token

            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-delete-room-response", generateResponsePayload("error", "Unauthorized room deletion request!", 401));
                return;
            }

            const tempUsers = await User.find({ _id: userId });

            if (tempUsers.length == 0 || tempUsers.length > 1) {
                socket.emit("user-delete-room-response", generateResponsePayload("error", "No user found for provided token!", 400));
                return;
            }

            const userRoomsList = tempUsers[0].roomsList;
            let isRoomDeleted = false;

            for (let i = 0; i < userRoomsList.length; i++) {
                if (userRoomsList[i].valueOf() == roomId) {

                    let tempUserRoomsList = [];

                    for (let j = 0; j < userRoomsList.length; j++) {
                        if (userRoomsList[j].valueOf() != roomId) {
                            tempUserRoomsList.push(userRoomsList[j]);
                        }
                    }

                    await tempUsers[0].updateOne({ $set: { roomsList: tempUserRoomsList } });

                    await Room.deleteOne({ _id: roomId });
                    isRoomDeleted = true;
                    break;
                }
            }

            if (!isRoomDeleted) {
                socket.emit("user-delete-room-response", generateResponsePayload("error", "No room found for given user!", 400));
                return;
            }

            socket.emit("user-delete-room-response", generateResponsePayload("message", "room deleted successfully!", 200));
            return;

        })

        // user-edit-room

        socket.on("user-edit-room", async (payload) => {

            if (!payload) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "No edit room payload!", 400));
                return;
            }

            const token = payload.token;
            const roomId = payload.roomId;
            const data = payload.data;

            if (!token || !roomId || !data) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "No token, roomId, or data!", 400));
                return;
            }

            // Verify token

            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "Unauthorized room edit request!", 401));
                return;
            }

            const tempUsers = await User.find({ _id: userId });

            if (tempUsers.length == 0 || tempUsers.length > 1) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "No user found for provided token!", 400));
                return;
            }

            if (roomId.length != 24) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "Invalid room ID!", 400));
                return;
            }

            // TODO : Cannot create new objectID based on roomId? BSON bug
            const userRoom = await Room.findOne({ _id: roomId });

            if (!userRoom) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "No room found for provided id!", 400));
                return;
            }

            if (!tempUsers[0].roomsList.includes(userRoom._id)) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "Room does not belong to the provided user!", 400));
                return;
            }

            try {
                await userRoom.updateOne({ $set: { name: data.name, description: data.description, audioControlMode: data.audioControlConfiguration, rotationTimer: data.rotationTime } })
            } catch (e) {
                socket.emit("user-edit-room-response", generateResponsePayload("error", "Internal error when editing room!", 500));
                console.log(e);
            }

            socket.emit("user-edit-room-response", generateResponsePayload("message", "room edited successfully!", 200));
            return;

        })

        // user-get-rooms

        socket.on("user-get-rooms", async (payload) => {

            if (!payload) {
                socket.emit("user-get-rooms-response", generateResponsePayload("error", "No get room payload!", 400));
                return;
            }

            const token = payload.token;

            if (!token) {
                socket.emit("user-get-rooms-response", generateResponsePayload("error", "No token!", 400));
                return;
            }

            // Verify token

            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-get-rooms-response", generateResponsePayload("error", "Unauthorized room retrieval request!", 401));
                return;
            }

            const tempUsers = await User.find({ _id: userId });

            if (tempUsers.length == 0 || tempUsers.length > 1) {
                socket.emit("user-get-rooms-response", generateResponsePayload("error", "No user found for provided token!", 400));
                return;
            }

            let resPayload = {
                /*
                    RoomData = 
                    {
                        roomId: ...., 
                        ownerEmail:...,
                        roomName:.....,
                        roomDescription:....,
                        roomAudioControlMode:...,
                        roomRotationTimer:....,
                    }
                */

                rooms: [], // [RoomData, ...]
            }

            /*
                TODO : Get the rooms available to the user's friends as well
            */

            const userRoomsList = tempUsers[0].roomsList;

            for (let i = 0; i < userRoomsList.length; i++) {

                const room = await Room.findOne({ _id: userRoomsList[i] });

                if (room == null || room == undefined) {
                    continue;
                }

                let tempRoomData = {
                    id: room._id,
                    ownerEmail: tempUsers[0].email,
                    name: room.name,
                    description: room.description,
                    audioControlConfiguration: room.audioControlMode,
                    rotationTime: room.rotationTimer,
                    isNewRoom: false,
                }

                resPayload.rooms.push(tempRoomData);
            }

            socket.emit("user-get-rooms-response", generateResponsePayload("message", resPayload, 200));
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