const express = require("express");
const app = express();
const connectDb = require("./config/database");
const { User } = require("./models/user");
const cookieParser = require("cookie-parser");
const authRouter = require("./Routes/auth");
const profileRouter = require("./Routes/profile");
const requestsRouter = require("./Routes/requests");
const userRouter = require("./Routes/user");
const cors=require('cors')

const cors = require("cors");

app.use(
  cors({
    origin: "http://13.48.149.20", // deployed frontend IP, as port 80 is def port for http req, so need to append it after ip
    credentials: true              // allow cookies to be sent
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);

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
