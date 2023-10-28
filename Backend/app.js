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

let generateRandomString = (length) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset.charAt(randomIndex);
    }

    return randomString;
}

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

        // Testing - user gets audio packet

        socket.on("client-audio-packet", (blob) => { // This should never occur with new backend implementation
            console.log("audio packed received!");
            socket.broadcast.emit("server-audio-packet", blob); // send to all clients except sender!
            // io.emit("server-audio-packet", blob); // send to all clients, including sender!
        })

        // User sign up

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

            for (let j = 0; j < tempUsers[0].friendsList.length; j++) {

                const tempFriend = await User.findOne({ _id: tempUsers[0].friendsList[j] });

                if (!tempFriend) {
                    continue;
                }

                const tempFriendRoomsList = tempFriend.roomsList;

                for (let i = 0; i < tempFriendRoomsList.length; i++) {

                    const room = await Room.findOne({ _id: tempFriendRoomsList[i] });

                    if (room == null || room == undefined) {
                        continue;
                    }

                    let tempRoomData = {
                        id: room._id,
                        ownerEmail: tempFriend.email,
                        name: room.name,
                        description: room.description,
                        audioControlConfiguration: room.audioControlMode,
                        rotationTime: room.rotationTimer,
                        isNewRoom: false,
                    }

                    resPayload.rooms.push(tempRoomData);
                }

            }

            socket.emit("user-get-rooms-response", generateResponsePayload("message", resPayload, 200));
            return;

        })

        // user-join-room

        socket.on("user-join-room", async (payload) => {

            if (!payload) {
                socket.emit("user-join-room-response", generateResponsePayload("error", "No join room payload!", 400));
                return;
            }

            if (!payload.token || !payload.roomId) {
                socket.emit("user-join-room-response", generateResponsePayload("error", "No token or roomId for join room request", 400));
                return;
            }

            if (payload.roomId.length != 24) {
                socket.emit("user-join-room-response", generateResponsePayload("error", "Invalid join room request!", 400));
                return;
            }

            const token = payload.token;
            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-join-room-response", generateResponsePayload("error", "Unauthorized join room request!", 401));
                return;
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                socket.emit("user-join-room-response", generateResponsePayload("error", "No user found for provided token!", 404));
                return;
            }

            socket.userId = user._id.toString();
            socket.email = user.email;
            socket.isBroadcasting = undefined;
            socket.isOwner = undefined;
            socket.currentRoom = undefined;

            let tempRoom = await Room.findOne({ _id: payload.roomId });

            if (!tempRoom) {
                socket.emit("user-join-room-response", generateResponsePayload("error", "No room found for provided id!", 404));
                return;
            }

            if (tempRoom.owner.toString() == socket.userId) {
                socket.isOwner = true;
            }
            else {
                socket.isOwner = false;
            }

            // Leave all rooms a user is currently in before joining a new room

            let currentUserRooms = socket.rooms;

            if (currentUserRooms) {

                let currentUserRoomsIterator = currentUserRooms.values();
                let isFinished = false;
                let temp = undefined;

                while (!isFinished) {

                    temp = currentUserRoomsIterator.next();

                    if (!temp.value || temp.done == true) {
                        isFinished = true;
                        break;
                    }

                    socket.leave(temp.value);

                }

            }

            // Join new room if less than 4 occupants and get occupants profile data

            let occupants = io.sockets.adapter.rooms.get(`${payload.roomId}`); // retrieves the set of socket IDs currently in the given room
            let occupantsList = [];
            let responsePayload = [];

            if (occupants) { // occupants is undefined if room is empty

                let occupantsIterator = occupants.values(); // will only return an occupants iterator if not undefined
                let isFinished = false;
                let temp = undefined;

                while (!isFinished) {
                    temp = occupantsIterator.next();

                    if (temp.value == undefined || temp.done == true) {
                        isFinished = true;
                        break;
                    }

                    let tempSocket = io.sockets.sockets.get(temp.value); // retrieve socket by socketId
                    occupantsList.push(tempSocket.userId);

                    let tempUser = await User.findOne({ _id: tempSocket.userId });

                    if (!tempUser) {
                        // should be an impossible case, but continue nonetheless
                        continue;
                    }

                    const tempUserProfileSlice = {
                        email: tempUser.email,
                        id: tempSocket.userId,
                        isOwner: tempSocket.isOwner,
                        isBroadcasting: tempSocket.isBroadcasting,
                    }

                    responsePayload.push(tempUserProfileSlice);

                }

            }

            if (occupantsList.length < 4) {
                socket.join(`${payload.roomId}`);
                socket.currentRoom = payload.roomId;

                const selfProfileSlice = {
                    email: user.email,
                    id: user._id.toString(),
                    isOwner: socket.isOwner,
                    isBroadcasting: socket.isBroadcasting,
                }

                responsePayload.push(selfProfileSlice);

                occupantsList.push(socket.userId);
            }
            else {
                socket.emit("user-join-room-response", generateResponsePayload("error", "Cannot join full room!", 500));
                return;
            }

            socket.emit("user-join-room-response", generateResponsePayload("message", responsePayload, 200));
            return;

        })

        // user-get-friends-list

        socket.on("user-get-friends-list", async (payload) => {

            if (!payload) {
                socket.emit("user-get-friends-list-response", generateResponsePayload("error", "No friend request payload!", 400));
                return;
            }

            if (!payload.token) {
                socket.emit("user-get-friends-list-response", generateResponsePayload("error", "No token for get friends list request!", 400));
                return;
            }

            const token = payload.token;
            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-get-friends-list-response", generateResponsePayload("error", "Unauthorized friends list request!", 401));
                return;
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                socket.emit("user-get-friends-list-response", generateResponsePayload("error", "No user found for provided token!", 404));
                return;
            }

            const userFriendsSlice = [];
            const userFriends = user.friendsList;

            for (let i = 0; i < userFriends.length; i++) {
                const tempFriend = await User.findOne({ _id: userFriends[i] });

                if (!tempFriend) {
                    continue;
                }

                const tempFriendProfileSlice = {
                    id: tempFriend._id,
                    email: tempFriend.email,
                    roomsList: tempFriend.roomsList,
                }

                userFriendsSlice.push(tempFriendProfileSlice);
            }

            socket.emit("user-get-friends-list-response", generateResponsePayload("message", userFriendsSlice, 200));
            return;

        })

        // user-send-friend-request

        socket.on("user-send-friend-request", async (payload) => {

            if (!payload) {
                socket.emit("user-send-friend-request-response", generateResponsePayload("error", "No friend request payload!", 400));
                return;
            }

            if (!payload.token || !payload.email) {
                socket.emit("user-send-friend-request-response", generateResponsePayload("error", "No token or email for friend request", 400));
                return;
            }

            const token = payload.token;
            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-send-friend-request-response", generateResponsePayload("error", "Unauthorized friend request!", 401));
                return;
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                socket.emit("user-send-friend-request-response", generateResponsePayload("error", "No user found for provided token!", 404));
                return;
            }

            if (user.email == payload.email) {
                socket.emit("user-send-friend-request-response", generateResponsePayload("error", "Cannot send a friend request to yourself!", 400));
                return;
            }

            const userActionItems = user.actionItems;

            for (let i = 0; i < userActionItems.length; i++) {
                if (userActionItems[i].email == payload.email) {
                    socket.emit("user-send-friend-request-response", generateResponsePayload("error", "Cannot send a friend request again!", 400));
                    return;
                }
            }

            let friend = await User.findOne({ email: payload.email });

            if (!friend) {
                socket.emit("user-send-friend-request-response", generateResponsePayload("error", "No user found for provided email!", 404));
                return;
            }

            const userFriendsList = user.friendsList;
            let isAlreadyFriend = false;

            for (let i = 0; i < userFriendsList.length; i++) {

                let tempFriend = await User.findOne({ _id: userFriendsList[i] });

                if (!tempFriend) {
                    continue;
                }

                if (tempFriend.email == payload.email) {
                    isAlreadyFriend = true;
                    break;
                }

            }

            if (isAlreadyFriend) {
                socket.emit("user-send-friend-request-response", generateResponsePayload("error", "cannot add a user that's already a friend!", 400));
                return;
            }

            // add action item to user and friend actionItems field

            const requestId = generateRandomString(30);

            const userActionItem = {
                requestId: requestId,
                type: "outgoingFriendRequest",
                email: payload.email,
                status: "pending"
            }

            const friendActionItem = {
                requestId: requestId,
                type: "incommingFriendRequest",
                email: user.email,
                status: "pending"
            }

            // await User.updateOne({ _id: new ObjectId(userId) }, { $push: { roomsList: newRoom._id } });

            await user.updateOne({ $push: { actionItems: userActionItem } });
            await friend.updateOne({ $push: { actionItems: friendActionItem } });

            socket.emit("user-send-friend-request-response", generateResponsePayload("message", "Successfully sent friend request!", 200));
            return;

        })

        // user-get-friend-requests

        socket.on("user-get-friend-requests", async (payload) => {

            if (!payload) {
                socket.emit("user-get-friend-requests-response", generateResponsePayload("error", "No get friend request payload!", 400));
                return;
            }

            if (!payload.token) {
                socket.emit("user-get-friend-requests-response", generateResponsePayload("error", "No token to get friend requests", 400));
                return;
            }

            const token = payload.token;
            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-get-friend-requests-response", generateResponsePayload("error", "Unauthorized get friend requests request!", 401));
                return;
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                socket.emit("user-get-friend-requests-response", generateResponsePayload("error", "No user found for provided token!", 404));
                return;
            }

            const userActionItems = user.actionItems;
            const userFriendRequests = [];

            for (let i = 0; i < userActionItems.length; i++) {
                if (userActionItems[i].type == "incommingFriendRequest" || userActionItems[i].type == "outgoingFriendRequest") {
                    userFriendRequests.push(userActionItems[i]);
                }
            }

            socket.emit("user-get-friend-requests-response", generateResponsePayload("message", userFriendRequests, 200));
            return;

        });

        // user-handle-incomming-friend-request

        socket.on("user-handle-incomming-friend-request", async (payload) => {

            if (!payload) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "No handle friend request payload!", 400));
                return;
            }

            if (!payload.requestId || !payload.response) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "No handle friend request requestId or response!!", 400));
                return;
            }

            if (!payload.token) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "No token to handle friend requests", 400));
                return;
            }

            const validResponses = ["accept", "reject"];

            if (!validResponses.includes(payload.response)) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "Invalid handle friend request response!", 400));
                return;
            }

            const token = payload.token;
            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "Unauthorized handle friend requests request!", 403));
                return;
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "No user found for provided token!", 404));
                return;
            }

            let userActionItem = undefined;
            let userActionItems = user.actionItems;
            let newUserActionItems = [];
            let friendActionItem = undefined;
            let friendActionItems = undefined;
            let newFriendActionItems = [];

            for (let i = 0; i < userActionItems.length; i++) {
                if (userActionItems[i].requestId == payload.requestId) {
                    userActionItem = userActionItems[i];
                    break;
                }
            }

            if (userActionItem == undefined) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "No action item found for provided request id!", 404));
                return;
            }

            const friend = await User.findOne({ email: userActionItem.email });

            if (!friend) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "no friend found for provided action item id!", 404));
                return;
            }

            friendActionItems = friend.actionItems;

            for (let i = 0; i < friendActionItems.length; i++) {
                if (friendActionItems[i].requestId == payload.requestId) {
                    friendActionItem = friendActionItems[i];
                    break;
                }
            }

            if (friendActionItem == undefined) {
                socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("error", "No friend action item found for provided request id!", 404));
                return;
            }

            for (let i = 0; i < userActionItems.length; i++) { // Remove handled action item from user's action items array
                if (userActionItems[i].requestId != payload.requestId) {
                    newUserActionItems.push(userActionItems[i]);
                }
            }

            for (let i = 0; i < friendActionItems.length; i++) { // Update handled action item in friend's action item array
                if (friendActionItems[i].requestId == payload.requestId) {
                    const tempActionItem = {
                        requestId: friendActionItems[i].requestId,
                        type: friendActionItems[i].type,
                        email: friendActionItems[i].email,
                        status: payload.response
                    }
                    newFriendActionItems.push(tempActionItem);
                }
                else {
                    newFriendActionItems.push(friendActionItems[i]);
                }
            }

            if (payload.response == "accept") {
                await user.updateOne({ $push: { friendsList: friend._id } });
                await friend.updateOne({ $push: { friendsList: user._id } });
            }
            else {
                // do nothing
            }

            await user.updateOne({ actionItems: newUserActionItems });
            await friend.updateOne({ actionItems: newFriendActionItems });

            socket.emit("user-handle-incomming-friend-request-response", generateResponsePayload("message", "Successfully handled friend request!", 200));
            return;

        })

        // user-remove-friend-request-card

        socket.on("user-remove-friend-request-card", async (payload) => {

            if (!payload) {
                socket.emit("user-remove-friend-request-card-response", generateResponsePayload("error", "No remove request card payload!", 400));
                return;
            }

            if (!payload.token || !payload.requestId) {
                socket.emit("user-remove-friend-request-card-response", generateResponsePayload("error", "Invalid payload for remove friend request card!", 400));
                return;
            }

            const token = payload.token;
            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-remove-friend-request-card-response", generateResponsePayload("error", "Unauthorized remove friend request card request!", 401));
                return;
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                socket.emit("user-remove-friend-request-card-response", generateResponsePayload("error", "No user found for provided token!", 404));
                return;
            }

            let userActionItems = user.actionItems;
            let tempIdx = undefined;

            for (let i = 0; i < userActionItems.length; i++) {
                if (userActionItems[i].requestId == payload.requestId) {
                    tempIdx = i;
                    break;
                }
            }

            if (tempIdx == undefined) {
                socket.emit("user-remove-friend-request-card-response", generateResponsePayload("error", "No request found for provided id!", 404));
                return;
            }

            if (userActionItems[tempIdx].status == "pending") {
                socket.emit("user-remove-friend-request-card-response", generateResponsePayload("error", "Cannot remove a friend request card that is pending!", 404));
                return;
            }

            userActionItems.splice(tempIdx, 1);
            await user.updateOne({ actionItems: userActionItems });

            socket.emit("user-remove-friend-request-card-response", generateResponsePayload("message", "Request removed successfully!", 200));
            return;

        })

        // user-remove-friend

        socket.on("user-remove-friend", async (payload) => {

            if (!payload) {
                socket.emit("user-remove-friend-response", generateResponsePayload("error", "No remove friend payload!", 400));
                return;
            }

            if (!payload.token || !payload.friendId) {
                socket.emit("user-remove-friend-response", generateResponsePayload("error", "Invalid payload for remove friend request!", 400));
                return;
            }

            const token = payload.token;
            let userId;

            try {
                userId = jwt.verify(token, process.env.JWTSECRET)
            } catch (e) {
                socket.emit("user-remove-friend-response", generateResponsePayload("error", "Unauthorized remove friend request!", 401));
                return;
            }

            const user = await User.findOne({ _id: userId });

            if (!user) {
                socket.emit("user-remove-friend-response", generateResponsePayload("error", "No user found for provided token!", 404));
                return;
            }

            const friend = await User.findOne({ _id: payload.friendId });

            if (!friend) {
                socket.emit("user-remove-friend-response", generateResponsePayload("error", "No friend found for provided id!", 404));
                return;
            }

            let newUserFriendsList = user.friendsList;
            let newFriendFriendsList = friend.friendsList;

            let userFriendIndex = newUserFriendsList.indexOf(friend._id);
            let friendUserIndex = newFriendFriendsList.indexOf(user._id);

            if (userFriendIndex < 0 || friendUserIndex < 0) {
                socket.emit("user-remove-friend-response", generateResponsePayload("error", "No friend in user or friend's friend list!", 404));
                return;
            }

            newUserFriendsList.splice(userFriendIndex, 1);
            newFriendFriendsList.splice(friendUserIndex, 1);

            await user.updateOne({ $set: { friendsList: newUserFriendsList } });
            await friend.updateOne({ $set: { friendsList: newFriendFriendsList } });

            socket.emit("user-remove-friend-response", generateResponsePayload("message", "successfully removed friend!", 200));
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