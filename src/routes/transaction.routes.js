import { Router } from "express"
import {
  Transactionmethod,
  ProvideFund,
  getBalance

} from "../controllers/transaction.controllers.js"
import { auth, Systemauth } from "../middleware/auth.middleware.js"
const TransactionRouter = Router()

TransactionRouter.route("/Transaction").post(auth, Transactionmethod)
TransactionRouter.route("/ProvideFund").post(Systemauth, ProvideFund)
TransactionRouter.route("/getbalance/:accountId").get(auth, getBalance)
export { TransactionRouter }
