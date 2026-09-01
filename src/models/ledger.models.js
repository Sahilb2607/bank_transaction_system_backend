import mongoose, { Schema } from "mongoose"
import { ApiError } from "../../utils/ApiError.js"

const ledgerSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    index: true,
    immutable: true,
  },
  amount: {
    type: Number,
    required: true,
    immutable: true,
  },
  type: {
    type: String,
    enum: ["DEBIT", "CREDIT"],
  },
  transaction: {
    type: Schema.Types.ObjectId,
    ref: "Transaction",
    required: true,
    immutable: true,
    index: true,
  },
  // Kis transaction ka ledger hain ye
})
const preventLedgerModification = () => {
  throw new ApiError(403, "Modifications cannot be done as it is immutable")
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification)
ledgerSchema.pre("updateOne", preventLedgerModification)
ledgerSchema.pre("deleteOne", preventLedgerModification)
ledgerSchema.pre("remove", preventLedgerModification)
ledgerSchema.pre("deleteMany", preventLedgerModification)
ledgerSchema.pre("updateMany", preventLedgerModification)
ledgerSchema.pre("findOneAndDelete", preventLedgerModification)
ledgerSchema.pre("findOneAndReplace", preventLedgerModification)
export const Ledger = mongoose.model("Ledger", ledgerSchema)
