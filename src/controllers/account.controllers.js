import { Account } from "../models/account.models.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { AsyncHandler } from "../../utils/AsyncHandler.js"
import { User } from "../models/user.models.js"

const CreateAccount=AsyncHandler(async (req,res)=>{
    const user=req.user
    const userid=await User.findById(user._id).select("-password -RefreshToken +IsSystemUser")
    const Create=await Account.create({
        user:userid
    })
    return res
    .status(200)
    .json(
        new ApiResponse(200,Create,"Account Created Sucessfully")
    )

})


export {
    CreateAccount
}