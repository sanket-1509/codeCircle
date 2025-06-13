const express = require("express");
const { auth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { User } = require("../models/user");
const userRouter = express.Router();

userRouter.get("/user/requests/received", auth, async (req, res) => {
  try {
    const user = req.user;
    const requests = await ConnectionRequest.find({
      toUserId: user._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName","photoUrl"]);
    if (requests.length === 0) {
      res.status(200).json({ message: "You dont have any request" });
    } else {
      res
        .status(200)
        .json({ message: "Here is your request list", data: requests });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.get("/user/connections", auth, async (req, res) => {
  try {
    const user = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: user._id,
          status: "accepted",
        },
        {
          toUserId: user._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName","photoUrl"])
      .populate("toUserId", ["firstName", "lastName","photoUrl"]);
    if (connections.length == 0) {
      return res.status(200).json({ message: "Your connection list is empty" });
    }
    const data = connections.map((conn) => {
      if (conn.fromUserId._id.toString() == user._id) {
        return conn.toUserId;
      }
      return conn.fromUserId;
    });
    res.status(200).json({ message: "connectionList", data });
  } catch (error) {
    res.status(400).send(error.message);
  }
});
userRouter.get("/user/feed", auth, async (req, res) => {
  try {
    const user = req.user;
    const page=parseInt(req.query.page)||1
    let limit=parseInt(req.query.limit)||20
    limit=limit>50?50:limit
    const skip=(page-1)*limit

    const hideConnections = await ConnectionRequest.find({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
    })
      .populate("fromUserId", ["firstName", "lastName","photoUrl"])
      .populate("toUserId", ["firstName", "lastName","photoUrl"]);

    const uniqueHideConnection = new Set();
    hideConnections.forEach((conn) => {
      uniqueHideConnection.add(conn.fromUserId);
      uniqueHideConnection.add(conn.toUserId);
    });

    const feed = await User.find({
      $and: [
        { _id: { $nin: Array.from(uniqueHideConnection) } },
        { _id: { $ne: user._id } },
      ],
    }).select("firstName lastName photoUrl").skip(skip).limit(limit);
    res.status(200).json({
      message: "Your feed",
      data: feed,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = userRouter;
