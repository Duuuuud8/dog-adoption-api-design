const express = require("express");
const cors = require("cors");
    // let's frontend localhost:5173 talk to localhost:3000
const authRoutes = require("./routes/authRoutes");
const dogRoutes = require("./routes/dogRoutes");


const app = express();


app.use(cors());
app.use(express.json());


app.use("/auth", authRoutes);
    // "Everything in authRoutes.js starts with /auth"
    // connects to authroutes

app.use("/dogs", dogRoutes);

app.get("/", (req, res) => {
    res.json({message:"Dog Adoption API Running"});
});


module.exports = app;