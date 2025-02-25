import { GroupMember } from "../models/group_member_modal";
import { Message } from "../models/message_modal";
import connectDB from "../utils/database";
import { ConversationMSGCount } from "../models/conversation_msg_count";

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

export const getGroupMembers = async (conversation: string) => {
  try {
    await connectDB();
    const group_members = await GroupMember.find({
      conversation,
    });
    if (group_members?.length) {
      return group_members;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const increaseUnreadMSGCount = async (
  conversation_id: string,
  user_id: string
) => {
  try {
    await connectDB();
    await ConversationMSGCount.updateOne(
      { conversation_id, user_id },
      { $inc: { unread_msg: 1 } }
    );
    const conversation_msg_count = await ConversationMSGCount.findOne({
      user_id,
      conversation_id,
    });
    if (conversation_msg_count) {
      return conversation_msg_count;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};
