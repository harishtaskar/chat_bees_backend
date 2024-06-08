import mongoose from "mongoose";
import { MONGO_URL } from "../config/config";

const connectDB = async () => {
    const url = MONGO_URL;
    let isConnected = false;

    if (isConnected) {
        console.log("Database Connected");
        return;
    }
    
    try {
        if (url) {
            await mongoose.connect(url, {
              dbName: "chat_bees",
            });
            isConnected = true;
            console.log("Database Connected");
          }
    } catch (error) {
        throw new Error("error connecting database");
    }
}

export default connectDB;