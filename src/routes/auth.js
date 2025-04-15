const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { validateSignupData } = require("../utils/validations");
const { redisClient } = require("../config/tokenStore");

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
    console.error(err);
    res.status(400).send("Error during sign up.");
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
        path: "/",
      });
      return res.status(200).send("Login successful");
    } else {
      return res.status(401).send("Invalid email or password");
    }
  } catch (err) {
    res.status(500).send("Error during sign in.");
  }
});

authRouter.post("/sign-out", async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).send("No token provided");
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.exp) {
      return res.status(401).send("Invalid token");
    }

    const expirationTime = decodedToken.exp - Math.floor(Date.now() / 1000);
    await redisClient.setEx(token, expirationTime, "blacklisted");

    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    res.status(200).send("Logout successful");
  } catch (err) {
    res.status(500).send("Error during sign out.");
  }
});

module.exports = { authRouter };
