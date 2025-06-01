const express = require("express");
const app = express();
const connectDb = require("./config/database");
const { User } = require("./models/user");
const bcrypt = require("bcrypt");
const validateSignUpData = require("./utils/validateSignUpData");
const { verify, sign } = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { auth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, email, password } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashPass });
    await user.save();
    res.send("user added successfully");
  } catch (error) {
    res.status(400).send("Error while signing up");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isValidPassword = await user.validatePassword(password);
    if (isValidPassword) {
      const token = await user.getJWT()
      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // true in production with HTTPS
        maxAge: 1000 * 60 * 60, // 1 hour
      });
      res.status(200).send("login successfull");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get("/profile", auth, async (req, res) => {
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

//find user by email
app.get("/user", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.find({ email });
    if (user.length === 0) {
      res.status(404).send("user not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("something went wrong");
  }
});

//find all user
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      res.status(404).send("there are no users");
    } else {
      res.send(users);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("something went wrong");
  }
});

app.delete("/user", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.body.userId);
    res.send("user is deleted");
  } catch (error) {
    res.status(400).send("something went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const allowedUpdate = ["photoUrl", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(req.body).every((k) =>
      allowedUpdate.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("update not allowed");
    }
    if (req.body?.skills.length > 10) {
      throw new Error("Too many Skills");
    }

    const user = await User.findByIdAndUpdate(userId, req.body, {
      runValidators: true,
    });
    res.send("user updated succesfully");
  } catch (error) {
    res.status(400).send("something went wrong " + error);
  }
});

connectDb()
  .then(() => {
    app.listen(3000, () => {
      console.log("server listening to port 3000");
    });
  })
  .catch((err) => {
    console.log("db can not be connected");
  });
