require ("dotenv").config();
const express = require("express");
require('./config/database');
const router = require("./Routers/userRouter")
const multer=require("multer")

const app = express();
app.use(express.json());

app.use("/api/v1/",router);

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ message: error.message });
    } else if (error) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ message: error.message });
    }

    // Everything went fine. 
    next(); 
});  

app.get('/api/v1/logIn', (req, res) => {
    res.send('Login Page'); 
});


const Port = process.env.PORT || 1313
app.listen(Port,()=>{
    console.log(`server is listening to PORT: ${Port}.`)
});
