const mongoose = require("mongoose");

const dbURI = 
    process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;
        // chooses which database URI to use if test db use the test, else use the normal db

mongoose.connect(dbURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

module.exports = mongoose;