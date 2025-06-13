const express = require("express");
const profileRouter = express.Router();
const { auth } = require("../middlewares/auth");
const validateProfileEditData = require("../utils/validateProfileEditData");
const { compare, hash } = require("bcrypt");

profileRouter.get("/profile/view", auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("No user found in DB");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
profileRouter.patch("/profile/edit", auth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Edit is not allowed for one more field in Request body");
    }
    const user = req.user;
    console.log(user);
    Object.keys(req.body).forEach((f) => (user[f] = req.body[f]));
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.patch("/profile/changePassword", auth, async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
    if (!oldPassword || !password) {
      throw new Error("Changing password not allowed due to missing fields");
    }
    const user = req.user;
    const isOldPasswordValid = await compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error(
        "Changing password not allowed due to incorrect old password"
      );
    }
    console.log(user.password, "old");
    user.password = await hash(password, 10);
    await user.save();
    console.log(user.password, "new");
    res.send("password change successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = profileRouter;
