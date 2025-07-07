const mongoose = require("mongoose");
const connectDb = async () => {
  try {
    await mongoose.connect( process.env.MONGO_CONN_STRING);
    console.log("db connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
};

module.exports = connectDb;
