// Logic for handling incoming requests and returning responses to the client
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const registerUser = async (req, res) => {
    try{
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({
            username,
            password: hashedPassword
        });
        
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
       
        res.status(201).json({
            message: "User registered successfully",
            token
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const loginUser = async (req, res, next) => {
    try{
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if(!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if(!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};