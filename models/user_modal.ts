import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  profileicon: { type: String, required: true },
  dob: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  password: {type: String, required: true},
  salt: {type: String, required: true},
});

export const User = mongoose.model("User", userSchema);
