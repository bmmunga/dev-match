const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { validateSignupData } = require("../utils/validations");

const authRouter = express.Router();

authRouter.post("/sign-up", async (req, res) => {
  try {
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json("Invalid signup information");
    }
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(400).send(`User creation failed: ${err.message}`);
  }
});

authRouter.post("/sign-in", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).send("Login successful");
    } else {
      return res.status(401).send("Invalid email or password");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = { authRouter };
