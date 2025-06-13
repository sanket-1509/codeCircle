const express = require("express");
const requestsRouter = express.Router();
const { auth } = require("../middlewares/auth");
const { User } = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

requestsRouter.post(
  "/request/send/:status/:toUserId",
  auth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Request status is invalid");
      }
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        throw new Error("Invalid ToUserId");
      }
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        throw new Error("connection request already exist");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();

      res.status(201).json({
        message: "connection request sent successfull",
        data,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

requestsRouter.post(
  "/request/review/:status/:connectionRequestId",
  auth,
  async (req, res) => {
    try {
      const { status, connectionRequestId } = req.params;
      const loggedInUser = req.user;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status type");
      }
      const connectionRequest = await ConnectionRequest.findOne({
        toUserId: loggedInUser._id,
        _id: connectionRequestId,
        status: "interested",
      });
      if (!connectionRequest) {
        throw new Error("connection request not found");
      }
      connectionRequest.status = status;
      const data = await ConnectionRequest(connectionRequest).save();
      res.status(400).json({ message: "successfully", data });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = requestsRouter;
