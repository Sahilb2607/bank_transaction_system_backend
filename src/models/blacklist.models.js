import mongoose,{Schema} from "mongoose"

const blacklistSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
}},{ timestamps: true })
blacklistSchema.index({ createdAt:1},{expireAfterSeconds: 60*60*24*3})
export const Blacklist = mongoose.model("Blacklist", blacklistSchema)