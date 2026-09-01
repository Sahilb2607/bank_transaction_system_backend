import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email address"],
      unique: [true, "Email Already Exist"],
    },
    fullName: {
      type: String,
      required: [true, "FullName is required"],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required for creating an account"],
    },
    RefreshToken: {
      type: String,
    },
    IsSystemUser:{
    type:Boolean,
    default:false,
    immutable:false,
    select:false
    // It means now you cannot change the value programatically,you must have access to database for it
  }
  },
  { timestamps: true }
)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})
UserSchema.methods.VerifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}
UserSchema.methods.GenerateAccessToken = async function () {
  return jwt.sign(
    {
      id: this._id,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}
UserSchema.methods.GenerateRefreshToken = async function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}
export const User = mongoose.model("User", UserSchema)
