import dotenv from "dotenv"
import { app } from "./src/app.js";
import { ConnectToDataBase } from "./src/db/index.js";
dotenv.config()
ConnectToDataBase().then(()=>{
    app.on("error",(error)=>{
        console.log(error)
        app.exit(1)
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server Listening at PORT ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("Error in MONGODB CONNECTION!!!! ",error)
})