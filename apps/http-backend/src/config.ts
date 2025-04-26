import { config } from "dotenv";
config();
export const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
export const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
