// See whenever there is a scenario where an amount has to be sent from one account to another then transaction
// is created with status pending.In one transaction there are two ledger entries.Ledger are history or Record when the amount
// is credited or debited and how much for each accont ledger is created.So the balance is calculated through ledger means adding all
// Debited one and subtarcting from credited ones.When both entries are done then update the transactio status from pending to Completed
import mongoose, { Schema } from "mongoose"

const TransactionSchema = new Schema(
  {
    fromAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    ToAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be Negative"],
    },
    idempotencykey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // It prevents from double payment of same transaction in case of netwrok issue while sending money
      // It is genereted in client side not in backend
    },
  },
  { timestamps: true }
)

export const Transaction = mongoose.model("Transaction", TransactionSchema)
