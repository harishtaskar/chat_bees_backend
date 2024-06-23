import { Router } from "express";
import userAuth from "../middlewares/user_auth";
import { User } from "../models/user_modal";
import { Conversation } from "../models/conversation_modal";
import connectDB from "../utils/database";
import { GroupMember } from "../models/group_member_modal";
import { IConversation, IUser } from "../types";

const chat_router = Router();

chat_router.post("/init", userAuth, async (req: any, res) => {
  try {
    const { group_users, group_name } = req.body;
    const requiredFields: any = {};
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
      const con_type: string = group_users?.length > 1 ? "group" : "individual";
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
});

// chat_router.delete("/leave", userAuth, async (req: any, res: any) => {
//   try {
//     const { user_id } = req.headers;
//     const currentUserId = req.user_id;
//     if (!user_id) {
//       res.send({
//         require: {
//           username: "require",
//         },
//         msg: "invalid Payload",
//         status: 500,
//         res: "Invalid",
//       });
//     } else {
//       await connectDB();
//       const userToRemove: IUser | null = await User.findById(user_id);
//       if (?.type === "individual") {
//         const result = await GroupMember.deleteOne({
//           user: user_id,
//           conversation: conversation_id,
//         });
//         const result2 = await Conversation.deleteOne({ _id: conversation_id });
//         if (Number(result.deletedCount) && Number(result2.deletedCount)) {
//           res.send({
//             msg: "Conversation Leaved",
//             status: 200,
//             res: "ok",
//           });
//         }
//       } else {
//         const result = await GroupMember.deleteOne({
//           user: user_id,
//           conversation: conversation_id,
//         });
//         if (Number(result.deletedCount)) {
//           res.send({
//             msg: "Conversation Leaved",
//             status: 200,
//             res: "ok",
//           });
//         }
//       }
//       res.send({
//         msg: "Something went wrong",
//         status: 500,
//         res: "Error",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.send({
//       error,
//       msg: "Error leaving chat",
//       status: 500,
//       res: "Error",
//     });
//   }
// });

export default chat_router;
