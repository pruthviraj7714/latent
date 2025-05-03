import { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";
import { generateToken, verifyToken } from "authenticator";
import jwt from "jsonwebtoken";
import { sendMessage } from "../../utils/twilio";
import { JWT_SECRET } from "../../config";

const userRouter: Router = Router();

userRouter.post(
  "/signup",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, phoneNumber } = req.body;

      if (!name || !phoneNumber) {
        res.status(400).json({ message: "Name and phone number are required" });
        return;
      }

      const totp = generateToken(phoneNumber + "USER");

      const user = await prisma.user.upsert({
        where: {
          phoneNumber,
        },
        create: {
          name,
          phoneNumber,
          verified: false,
        },
        update: {},
      });

      if (process.env.NODE_ENV !== "development") {
        await sendMessage(`Your OTP for Latent is ${totp}`, phoneNumber);
        res.status(201).json({
          success: true,
          message: "OTP sent successfully",
          userId: user.id,
        });
      } else {
        res.status(201).json({
          success: true,
          message: "User created successfully",
          userId: user.id,
        });
      }
      return;
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

userRouter.post(
  "/signup/verify",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp) {
        res.status(400).json({
          success: false,
          message: "Phone number and OTP are required",
        });
        return;
      }

      const isVerified = verifyToken(phoneNumber + "USER", otp);

      if (!isVerified || isVerified.delta === -1) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      await prisma.user.update({
        where: { phoneNumber },
        data: { verified: true },
      });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET!
      );

      res.status(200).json({
        success: true,
        message: "User verified successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
        },
      });
      return;
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

userRouter.post(
  "/signin",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          message: "Phone number is required",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not registered. Please sign up first.",
        });
        return;
      }

      const totp = generateToken(phoneNumber + "USER");

      if (process.env.NODE_ENV !== "development") {
        await sendMessage(`Your login OTP for Latent is ${totp}`, phoneNumber);
        res.status(200).json({
          success: true,
          message: "OTP sent successfully",
          userId: user.id,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "OTP generated successfully",
          userId: user.id,
        });
      }
      return;
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

userRouter.post(
  "/signin/verify",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp) {
        res.status(400).json({
          success: false,
          message: "Phone number and OTP are required",
        });
        return;
      }

      const isVerified = verifyToken(phoneNumber + "USER", otp);

      if (!isVerified || isVerified.delta === -1) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET!
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
        },
      });
      return;
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default userRouter;
