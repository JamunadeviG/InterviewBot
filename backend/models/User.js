const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ["Software Engineer", "Data Analyst", "ML Engineer"]
  }
}, {
  timestamps: true
});

// No need for explicit email index since unique: true creates it automatically

module.exports = mongoose.model("User", userSchema);
