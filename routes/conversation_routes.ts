import { Router } from "express";
import userAuth from "../middlewares/user_auth";
import connectDB from "../utils/database";
import { ConversationMSGCount } from "../models/conversation_msg_count";
import { Message } from "../models/message_modal";

const conversation_router = Router();

conversation_router.post(
  "increase-unread_msg-count",
  userAuth,
  async (req: any, res: any) => {
    try {
      const user_id = req.user_id;
      const conversation_id = req.body;
      if (!conversation_id) {
        res.send({
          msg: "Invalid Payload",
          status: 500,
          res: "Error",
          required: {
            conversation_id: "string",
          },
        });
      }
      await connectDB();
      const updatedRes = await ConversationMSGCount.updateOne(
        { conversation_id, user_id },
        { $inc: { unread_msg: 1 } }
      );
      const conv_msg_count = await ConversationMSGCount.findOne({
        user_id,
        conversation_id,
      });
      if (updatedRes.modifiedCount !== 0 && conv_msg_count) {
        res.send({
          conv_msg_count,
          msg: "Unread Msg updated successfully",
          status: 200,
          res: "ok",
        });
      } else {
        res.send({
          msg: "Something went wrong",
          status: 200,
          res: "Error",
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        error,
        msg: "Error increase-msg-count",
        status: 500,
        res: "Error",
      });
    }
  }
);

conversation_router.get("/messages", userAuth, async (req: any, res: any) => {
  try {
    const { conversation_id } = req.query;
    console.log("conversation_id==>", conversation_id);
    if (!conversation_id) {
      res.send({
        msg: "Invalid Response",
        status: 200,
        res: "Error",
        required: "conversation_id in params",
      });
    } else {
      await connectDB();
      const messages = await Message.find({ conversation_id })
        .sort({ sendAt: 1 }) // Sort by sendAt in descending order
        .exec();

      res.send({
        messages,
        msg: "messages fetch successfully",
        status: 200,
        res: "ok",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      error,
      msg: "Error messages fetching",
      status: 500,
      res: "Error",
    });
  }
});

export default conversation_router;
