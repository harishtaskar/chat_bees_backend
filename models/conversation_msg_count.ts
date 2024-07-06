import mongoose from "mongoose";
import { Schema } from "mongoose";

const ConversationMsgCountSchema = new mongoose.Schema({
  conversation_id: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  msg_count: {
    type: Number,
    required: true,
    default: 0,
  },
  unread_msg_count: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const ConversationMSGCount = mongoose.model(
  "Conversation_msg_count",
  ConversationMsgCountSchema
);
