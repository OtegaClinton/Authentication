require("dotenv").config();
const userModel = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const sendMail=require("../helpers/email");
const html = require("../helpers/html");
const jwt =require("jsonwebtoken");
const cloudinary = require("../helpers/cloudinary");
const fileSystem = require("fs");

exports.createUser = async (req,res)=>{
    try {

        const {Firstname,Lastname,Email,Password,PhoneNumber}= req.body;

        const bcryptPassword = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hashSync(Password,bcryptPassword);

        if (!req.file) {
            return res.status(400).json({ message: 'Profile picture is required' });
        }

        const cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users_dp" }, (error, data) => {
            if (error) {
                return res.status(400).json({
                    message: error.message
                });
            } else {
                return res.status(200).json({
                    message: 'Upload successful',
                    data
                });
            }
        });
        
        
        const data = {
            Firstname,
            Lastname,
            Email:Email.toLowerCase(),
            Password:hashedPassword,
            PhoneNumber,
            profilePicture:{
                pictureId:cloudProfile.public_id,
                pictureUrl:cloudProfile.secure_url
            }
        }


        const createdUser = await userModel.create(data);

        fileSystem.unlink(req.file.path,(error)=>{
            if(error){
                return res.status(400).json({
                    message:"unable to delete users profile picture",error
                })            
            }
        });

        const userToken = jwt.sign({id:createdUser._id, email:createdUser.email}, process.env.jwtSecret, {expiresIn: "3 minutes"});

        const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${createdUser._id}/${userToken}`

        sendMail({
            subject:`Kindly verify your mail.`,
            email: createdUser.Email,
            html: html(verifyLink,createdUser.Firstname)
            // message: `Welcome ${createdUser.Firstname}, ${createdUser.Lastname} kindly click on the button  below to verify your account`
        });

        res.status(201).json({
            message:`Welcome ${createdUser.Firstname}, kindly check your gmail to access the link to verify your email.`,
            data: createdUser
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        
    }

};


exports.verifyEmail = async(req,res) => {
    try {
        const id = req.params.id;
        const findUser= await userModel.findByIdA(id);
         await jwt.verify(req.params.token, process.env.jwtSecret,(error)=>{
            if(error){
                const link = `${req.protocol}://${req.get("host")}/api/v1/newemail/${findUser._id}`
             sendMail({ subject : ` Kindly Verify your mail`,
                email:findUser.email,
                html: html(link,findUser.Firstname)

             })
             return res.json(`This link has expired,kindly check your email link`)

            }else{
                if(findUser.isVerified == true){
                    return res.status(400).json('your account has already been verified')
                }
                userModel.findByIdAndUpdate(id,{isVerified:true});
                res.status(200).json(`you have been verified,kindly go ahead and log in`)
            }
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
        
    }
}


exports.newEmail = async (req,res) => {
    try {
        const user = await userModel.findById(re.params.id);
        const userToken = jwt.sign({id:user._id,email:user.Email},process.env.jwtSecret, {expiresIn: "3 Minutes"});

        const  reverifyLink =`${req.protocol}://${req.get("host")}/api/v1/${user._id}/${userToken}`;

        sendMail({
            subject:"Kindly verify your email",
            email: user.Email,
            html: html(reverifyLink, user.Firstname)
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
        
    }

}


exports.logIn = async (req,res) =>{
    try {
        const {Email,Password}= req.body;

        const findWithEmail = await userModel.findOne({Email:Email.toLowerCase()});

        if(!findWithEmail){
            return res.status(404).json({
                message:`user with ${Email} does not exist.`
            })

        }
        
        const checkPassword = await bcrypt.compare(Password, findWithEmail.Password);

        if(!checkPassword){
            return res.status(400).json({
                message: `incorrect password.`
            })
        }

       const user= await jwt.sign({id:findWithEmail._id},process.env.jwtSecret,{expiresIn: "7 Minutes"});

       const  {isVerified,PhoneNumber,createdAt,updatedAt,__v,isAdmin,isSuperAdmin, ...others} = findWithEmail._doc;

        res.status(200).json({
            message:`Login succcessful.`,
            data: others,
            token: user
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message 
        })
        
    }
};


exports.updateUser= async(req,res)=>{
    try {
        const userId = req.params.id;
        const {Firstname,Lastname,PhoneNumber}=req.body;
        const data = {Firstname,Lastname,PhoneNumber};
    
        const updatedUser = await userModel.findByIdAndUpdate(userId,data,{new:true});
    
        res.status(200).json({
            message:`user with ID:${userId} was updated  successfully.`,
            data: updatedUser
        });
        
    } catch (error) {
        res.status(500).json({
            message:error.message 
        })
        
    }
 
};

exports.makeAdmin= async(req,res)=>{
    try {
        const newAdmin = await userModel.findByIdAndUpdate(req.params.id,{isAdmin:true});

        res.status(200).json({
            message:`${newAdmin.Firstname} is now an ADMIN.`
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message 
        })
        
    }
};

exports.makeSuperAdmin= async(req,res)=>{
    try {
        const newSuperAdmin = await userModel.findByIdAndUpdate(req.params.id,{isAdmin:true});

        res.status(200).json({
            message:`${newSuperAdmin.Firstname} is now an SUPER ADMIN.`
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message 
        })
        
    }
}


exports.updatePicture = async (req, res) => {
    try {
        // Extract token from headers
        const userToken = req.headers.authorization.split(" ")[1];

        // Check if file is provided
        if (!req.file) {
            return res.status(400).json({ message: "No profile picture selected" });
        }

        // Verify token
        jwt.verify(userToken, process.env.jwtSecret, async (error, newUser) => {
            if (error) {
                return res.status(400).json({ message: "Could not authenticate" });
            } else {
                const userId = newUser.id;

                // Find user to get the current profile picture
                const user = await userModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                // Save the current profile picture details
                const formerImage = {
                    pictureId: user.profilePicture.pictureId,
                    pictureUrl: user.profilePicture.pictureUrl
                };

                // Upload new profile picture to Cloudinary
                const cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users_dp" },{new:true});

                // Prepare update data
                const pictureUpdate = {
                    profilePicture: {
                        pictureId: cloudProfile.public_id,
                        pictureUrl: cloudProfile.secure_url,
                        formerImages: [...user.profilePicture.formerImages, formerImage] // Save old picture details
                    }
                };

                // Update user profile picture
                const updatedUser = await userModel.findByIdAndUpdate(userId, pictureUpdate, { new: true });

                //delete the picture from media folder
                fileSystem.unlink(req.file.path,(error)=>{
                    if(error){
                        return res.status(400).json({
                            message:"unable to delete users profile picture",error
                        })            
                    }
                });

                // Return success response
                return res.status(200).json({
                    message: "User image successfully changed",
                    data: updatedUser.profilePicture
                });
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
