const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  items: [
    {
      item: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
      },
    },
  ],
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url:{
        type:String,
        required:true
    },
  },
  isSave:{
    type:Boolean,
    default:false
  }
},{timestamps:true});

module.exports = mongoose.model("UserActivity", UserSchema)
