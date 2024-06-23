import { Message } from "../models/message_modal";
import { IMessage } from "../types";
import connectDB from "../utils/database";

export const saveMessage = async (message: IMessage) => {
  try {
    if (message) {
      await connectDB();
      await Message.create({
        conversation_id: message?.conversation_id,
        from_user: message?.from_user,
        sendAt: message?.sendAt || Date.now(),
        status: message?.status,
        content: message?.content,
        type: message?.type,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
