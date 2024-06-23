import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  profileIcon: { type: String, default: "icon1" },
  occupation: { type: String, required: true },
  dob: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  status: { type: Number, required: true, default: 1 },
  theme: {
    type: String,
    enum: ["dark", "light"],
    default: "light",
  },
});

export const User = mongoose.model("User", userSchema);
