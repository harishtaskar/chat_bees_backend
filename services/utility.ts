import { Message } from "../models/message_modal";
import connectDB from "../utils/database";

export const saveMessage = async (message: any) => {
  try {
    const messageObj = JSON.parse(message);
    if (Object.keys(messageObj).length !== 0) {
      await connectDB();
      await Message.create({
        conversation_id: messageObj?.conversation_id,
        from_user: messageObj?.from_user,
        sendAt: messageObj?.sendAt || Date.now(),
        status: messageObj?.status,
        content: messageObj?.content,
        type: messageObj?.type,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
