const cloudinary = require('cloudinary');
require("dotenv").config();

const api_key = process.env.api_key

cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: api_key,
  api_secret: process.env.api_secret,
  secure: true,
});

module.exports = cloudinary;