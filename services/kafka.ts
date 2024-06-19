import { Kafka, Producer } from "kafkajs";
import {
  KAFKA_HOST,
  KAFKA_PASSWORD,
  KAFKA_PORT,
  KAFKA_USERNAME,
} from "../config/config";
import fs from "fs";
import path from "path";
import { saveMessage } from "./utility";
import { ObjectId } from "mongodb";
import { IMessage } from "../types";

const kafka = new Kafka({
  brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`],
  ssl: { ca: [fs.readFileSync(path.resolve("./services/ca.pem"), "utf-8")] },
  sasl: {
    username: KAFKA_USERNAME || "",
    password: KAFKA_PASSWORD || "",
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

export const createProducer = async () => {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
};

export const produceMessage = async (message: string) => {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
};

export const startConsumer = async () => {
  console.log("Kafka consumer is running...");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      console.log(
        "new message recieved in kafka consumer...",
        message.value.toString("utf8")
      );
      try {
        const msg: IMessage | any = message.value.toString("utf8");
        await saveMessage(JSON.parse(msg));
      } catch (error) {
        console.log("Something went wrong...", error);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
};

export default kafka;
