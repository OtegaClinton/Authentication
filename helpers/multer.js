const multer = require("multer");

// Define storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./media");
    },
    filename: function (req, file, cb) {
        const fileName = req.body.Firstname; 
        const fileExtension = file.originalname.split('.').pop(); 
        cb(null, `${fileName}.${fileExtension}`); 
    }
});

// Define file filter function
const fileFilter = function (req, file, cb) {
    if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
        return cb(new Error("Only .jpg, .jpeg, and .png files are allowed"), false);
    }
    cb(null, true);
};

// Create the uploader with storage, file filter, and size limit options
const uploader = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 
    }
});

module.exports = uploader;
