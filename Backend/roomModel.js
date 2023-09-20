const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const roomSchema = new Schema({

    owner: {
        type: ObjectId,
        required: true,
        unique: false,
    },

    name: {
        type: String,
        required: true,
        unique: false,
    },

    description: {
        type: String,
        required: true,
        unique: false,
    },

    audioControlMode: {
        type: Number,
        required: true,
        unique: false,
    },

    rotationTimer: {
        type: Number,
        required: true,
        unique: false,
    }

});

roomSchema.statics.initialize = async function (owner, name, description, audioControlMode, rotationTimer) {

    if (!owner || !name || !description || (audioControlMode == null || audioControlMode == undefined) || !rotationTimer) {
        throw Error("Required fields missing for initializing listening room!");
    }

    // const userRooms = await this.findOne({ owner: owner });

    // if (userRooms) {
    //     throw Error("User already has listening room registered");
    // }

    const room = await this.create({ owner, name, description, audioControlMode, rotationTimer });

    return room;
}

module.exports = mongoose.model('Room', roomSchema)