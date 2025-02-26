import { Request, Response } from "express";
import connectDB from "../utils/database";
import { Conversation } from "../models/conversation_modal";
import { GroupMember } from "../models/group_member_modal";
import { User } from "../models/user_modal";
import mongoose from "mongoose";

const ChatController = {
  init: async (
    req: Request & { username?: string; user_id?: string },
    res: Response
  ) => {
    try {
      const { group_users, group_name } = req.body;
      const requiredFields: { [key: string]: string } = {};
      if (group_users?.length === 0) {
        requiredFields.group_users = "required as Array of user id";
      } else if (!group_name || group_name?.length === 0) {
        requiredFields.group_name = "required";
      }
      if (Object.keys(requiredFields).length !== 0) {
        res.send({
          status: 500,
          require: requiredFields,
          msg: "invalid payload",
          res: "Error",
        });
      } else {
        await connectDB();
        const username = req.username;
        const user1 = await User.findOne({ username });
        const con_type: string =
          group_users?.length > 1 ? "group" : "individual";
        const existingConversation = await Conversation.findOne({
          uniqueStr: `${user1?._id}-${group_name}`,
        });
        if (existingConversation) {
          res.send({
            status: 200,
            msg: "conversation exists",
            res: "Error",
          });
        }
        const users = await User.find({
          _id: { $in: [...group_users, user1?._id] },
        });
        const conversation = new Conversation({
          name: `${group_name}`,
          type: con_type,
          status: 1,
          uniqueStr: `${user1?._id}-${group_name}`,
        });
        await conversation.save();
        if (conversation && users.length && user1) {
          for (const user of users) {
            const group_member = new GroupMember({
              name: group_name,
              user: user?._id,
              conversation: conversation._id,
              createdAt: Date.now(),
              createdBy: user1?._id,
              joinedAt: Date.now(),
            });
            await group_member.save();
          }
        }
        const group_members = await GroupMember.find({ name: group_name });
        res.send({
          status: 200,
          conversation,
          group_members,
          msg: "chat initialized successfully",
          res: "ok",
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        error,
        msg: "Error initializing chat",
        status: 500,
        res: "Error",
      });
    }
  },
  leave: async (
    req: Request & { username?: string; user_id?: string },
    res: Response
  ) => {
    try {
      const { user_id, conversation_id } = req.headers;
      const currentUserId = req.user_id;
      if (user_id === undefined) {
        res.send({
          require: {
            username: "require",
          },
          msg: "invalid Payload",
          status: 500,
          res: "Invalid",
        });
      } else {
        await connectDB();
        const users = [
          new mongoose.Types.ObjectId(user_id as string),
          new mongoose.Types.ObjectId(currentUserId),
        ];
        const group_members_to_delete = await GroupMember.aggregate([
          {
            $match: {
              user: { $in: users },
            },
          },
          {
            $group: {
              _id: "$conversation",
              count: { $sum: 1 },
              documents: { $push: "$$ROOT" },
            },
          },
          {
            $match: {
              count: { $gt: 1 },
            },
          },
          {
            $unwind: "$documents",
          },
          {
            $replaceRoot: { newRoot: "$documents" },
          },
        ]);

        const conversation_to_delete = await Conversation.findById(
          group_members_to_delete[0].conversation
        );

        if (
          group_members_to_delete?.length > 1 &&
          conversation_to_delete?.type === "individual"
        ) {
          let result = null;
          for (const group_member of group_members_to_delete) {
            result = await GroupMember.deleteOne({
              user: group_member.user,
              conversation: group_member.conversation,
            });
          }

          const result2 = await Conversation.deleteOne({
            _id: group_members_to_delete[0].conversation,
          });

          if (
            result &&
            result2 &&
            Number(result.deletedCount) &&
            Number(result2.deletedCount)
          ) {
            res.send({
              msg: "Conversation Leaved",
              status: 200,
              res: "ok",
            });
          } else {
            res.send({
              msg: "Something went wrong",
              status: 500,
              res: "Error",
            });
          }
        } else {
          const result = await GroupMember.deleteOne({
            user: new mongoose.Types.ObjectId(currentUserId),
            conversation: new mongoose.Types.ObjectId(
              conversation_id as string
            ),
          });
          if (Number(result.deletedCount)) {
            res.send({
              msg: "Conversation Leaved",
              status: 200,
              res: "ok",
            });
          } else {
            res.send({
              msg: "Something went wrong",
              status: 500,
              res: "Error",
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.send({
        error,
        msg: "Error leaving chat",
        status: 500,
        res: "Error",
      });
    }
  },
};

export default ChatController;
