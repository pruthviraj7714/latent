import { config } from "dotenv";
import twilio from "twilio";

config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendMessage(body: string, to: string) {
  await client.messages.create({
    body,
    from: "+18382012723",
    to : `+91${to}`,
  });
}
