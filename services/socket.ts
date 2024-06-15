import { Server } from "socket.io";
import { IMessage } from "../types";

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
  }

  public initListeners() {
    const io = this._io;
    console.log("Initiialized Socket listeners...");
    io.on("connect", async (socket) => {
      console.log("New Socket Connected...", socket.id);

      socket.on("event:message", async (message: IMessage) => {
        console.log("new Message recieved : ", message.text);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
