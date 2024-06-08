import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  from_user: { type: String, required: true },
  text: { type: String, required: true },
  sendAt: { type: Date, default: Date.now },
  conversation_id: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
});

export const Message = mongoose.model("Message", messageSchema);
