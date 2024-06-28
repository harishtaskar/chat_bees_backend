import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  from_user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "gif", "image"],
    default: "text",
    required: true,
  },
  sendAt: { type: Date, default: Date.now },
  conversation_id: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  status: { type: Number, required: true, default: 1 },
});

export const Message = mongoose.model("Message", messageSchema);
