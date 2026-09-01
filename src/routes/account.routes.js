import { Router } from "express"
import { CreateAccount } from "../controllers/account.controllers.js"
import { auth } from "../middleware/auth.middleware.js"
import { Ledger } from "../models/ledger.models.js"
const Accountrouter=Router()

Accountrouter.route("/create").get(auth,CreateAccount)

export {Accountrouter}