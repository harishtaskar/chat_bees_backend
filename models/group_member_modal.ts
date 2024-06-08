import mongoose, { Schema } from "mongoose";

const groupMemberSchema = new mongoose.Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  conversation_id: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  dob: { type: Date },
  joinedAt: { type: Date },
  leftAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const GroupMember = mongoose.model("Group_Member", groupMemberSchema);
