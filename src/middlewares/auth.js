const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }
    const decodedPayload = await jwt.verify(token, "temp");
    const { id } = decodedPayload;
    if (!id) {
      throw new Error("Invalid JWT");
    }
    const user = await User.findById({ _id: id });
    if (!user) {
      throw new Error("No user found in DB");
    }
    req.user=user
    next()
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports={auth}