require("dotenv").config();
const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");

exports.authorization = async (req,res,next)=>{
    try {
        const token =  req.headers.authorization  && req.headers.authorization.split(" ")[1];

        if(!token){
            return res.status(400).json("Something went wrong.")
        }

        await jwt.verify(token,process.env.jwtSecret,(error,data)=>{
            if(error){
                return res.status(400).json("Kindly login to perform this action")

            }
               req.user = data.Firstname
            
        })

        const checkUser = await userModel.findOne({Firstname:req.user});

        if(checkUser.isAdmin == false || checkUser.isSuperAdmin == false){
            res.status(401).json("You are not permitted to do perform this action.")
        }else{
            next();
        
        }
       
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        
    }
};



// superADMIN
exports.authorizationSuper = async (req,res,next)=>{
    try {
        const token =  req.headers.authorization  && req.headers.authorization.split(" ")[1];

        if(!token){
            return res.status(400).json("Something went wrong.")
        }

        await jwt.verify(token,process.env.jwtSecret,(error,data)=>{
            if(error){
                return res.status(400).json("Kindly login to perform this action")

            }
               req.user = data.Firstname
            
        });

        const checkUser = await userModel.findOne({Firstname:req.user});

        if(checkUser.isSuperAdmin == false){
            res.status(401).json("You are not permitted to do perform this action.")
        }else{
            next();
        
        }
       
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        
    }
};