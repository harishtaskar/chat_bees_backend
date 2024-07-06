import { Server } from "socket.io";
import { IMessage } from "../types";
import { Redis } from "ioredis";
import {
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_USERNAME,
} from "../config/config";

import { produceMessage } from "./kafka";
import { getGroupMembers } from "./utility";

const pub = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});
const sub = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

class SocketService {
  private _io: Server;
  constructor() {
    console.log("Init socket server...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this._io;
    console.log("Initiialized Socket listeners...");
    io.on("connect", async (socket) => {
      console.log("New Socket Connected...", socket.id);

      socket.on("userId", (user_id) => {
        socket.join(user_id);
      });

      socket.on("joinConversation", async (conversation) => {
        socket.join(conversation);
        const group_members: any = await getGroupMembers(conversation);
        if (group_members !== null) {
          for (const group_member of group_members) {
            console.log(
              "group_member_userid ==>",
              group_member?.user?.toString()
            );
            io.to(group_member?.user?.toString()).emit(
              "joinConversation",
              conversation
            );
          }
        }
      });

      socket.on("event:message", async (message: IMessage) => {
        await pub.publish("MESSAGES", JSON.stringify(message));
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    sub.on("message", async (channel, message: any) => {
      if (channel === "MESSAGES") {
        const messageObj = JSON.parse(message);
        console.log("messageObj", messageObj);
        io.to(messageObj?.conversation_id).emit("message", message);
        await produceMessage(JSON.stringify(message));
        console.log("Message Produced to Kafka Broker...");
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
