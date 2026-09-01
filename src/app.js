import express from "express"
import cookieParser from "cookie-parser"
import router from "./routes/auth.routes.js"
import { Accountrouter } from "./routes/account.routes.js"
import { TransactionRouter } from "./routes/transaction.routes.js"
const app=express()

app.use(express.json({
    limit:`${process.env.limit}`
}))
app.use(express.urlencoded({
    extended:true,
    limit:`${process.env.limit}`
}))
app.use(cookieParser())

app.use("/api/auth",router)
app.use("/api/account",Accountrouter)
app.use("/api/transaction",TransactionRouter)

export {app}