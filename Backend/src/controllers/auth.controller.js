const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = reuire("bcrypt");

async function registerUsercontroller(req,res){
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

    const hash = await bcrpyt.hash(password,10);

    const user = new userModel.create({
        username,
        email,
        password:hash
    })

    const token = jwt.sign(
        {id:user._id,username:user,username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

    res.cookie("token",token);
    res.status(201).json({
        message:"User Successfully created",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

async function loginUserController(req,res){
    const {email,password} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(400).json({
            message:"Ivalid email or password"
        })
    }

    const isValidPassword = await bcrypt.compare(passwors,user.password);
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

    res.cookie("token",token)

    res.status(200).json({
        message:"User login successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

async function logoutUserController(req,res){

}

async function getMeController(req,res){
    const user  = await userModel.findById(req.user.id);

    return res.status(200).json({
        message:"User Information fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

module.exports = {
    registerUsercontroller,
    loginUserController,
    logoutUserController,
    getMeController
}