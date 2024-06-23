import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uniqueStr: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["individual", "group"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  status: {
    type: Number,
    required: true,
    default: 1,
  },
});

export const Conversation = mongoose.model("Conversation", ConversationSchema);
