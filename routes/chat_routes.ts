import { Router } from "express";
import userAuth from "../middlewares/user_auth";
import ChatController from "../controllers/ChatController";

const chat_router = Router();

chat_router.post("/init", userAuth, ChatController.init);
chat_router.delete("/leave", userAuth, ChatController.leave);

export default chat_router;
