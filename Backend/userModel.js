const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        unique: false,
    },

    roomsList: {
        type: [], // [ObjectId]
        required: true,
        unique: false,
    },

    friendsList: {
        type: [], // [ObjectId]
        required: true,
        unique: false,
    },

    actionItems: {

        /*

        ActionItem = {
            type : [“incommingFriendRequest” or “outgoingFriendRequest”], 
            email: …. , 
            status: “pending” or “rejected” or “accepted”
        }

        */

        type: [], // [ ActionItems ]
        required: true,
        unique: false,
    }

});

userSchema.statics.signup = async function (email, password) {

    if (!email || !password) {
        throw Error("Missing required fields!");
    }

    if (!email.includes("@")) {
        throw Error("Invalid email!");
    }

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("Email already in use!");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await this.create({ email, password: hash })

    return user;
}

userSchema.statics.login = async function (email, password) {

    if (!email || !password) {
        throw Error("Required fields missing!");
    }

    const user = await this.findOne({ email });

    if (!user) {
        throw Error("Invalid email!");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw Error("Invalid password!");
    }

    return user;
}

module.exports = mongoose.model('User', userSchema)