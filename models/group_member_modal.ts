import mongoose, { Schema } from "mongoose";

const groupMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  joinedAt: { type: Date },
  leftAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const GroupMember = mongoose.model("Group_Member", groupMemberSchema);
