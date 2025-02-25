import nodemailer from "nodemailer";
import { CHAT_BEES_USER, CHAT_BEES_USER_PASSWORD } from "../config/config";

const email_subject_cache = new Map<string, number>();
const rate_limit_minutes = 5;

export const sendEmail = async (subject: string, to: string, html: string) => {
  try {
    console.log('trying to send email', subject);
    const current_time = Date.now();
    for (const [key, timestamp] of email_subject_cache.entries()) {
      if (current_time - timestamp >= rate_limit_minutes * 60 * 1000) {
        email_subject_cache.delete(key);
      }
    }

    const last_sent_time = email_subject_cache.get(subject);
    
    if (last_sent_time && current_time - last_sent_time < rate_limit_minutes * 60 * 1000) {
      console.log(`Email with subject "${subject}" was sent recently. Skipping.`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: CHAT_BEES_USER,
        pass: CHAT_BEES_USER_PASSWORD,
      },
    });
    console.log(CHAT_BEES_USER, CHAT_BEES_USER_PASSWORD);
    await transporter.sendMail({
      from: `${CHAT_BEES_USER}`,
      to,
      subject,
      text: "Hello world?",
      html,
    });

    email_subject_cache.set(subject, current_time);
  } catch (error) {
    console.log(error);
  }
};
