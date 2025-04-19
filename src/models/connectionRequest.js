const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["interested", "ignore", "accepted", "rejected"],
        message: `{VALUE} is not a valid status`,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.senderId.equals(connectionRequest.receiverId)) {
    const error = new Error("Sender and receiver cannot be the same.");
    error.status = 400;
    return next(error);
  }
  next();
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = { ConnectionRequest };
