const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://sanket:Amptnqsyz%40321@cluster-sanket.ldqlp.mongodb.net/codeCircle?retryWrites=true&w=majority"
    );
    console.log("db connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
};

module.exports = connectDb;
