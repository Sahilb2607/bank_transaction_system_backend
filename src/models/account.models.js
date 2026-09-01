import mongoose,{Schema} from "mongoose"
import { Ledger } from "./ledger.models.js"
const AccountSchema=new Schema({
  user:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:[true,"Account must be associated with an user"],
    index:true
    // For faster searching
  },
  currency:{
    type:String,
    default:"INR",
    required:[true,"Currency is required for creating an account"]
  },
//   We never store balance in DataBase
  status:{
    type:String,
    enum:["ACTIVE","CLOSED","FROZEN"],
    default:"ACTIVE"
  }


},{ timestamps:true })
AccountSchema.index({user:1,status:1})
// Called as compound index where searching becomes faster if query includes both user and status
AccountSchema.methods.getBalance = async function(){
  const GetBalance = await Ledger.aggregate([
    {
      $match: { account: this._id},
    },
    {
      $group: {
        _id: null,
        TotalCredit: {
          $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] },
        },
        TotalDebit: {
          $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] },
        },
      },
    },
    {
      $project: {
        Balance: {
          $subtract: ["$TotalDebit", "$TotalCredit"],
        },
      },
    },
  ])
  if(GetBalance.length===0){
    return 0
  }
  return GetBalance[0].Balance 
}
export const Account=mongoose.model("Account",AccountSchema)