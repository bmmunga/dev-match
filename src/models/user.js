const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new Schema({
  firstName: { type: String, required: true, minLength: 3, maxLength: 20 },
  lastName: { type: String },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, minLength: 8, required: true },
  age: { type: Number, min: 18 },
  gender: {
    type: String,
    validator(value) {
      if (!["male", "female", "other"].includes(value)) {
        throw new Error("The gender type is invalid");
      }
    },
  },
  imageUrl: {
    type: String,
    default:
      "https://static-00.iconduck.com/assets.00/profile-circle-icon-256x256-ewso45t8.png",
  },
  about: { type: String, default: "Hey there! I am using Dev-Match." },
  skills: { type: [String] },
});

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(password, passwordHash);
  return isPasswordValid;
};
const User = mongoose.model("User", userSchema);

module.exports = { User };
