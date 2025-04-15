const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/user");
const { redisClient } = require("../config/tokenStore");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).send("Authentication failed");
    }

    if (!redisClient.isReady) {
      console.error(
        "Redis client is not connected. Cannot perform blacklist check"
      );
      return res.status(503).send("Auth service temporarily unavailable");
    }

    try {
      const redisValue = await redisClient.get(token);

      if (redisValue === "blacklisted") {
        return res.status(401).send("Access denied: Invalid token.");
      } else if (redisValue) {
        return res.status(401).send("Access denied: Token status uncertain.");
      } else {
        console.log("Token not blacklisted. Proceeding with verification.");
      }
    } catch (err) {
      return res.status(500).send("Internal server error during auth.");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send("Authentication failed: Invalid token.");
    }

    const { _id } = decodedToken;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).send("Authentication failed: Invalid token.");
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).send("Internal server error during auth.");
  }
};

module.exports = { authenticate };
