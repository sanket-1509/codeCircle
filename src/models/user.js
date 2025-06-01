const { compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    age: {
      type: Number,
    //   required: true,
      min: 18,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error("Weak Password")
        }
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Enter Valid Email")
        }
      }
    },
    gender: {
      type: String,
    //   required: true,
      validate(value) {
        if (!["male", "female"].includes(value)) {
          throw new Error("Invalid Gender");
        }
      },
    },
    photoUrl: {
      type: String,
      validate(value){
        if(!validator.isURL(value)){
            throw new Error("ENter valid URL")
        }
      },
      default:
        "https://cdn.vectorstock.com/i/1000v/30/21/human-blank-face-with-eps10-vector-25623021.jpg",
    },
    skills:{
        type:[String],
        // require:true
    }
  },
  { timestamps: true }
);

userSchema.methods.getJWT=async function() {
  const user=this
  const token=await sign({ id: user._id }, "temp", { expiresIn: "1d" });
  console.log(token,"token")
  return token
}

userSchema.methods.validatePassword=async function (passInputByUser){
const user=this
const isPassValid=await compare(passInputByUser,user.password)
return isPassValid
}


const User = mongoose.model("User", userSchema);
module.exports = { User };
