import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  conversation_name: {
    type: String,
    required: true
  }
});

export const Conversation = mongoose.model("Conversation", ConversationSchema);
