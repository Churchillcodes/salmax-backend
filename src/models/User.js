const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },

  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Manager: Number,
    Admin: Number,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
