const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    Firstname:{
        type: String,
        required: [true,'First name is required.']
    },
    Lastname: {
        type: String,
        required: [true,'Last Name is required.']
    },
    Email:{
        type: String,
        required:[true,'Email is required.'],
        // unique: true
    },
    Password:{
        type: String,
        required:[true,'password is required.']
    },
    PhoneNumber:{
        type: String,
        required: [true,'Phone number is required.']
    }, 

    isAdmin:{
        type: Boolean,
        default:false
    },

    isSuperAdmin:{
        type: Boolean,
        default:false
    },

    isVerified: {
        type:Boolean,
        default: false
    },

    profilePicture:{
        pictureUrl: String,
        pictureId:String
    }
}, {timestamps: true});

const userModel = mongoose.model("User Authentication",userSchema);


module.exports = userModel;