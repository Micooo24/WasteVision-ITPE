const UserActivity = require("../models/userActivity");
const User = require("../models/user");
const cloudinary = require("../configs/cloudinary");
const fs = require("fs");

exports.saveRecord = async (req, res) => {
  try {
    if (!req.body) throw new Error("undefined body");
    if (!req.file) throw new Error("File is undefined");
        // console.log(req.user)

    const uploads = await cloudinary.uploader.upload(req.file.path, {
      folder: "wasteVision",
    });
    if (!uploads) throw new Error("failed to upload the image");

    // Parse the items JSON string to array
    let itemsArray;
    try {
      itemsArray = JSON.parse(req.body.items);
    } catch (parseError) {
      throw new Error("Invalid items format: " + parseError.message);
    }

    // console.log("Parsed items:", itemsArray); // This should now be an array
    // console.log("Type after parsing:", typeof itemsArray); // This should show "object"

    const saveResult = await UserActivity.create({
      user: req.user.id,
      items: itemsArray, // Use the parsed array here
      image: {
        public_id: uploads.public_id,
        url: uploads.url,
      },
      isSave: true,
    });

    // No need to call save() again after create()
    // await saveResult.save() - Remove this line

    if (!saveResult) throw new Error("failed to save the result");
    fs.unlink(req.file.path, () => {});

    return res.status(201).json({
      success: true,
      record: saveResult,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.fetchRecords = async (req, res) => {
  try {
    console.log(req.user)
    const userId = req.user.id;
    
    const records = await UserActivity.find({ user: userId })
      .sort({ createdAt: -1 }) // Most recent first
      .select("items image createdAt") // Only select needed fields
      .lean(); // Convert to plain JavaScript objects

    // console.log(`Found ${records.length} records for user ${userId}`);

    res.json({
      success: true,
      records: records,
    });
  } catch (error) {
    console.error("Error fetching user records:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user records",
    });
  }
};

exports.fetchRecordById = async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.user.id;

    const record = await UserActivity.findOne({
      _id: recordId,
      user: userId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    res.json({
      success: true,
      record: record,
    });
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch record",
    });
  }
};
