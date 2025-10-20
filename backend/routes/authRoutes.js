const express = require("express");
const router = express.Router();


const authController = require("../controllers/authController");
const { upload } = require("../configs/cloudinary"); // Import the upload middleware

// Apply multer middleware to the register route for a single file upload with the field name 'avatar'
router.post("/register", upload.single("avatar"), authController.register);
router.post("/login", authController.login);

module.exports = router;