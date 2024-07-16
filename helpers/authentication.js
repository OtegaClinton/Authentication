require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.authenticator = async (req,res,next)=>{
    try {
        const token =  req.headers.authorization  && req.headers.authorization.split(" ")[1];

        if(!token){
            return res.status(400).json("Something went wrong.")
        }

        await jwt.verify(token,process.env.jwtSecret,(error,data)=>{
            if(error){
                return res.status(400).json("Kindly login to perform this action")

            }else{
                req.user = data.Firstname
            }
        })
        next();
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        
    }
};