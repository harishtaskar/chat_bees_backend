import mongoose from "mongoose";

export interface IUser {
  username: string;
  profileicon?: string; // Optional, because it has a default value
  occupation: string;
  dob?: Date; // Optional, because it is not required
  createdAt?: Date; // Optional, will be set by Mongoose
  updatedAt?: Date; // Optional, can be set by Mongoose
  gender: "male" | "female";
  password: string;
  salt: string;
  status?: number; // Optional, because it has a default value
}

export interface IConversation {
  name: string;
  type: "individual" | "group";
  createdAt?: Date; // Optional, will be set by Mongoose
  updatedAt?: Date; // Optional, can be set by Mongoose
  status?: number; // Optional, because it has a default value
}

export interface IMessage {
  from_user: string;
  text: string;
  sendAt?: Date; // Optional, because it has a default value
  conversation_id: mongoose.Types.ObjectId;
}
