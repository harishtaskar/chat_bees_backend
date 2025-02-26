import { Router } from "express";
import userAuth from "../middlewares/user_auth";
import ConversationController from "../controllers/ConversationController";

const conversation_router = Router();

conversation_router.post(
  "increase-unread_msg-count",
  userAuth,
  ConversationController.increaseUnreadMsgCount
);
conversation_router.get(
  "/messages",
  userAuth,
  ConversationController.getMessages
);

export default conversation_router;
