const express = require("express");
const { authenticate } = require("../middlewares/authenticate");
const { validateProfileEditData } = require("../utils/validations");

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

module.exports = { profileRouter };
