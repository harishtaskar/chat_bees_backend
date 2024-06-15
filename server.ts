import "dotenv/config";
import express from "express";
import { PORT } from "./config/config";
import bodyParser from "body-parser";
var cors = require("cors");
import user_router from "./routes/user_routes";
import chat_router from "./routes/chat_routes";
import SocketService from "./services/socket";
import http from "http";
const app = express();

const init = () => {
  const socketService = new SocketService();

  const httpServer = new http.Server(app);

  app.use(cors());
  app.use(bodyParser.json());
  app.use("/user", user_router);
  app.use("/chat", chat_router);

  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`);
  });

  socketService.initListeners();
};

init();
