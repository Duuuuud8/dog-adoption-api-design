const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    breed: {
        type: String,
        required: true
    },

    dogSkills: [{
        type: String,
    }],

    description: {
        type: String,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isAdopted: {
        type: Boolean,
        default: false
    },

    adoptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    thankYouMessage: {
        type: String,
        default: ""
    }
    
}, { timestamps: true});

module.exports = mongoose.model("Dog", dogSchema);