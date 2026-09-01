import mongoose from "mongoose"


const ConnectToDataBase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Database connected Successfully")
  } catch (error) {
    console.error("MONGODB CONNECTION FAILED ", error)
    process.exit(1)
  }
}
export {ConnectToDataBase}