const express = require("express")
const router =express.Router()

const multer = require("multer")
const upload = multer({dest:"tmp_uploads/"})

const {verifyToken} = require("../middlewares/auth")
const userActivityController = require("../controllers/userCointroller")

router.post("/save-record",verifyToken, upload.single("image"),userActivityController.saveRecord)
router.get('/user-records',verifyToken, userActivityController.fetchRecords);

router.get('/user-records/:id',verifyToken,userActivityController.fetchRecordById);

module.exports = router 