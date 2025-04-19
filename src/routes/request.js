const express = require("express");
const { authenticate } = require("../middlewares/authenticate");
const { ConnectionRequest } = require("../models/connectionRequest");
const { User } = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/send/:status/:receiverId",
  authenticate,
  async (req, res) => {
    try {
      const { status, receiverId } = req.params;
      const senderId = req.user._id;

      if (!["interested", "ignore"].includes(status)) {
        return res.status(400).send("Invalid status provided.");
      }
      if (!receiverId) {
        return res.status(400).send("Receiver ID is required.");
      }
      const isReceiverIdValid = await User.findById(receiverId);
      if (!isReceiverIdValid) {
        return res.status(404).send("Not a valid user.");
      }

      const isAlreadyConnected = await ConnectionRequest.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });
      if (isAlreadyConnected) {
        return res.status(400).send("Connection request already exists.");
      }

      const connectionRequest = new ConnectionRequest({
        senderId,
        receiverId,
        status,
      });
      await connectionRequest.save();

      res.status(201).json({
        message: "Connection request sent successfully.",
        connectionRequest,
      });
    } catch (err) {
      if (err.message === "Sender and receiver cannot be the same.") {
        return res.status(400).send(err.message);
      }
      return res
        .status(500)
        .send("An error occured while sending the request.");
    }
  }
);

module.exports = { requestRouter };
