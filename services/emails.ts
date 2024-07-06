import { CHATBEES_USER, CHATBEES_USER_PASSWORD } from "../config/config";
const someModule = require("fix-esm").require("emailjs");
import { SMTPClient } from "emailjs";

const client = new SMTPClient({
  user: CHATBEES_USER,
  password: CHATBEES_USER_PASSWORD,
  host: `smtp.gmail.com`,
  port: 587,
  tls: true,
});

export const sendEmail = async (
  location: string,
  error: any,
  user_id: string,
  user_name: string
) => {
  console.log(CHATBEES_USER, CHATBEES_USER_PASSWORD);
  try {
    const message = `Error in ${location}, user: ${user_name}-${user_id}, error log: ${JSON.stringify(
      error
    )}`;

    const response = await client.sendAsync({
      text: message,
      from: `you ${CHATBEES_USER}`,
      to: `someone ${CHATBEES_USER}`,
      subject: `SERVER ERROR on ${location}`,
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};
