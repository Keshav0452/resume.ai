const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const blacklistTokenModel =  require("../models/blacklist.model");

async function registerUsercontroller(req,res){
    try {
        const {username, email, password} = req.body;
        if (!username || !email || !password){
            return res.status(400).json({
                message: "Provide all the required information."
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or:[{username}, {email}]
        })

        if(isUserAlreadyExists){
            return res.status(401).json({
                message:"User already exists"
            })
        }

        const hash = await bcrypt.hash(password,10);

        const user = await userModel.create({
            username,
            email,
            password:hash
        })

        res.status(201).json({
            message:"User Successfully created",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
    } catch (error) {
        console.error("registerUsercontroller error:", error);
        res.status(500).json({ message: "Failed to register user", error: error.message });
    }
}

async function loginUserController(req,res){
    try {
        const {email,password} = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"Ivalid email or password"
            })
        }

        const isValidPassword = await bcrypt.compare(password,user.password);
        if (!isValidPassword){
            return res.status(400).json({
                message:"email or password is incorrect"
            })
        }

        const token = jwt.sign(
            {id:user._id, username:user.username},
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        )

        const isProd = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        res.status(200).json({
            message:"User login successfully",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
    } catch (error) {
        console.error("loginUserController error:", error);
        res.status(500).json({ message: "Failed to login user", error: error.message });
    }
}

async function logoutUserController(req,res){  
    try {
        const token = req.cookies.token;

        if(token){
            await blacklistTokenModel.create({token});
        }

        const isProd = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax"
        });

        res.status(200).json({
            message:"user successfully logged out."
        })
    } catch (error) {
        console.error("logoutUserController error:", error);
        res.status(500).json({ message: "Failed to logout user", error: error.message });
    }
}

async function getMeController(req,res){
    try {
        const user  = await userModel.findById(req.user.id);

        return res.status(200).json({
            message:"User Information fetched successfully",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
    } catch (error) {
        console.error("getMeController error:", error);
        res.status(500).json({ message: "Failed to fetch user data", error: error.message });
    }
}

module.exports = {
    registerUsercontroller,
    loginUserController,
    logoutUserController,
    getMeController
}