import { ApiError } from "../../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { AsyncHandler } from "../../utils/AsyncHandler.js"
import { Blacklist } from "../models/blacklist.models.js"
import jwt from "jsonwebtoken"

const auth = AsyncHandler(async (req, res, next) => {
  const AccessToken =
    req.cookies?.AccessToken ||
    req.header("Authorization")?.replace("Bearer ", "")
  if (!AccessToken) {
    throw new ApiError(401, "Unauthorized Request")
  }
  const blacklisted = await Blacklist.findOne({ token: AccessToken })
  if (blacklisted) {
    throw new ApiError(401, "Token is blacklisted. Please login again.")
  }
  try {
    const verify = jwt.verify(AccessToken, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(verify.id).select(
      "-password -RefreshToken"
    )
    if (!user) {
      throw new ApiError(401, "Invalid Access Token")
    }
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, `JWT verification failed: ${error.message}`)
  }
})

const Systemauth = AsyncHandler(async (req, res, next) => {
  const AccessToken =
    req.cookies?.AccessToken ||
    req.header("Authorization")?.replace("Bearer ", "")
  if (!AccessToken) {
    throw new ApiError(401, "Unauthorized Request")
  }
  const blacklisted = await Blacklist.findOne({ token: AccessToken })
  if (blacklisted) {
    throw new ApiError(401, "Token is blacklisted. Please login again.")
  }
  try {
    const verify = jwt.verify(AccessToken, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(verify.id).select(
      "-password -RefreshToken +IsSystemUser"
    )
    if (!user) {
      throw new ApiError(401, "Invalid Access Token")
    }
    if (!user.IsSystemUser) {
      throw new ApiError(403, "Not a System user")
    }
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, `JWT verification failed: ${error.message}`)
  }
})

export { auth, Systemauth }
