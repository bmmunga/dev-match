const express = require("express");
const { authenticate } = require("../middlewares/authenticate");

const profileRouter = express.Router();

profileRouter.get("/me", authenticate, (req, res) => {
  try {
    const user = req.user;
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = { profileRouter };
