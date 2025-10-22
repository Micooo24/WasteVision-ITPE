const express = require("express")
const router =express.Router()

const { upload } = require("../configs/cloudinary"); // Import the upload middleware

const {verifyToken} = require("../middlewares/auth")
const userActivityController = require("../controllers/userController")

router.post("/save-record",verifyToken, upload.single("image"),userActivityController.saveRecord)
router.get('/user-records',verifyToken, userActivityController.fetchRecords);

router.get('/user-records/:id',verifyToken,userActivityController.fetchRecordById);

module.exports = router 