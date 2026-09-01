import { Transaction } from "../models/transaction.models.js"
import { Ledger } from "../models/ledger.models.js"
import { AsyncHandler } from "../../utils/AsyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { Account } from "../models/account.models.js"
import {
  sendSenderTransactionEmail,
  sendReceiverTransactionEmail,
} from "../service/email.service.js"
import mongoose from "mongoose"
const Transactionmethod = AsyncHandler(async (req, res) => {
  const { fromAccount, ToAccount, amount, idempotencykey } = req.body
  if (!fromAccount || !ToAccount || !amount || !idempotencykey) {
    throw new ApiError(
      400,
      "fromAccount,ToAccount,Amount and Idempotencykey are required"
    )
  }
  const validFromAccount = await Account.findById(fromAccount)
  if (!validFromAccount) {
    throw new ApiError(404, "Sender Account is invalid")
  }
  const validToAccount = await Account.findById(ToAccount)
  if (!validToAccount) {
    throw new ApiError(404, "Receiver Account is invalid")
  }
  if (validFromAccount.status !== "ACTIVE") {
    throw new ApiError(400, "Sender Account is not active")
  }
  if (validToAccount.status !== "ACTIVE") {
    throw new ApiError(400, "Receiver Account is not active")
  }
  if (validFromAccount.user.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Sender Account does not belong to the authenticated user"
    )
  }
  const verify = await Transaction.findOne({ idempotencykey })
  if (verify) {
    if (verify.status == "COMPLETED") {
      throw new ApiError(
        500,
        "Transaction with this idempotency key is completed"
      )
    }
    if (verify.status == "PENDING") {
      throw new ApiError(
        500,
        "Transaction with this idempotency key is pending"
      )
    }
    if (verify.status == "FAILED") {
      throw new ApiError(
        500,
        "Transaction with this idempotency key has failed"
      )
    }
    if (verify.status == "REVERSED") {
      throw new ApiError(
        500,
        "Transaction with this idempotency key is reversed"
      )
    }
  }
  const SenderBalance = await validFromAccount.getBalance()
  if (SenderBalance < amount) {
    throw new ApiError(400, "Insufficient Balance in sender account")
  }
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const transaction = new Transaction({
      fromAccount,
      ToAccount,
      amount,
      idempotencykey,
    })
    const DebitEntry = await Ledger.create(
      [
        {
          account: ToAccount,
          amount,
          type: "DEBIT",
          transaction: transaction._id,
        },
      ],
      { session }
    )
    const CreditEntry = await Ledger.create(
      [
        {
          account: fromAccount,
          amount,
          type: "CREDIT",
          transaction: transaction._id,
        },
      ],
      { session }
    )
    const CompletedTransaction = await Transaction.findByIdAndUpdate(
      transaction._id,
      { status: "COMPLETED" },
      { new: true, session }
    )
    await session.commitTransaction()
    session.endSession()
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          CompletedTransaction,
          "Transaction Completed Sucessfully"
        )
      )
    await sendSenderTransactionEmail(
      req.user.email,
      req.user.fullName,
      amount,
      fromAccount._id,
      ToAccount
    )
    await sendReceiverTransactionEmail(
      validToAccount.user.email,
      validToAccount.user.fullName,
      amount,
      fromAccount._id,
      ToAccount
    )
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json(new ApiError(500, "Internal Server Error"))
  }
})
const ProvideFund = AsyncHandler(async (req, res) => {
  const { ToAccount, amount, idempotencykey } = req.body
  if (!ToAccount || !amount || !idempotencykey) {
    throw new ApiError(400, "ToAccount,Amount and Idempotencykey are required")
  }
  const verify = await Transaction.findOne({ idempotencykey })
  if (verify) {
    throw new ApiError(
      409,
      "Transaction with this idempotency key already exists"
    )
  }
  if (amount <= 0) {
    throw new ApiError(400, "Amount should be greater than zero")
  }
  const validToAccount = await Account.findById(ToAccount)
  if (!validToAccount) {
    throw new ApiError(404, "Receiver Account is invalid")
  }
  if (!validToAccount.status == "ACTIVE") {
    throw new ApiError(400, "Receiver Account is not active")
  }
  const fromAccount = await Account.findOne({
    user: req.user._id,
  })
  if (!fromAccount) {
    throw new ApiError(400, "User Account not found")
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const transaction = new Transaction({
      fromAccount: fromAccount._id,
      ToAccount,
      amount,
      idempotencykey,
    })

    await Ledger.create(
      [
        {
          account: ToAccount,
          amount,
          type: "DEBIT",
          transaction: transaction._id,
        },
      ],
      { session }
    )

    await Ledger.create(
      [
        {
          account: fromAccount._id,
          amount,
          type: "CREDIT",
          transaction: transaction._id,
        },
      ],
      { session }
    )

    const CompletedTransaction = await Transaction.findByIdAndUpdate(
      transaction._id,
      { status: "COMPLETED" },
      { new: true, session }
    )

    await session.commitTransaction()
    session.endSession()

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          CompletedTransaction,
          "Funds Provided Successfully"
        )
      )
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json(new ApiError(500, "Internal Server Error"))
  }
})
const getBalance = AsyncHandler(async (req, res) => {
  const accountId = req.params.accountId
  const account = await Account.findOne({
    _id: accountId,
    user: req.user._id,
  })
  if (!account) {
    throw new ApiError(404, "Account not found for the authenticated user")
  }
  const balance = await account.getBalance()
  return res
    .status(200)
    .json(new ApiResponse(200, { balance }, "Balance retrieved successfully"))
})
export { Transactionmethod, ProvideFund, getBalance }
