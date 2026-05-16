const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    registeredDogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dog"
    }],

    adoptedDogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dog"
    }]
});

module.exports = mongoose.model("User", userSchema);