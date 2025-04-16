const express = require("express");
const { authenticate } = require("../middlewares/authenticate");
const { validateProfileEditData } = require("../utils/validations");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/me", authenticate, (req, res) => {
  try {
    const user = req.user;
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send("An error occured while fetching user data.");
  }
});

profileRouter.patch("/edit", authenticate, async (req, res) => {
  try {
    const isValid = validateProfileEditData(req);
    if (!isValid) {
      return res.status(400).send("Invalid profile data provided.");
    }
    currentUser = req.user;
    Object.keys(req.body).forEach((key) => (currentUser[key] = req.body[key]));
    await currentUser.save();
    res
      .status(200)
      .json({ message: "Profile updated successfully", data: currentUser });
  } catch (err) {
    return res
      .status(500)
      .send("An error occurred while retrieving the profile.");
  }
});

profileRouter.patch("/password/reset", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).send("Both current and new password are required.");
  }
  const isPasswordValid = await req.user.validatePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(401).send("Invalid password.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  req.user.password = hashedPassword;
  await req.user.save();
  res.status(200).send("Password updated successfully.");
});

module.exports = { profileRouter };
