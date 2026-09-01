import { AsyncHandler } from "../../utils/AsyncHandler.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { Blacklist } from "../models/blacklist.models.js"
import {sendRegisterEmail} from "../service/email.service.js"
const GenerateAccessandRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid)
    const AccessToken = await user.GenerateAccessToken()
    const RefreshToken = await user.GenerateRefreshToken()
    user.RefreshToken = RefreshToken
    await user.save({ validateBeforeSave: false })
    return { AccessToken, RefreshToken }
  } catch (error) {
    throw new ApiError(500, "Error while Generating Access and Refresh Token")
  }
}
const Register = AsyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body
  if (!email || !fullName || !password) {
    throw new ApiError(400, "All fields are required")
  }

  const check = await User.findOne({ email })
  if (check) {
    throw new ApiError(409, "User Already exist")
  }
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
  })
  res
    .status(200)
    .json(new ApiResponse(200, user, "User Sucessfully Registered"))
    await sendRegisterEmail(user.email, user.fullName)
})
const Login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required")
  }
  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    throw new ApiError(404, "User does not exist")
  }
  const VerifyPass = await user.VerifyPassword(password)
  if (!VerifyPass) {
    throw new ApiError(401, "Invalid User Credentials")
  }
  const { AccessToken, RefreshToken } = await GenerateAccessandRefreshToken(
    user._id
  )
  const registered = await User.findById(user._id).select(
    "-password -RefreshToken"
  )
  const options = {
    httpOnly: true,
    secure: true,
  }
  res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefreshToken", RefreshToken, options)
    .json(new ApiResponse(200, registered, "User Sucessfully Logged In"))
})

const Logout = AsyncHandler(async (req, res) => {
  const AccessToken =
    req.cookies?.AccessToken ||
    req.header("Authorization")?.replace("Bearer ", "")
  if (!AccessToken) {
    throw new ApiError(401, "Access Token is required for logout")
  }
  const BlacklistToken = await Blacklist.create({ token: AccessToken })
  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "User Sucessfully Logged Out"))
})
const RefreshAccessToken = AsyncHandler(async (req, res) => {
  const RefreshToken = req.cookies?.RefreshToken || req.body?.RefreshToken
  if (!RefreshToken) {
    throw new ApiError(401, "Unauthorized Access, Refresh Token is required")
  }
  const verify = jwt.verify(RefreshToken, process.env.REFRESH_TOKEN_SECRET)
  const user = await User.findById(verify.id)
  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token")
  }
  if (user.RefreshToken !== RefreshToken) {
    throw new ApiError(401, "Invalid Refresh Token")
  }
  const { AccessToken, RefreshToken: newRefreshToken } =
    await GenerateAccessandRefreshToken(user._id)
  const options = {
    httpOnly: true,
    secure: true,
  }
  res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          AccessToken,
          RefreshToken: newRefreshToken,
        },
        "Access Token Sucessfully Refreshed"
      )
    )
})
const ChangePassword = AsyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required")
  }
  const user = await User.findById(req.user._id).select("+password")
  const VerifyPass = await user.VerifyPassword(oldPassword)
  if (!VerifyPass) {
    throw new ApiError(401, "Invalid Old Password")
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match")
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})
const ChangeData = AsyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required")
  }
  const user = await User.findById(req.user._id)
  user.fullName = fullName
  user.email = email
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User data changed successfully"))
})
export {
  Register,
  Login,
  Logout,
  RefreshAccessToken,
  ChangePassword,
  ChangeData,
}
