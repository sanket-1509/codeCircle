const mongoose = require("mongoose");
const { User } = require("./user");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:User
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:User
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: `{VALUE} is of incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({fromUserId:1,toUserId:1})

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("you cant send request to yourself");
  }
  next();
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
