const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).send("Authentication failed");
    }

    const decodedToken = jwt.verify(token, "secretkey");
    if (!decodedToken) {
      return res.status(401).send("Authentication failed");
    }

    const { _id } = decodedToken;
    const user = await User.findById(_id);
    if (!user) {
      res.status(401).send("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send("ERROR: " + err.message);
  }
};

module.exports = { authenticate };
