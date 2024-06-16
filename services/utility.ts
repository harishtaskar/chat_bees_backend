import { Message } from "../models/message_modal";
import { IMessage } from "../types";
import connectDB from "../utils/database";

export const saveMessage = async (message: IMessage) => {
  try {
    if (message) {
      await connectDB();
      const newMessage = await Message.create(message);
      if (newMessage) {
        console.log("new message is stored to messages...", newMessage);
      } else {
        console.log("Something went wrong storing message to database***");
      }
    }
  } catch (error) {
    console.log(error);
  }
};
