const express = require("express");
const { User } = require("../models/user");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const validateSignUpData = require("../utils/validateSignUpData");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, email, password } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashPass });
    const savedUser=await user.save();
    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true in production with HTTPS
      maxAge: 1000 * 60 * 60, // 1 hour
    });
    res.json({message:"user added successfully",data:savedUser});
  } catch (error) {
    res.status(400).send("Error while signing up");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isValidPassword = await user.validatePassword(password);
    if (isValidPassword) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        maxAge: 1000 * 60 * 60, // 1 hour
      });
      res.status(200).send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("logout succefully");
});

module.exports = authRouter;
