const User = require("../models/user");
const UserActivity = require("../models/userActivity");
const { uploadToCloudinary } = require("../configs/cloudinary");

// Save waste classification record
exports.saveRecord = async (req, res) => {
  try {
    if (!req.body) throw new Error("undefined body");
    if (!req.file) throw new Error("File is undefined");

    // Extract classification data from request body
    const { wasteType, category, confidence, recyclable, disposalMethod, description, detectedImageBase64 } = req.body;

    // Upload original image
    const originalImage = await uploadToCloudinary(req.file.buffer, "wasteVision/originals");
    if (!originalImage) throw new Error("Failed to upload original image");

    // Upload detected image with bounding boxes if provided
    let detectedImage = null;
    if (detectedImageBase64) {
      // Remove the data:image/png;base64, prefix if present
      const base64Data = detectedImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      detectedImage = await uploadToCloudinary(buffer, "wasteVision/detected");
      if (!detectedImage) {
        console.warn("Failed to upload detected image, continuing without it");
      }
    }

    // Parse confidence - should be stored as decimal (0-1) not percentage
    const confidenceValue = parseFloat(confidence) || 0;
    const normalizedConfidence = confidenceValue > 1 ? confidenceValue / 100 : confidenceValue;

    // Parse recyclable - handle both string and boolean
    const isRecyclable = recyclable === true || recyclable === 'true';

    // Create the record
    const saveResult = await UserActivity.create({
      user: req.user.id,
      items: [{
        item: wasteType || 'Unknown',
        type: category || 'Unknown',
        confidence: normalizedConfidence, // Store as decimal (0-1)
        recyclable: isRecyclable,
        disposalMethod: disposalMethod || '',
        description: description || ''
      }],
      image: {
        public_id: originalImage.public_id,
        url: originalImage.secure_url,
      },
      detectedImage: detectedImage ? {
        public_id: detectedImage.public_id,
        url: detectedImage.secure_url,
      } : null,
      isSave: true,
    });

    if (!saveResult) throw new Error("Failed to save the result");

    return res.status(201).json({
      success: true,
      record: saveResult,
      category: category,
      confidence: normalizedConfidence,
      recyclable: isRecyclable,
      disposal_instructions: disposalMethod || '',
    });
  } catch (error) {
    console.log("Error in saveRecord:", error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Fetch all user records
exports.fetchRecords = async (req, res) => {
  try {
    const records = await UserActivity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      records: records,
    });
  } catch (error) {
    console.log("Error in fetchRecords:", error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Fetch a single record by ID
exports.fetchRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await UserActivity.findOne({ 
      _id: id, 
      user: req.user.id 
    }).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    return res.status(200).json({
      success: true,
      record: record,
    });
  } catch (error) {
    console.log("Error in fetchRecordById:", error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
