const router = require("express").Router();
const { Router } = require("express");
const {createUser,verifyEmail,newEmail, logIn,updateUser,makeAdmin, makeSuperAdmin}= require("../Controllers/userController");
const {authenticator }= require("../helpers/authentication");
const {authorization,authorizationSuper} = require("../helpers/authorization");
const uploader = require("../helpers/multer")

router.post("/createuser",uploader.single("profilePicture"),createUser);

router.get("/verify/:id/:token",verifyEmail);

router.get("/newemail/:id",newEmail);


router.post("/logIn",logIn);

router.put("/updateUser/:id",authorization,updateUser);
router.put("/makeadmin/:id",authorizationSuper,makeAdmin);
router.put("/makeSuperAdmin/:id",authorizationSuper,makeSuperAdmin);

router.get("/",authenticator,(req,res)=>{
    res.status(200).json(`Welcome to my Homepage ${req.user}`)
});


module.exports= router;