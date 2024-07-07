import "dotenv/config";
import express from "express";
import { PORT } from "./config/config";
import bodyParser from "body-parser";
import cors from "cors";
import user_router from "./routes/user_routes";
import chat_router from "./routes/chat_routes";
import SocketService from "./services/socket";
import http from "http";
const app = express();
import { startConsumer } from "./services/kafka";
import conversation_router from "./routes/conversation_routes";

const init = () => {
  startConsumer();
  const socketService = new SocketService();

  const httpServer = new http.Server(app);

  app.use(cors());
  app.use(bodyParser.json());
  app.use("/user", user_router);
  app.use("/chat", chat_router);
  app.use("/conversation", conversation_router);

  socketService.io.attach(httpServer);

  socketService.initListeners();
};

init();
