const User =require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { uploadToCloudinary } = require('../configs/cloudinary'); // Import the new helper


//Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, 
      { expiresIn: "3h" } 
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


//Register Controller
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const userData = { name, email, password };

        // If a file is uploaded, handle it
        if (req.file) {
            // Upload the file buffer to Cloudinary
            const result = await uploadToCloudinary(req.file.buffer);
            userData.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const newUser = await User.create(userData);

        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            role: newUser.role
        };

        return res.status(201).json({ message: "User registered successfully", user: userResponse });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};