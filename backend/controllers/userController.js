const UserActivity = require("../models/userActivity");
const User = require("../models/user");
const cloudinary = require("../configs/cloudinary");
const fs = require("fs");
const { uploadToCloudinary } = require("../configs/cloudinary"); // Import the helper

// exports.saveRecord = async (req, res) => {
//   try {
//     if (!req.body) throw new Error("undefined body");
//     if (!req.file) throw new Error("File is undefined");

//     // Upload using the standardized helper function
//     const result = await uploadToCloudinary(req.file.buffer, "wasteVision");
//     if (!result) throw new Error("failed to upload the image");

//     // Parse the items JSON string to array
//     let itemsArray;
//     try {
//       itemsArray = JSON.parse(req.body.items);
//     } catch (parseError) {
//       throw new Error("Invalid items format: " + parseError.message);
//     }

//     const saveResult = await UserActivity.create({
//       user: req.user.id,
//       items: itemsArray, // Use the parsed array here
//       image: {
//         public_id: result.public_id,
//         url: result.secure_url, // Use secure_url from the result
//       },
//       isSave: true,
//     });

//     if (!saveResult) throw new Error("failed to save the result");

//     return res.status(201).json({
//       success: true,
//       record: saveResult,
//     });
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).json({ error: error.message });
//   }
// };





//hardcode
// exports.saveRecord = async (req, res) => {
//   try {
//     if (!req.body) throw new Error("undefined body");
//     if (!req.file) throw new Error("File is undefined");

//     // Upload using the standardized helper function
//     const uploads = await uploadToCloudinary(req.file.buffer, "wasteVision");
//     if (!uploads) throw new Error("failed to upload the image");

//     // Hardcoded items for testing purposes
//     const itemsArray = [
//       { item: "Test Item 1", type: "Recyclable", confidence: 0.99 },
//       { item: "Test Item 2", type: "Organic", confidence: 0.98 }
//     ];

//     const saveResult = await UserActivity.create({
//       user: req.user.id,
//       items: itemsArray, // Use the hardcoded array here
//       image: {
//         public_id: uploads.public_id,
//         url: uploads.secure_url, // Use secure_url from the result
//       },
//       isSave: true,
//     });

//     if (!saveResult) throw new Error("failed to save the result");

//     return res.status(201).json({
//       success: true,
//       record: saveResult,
//     });
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).json({ error: error.message });
//   }
// };




//test
exports.saveRecord = async (req, res) => {
  try {
    if (!req.body) throw new Error("undefined body");
    if (!req.file) throw new Error("File is undefined");

    // Upload using the standardized helper function
    const uploads = await uploadToCloudinary(req.file.buffer, "wasteVision");
    if (!uploads) throw new Error("failed to upload the image");

    // Extract classification data from request body
    const { wasteType, category, confidence, recyclable, disposalMethod, description } = req.body;

    // Create items array from the classification data
    const itemsArray = [{
      item: wasteType || "Unknown",
      type: category || "Unknown",
      confidence: confidence || 0,
      recyclable: recyclable === 'true' || recyclable === true,
      disposalMethod: disposalMethod || "",
      description: description || ""
    }];

    const saveResult = await UserActivity.create({
      user: req.user.id,
      items: itemsArray,
      image: {
        public_id: uploads.public_id,
        url: uploads.secure_url,
      },
      isSave: true,
    });

    if (!saveResult) throw new Error("failed to save the result");

    return res.status(201).json({
      success: true,
      record: saveResult,
      category: category,
      confidence: confidence,
      recyclable: recyclable === 'true' || recyclable === true,
      disposal_instructions: disposalMethod
    });
  } catch (error) {
    console.log("Error in saveRecord:", error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
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
