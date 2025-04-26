import { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";
import { generateToken, verifyToken } from "authenticator";
import jwt from "jsonwebtoken";
import { sendMessage } from "../../utils/twilio";
import { ADMIN_JWT_SECRET } from "../../config";

const adminRouter: Router = Router();

adminRouter.post(
  "/signup",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, phoneNumber } = req.body;

      if (!name || !phoneNumber) {
        res.status(400).json({ message: "Name and phone number are required" });
        return;
      }

      const totp = generateToken(phoneNumber + "ADMIN");

      const admin = await prisma.admin.upsert({
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
          adminId: admin.id,
        });
      } else {
        res.status(201).json({
          success: true,
          message: "admin created successfully",
          adminId: admin.id,
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

adminRouter.post(
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

      const isVerified = verifyToken(phoneNumber + "ADMIN", otp);

      if (!isVerified || isVerified.delta === -1) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { phoneNumber },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: "admin not found",
        });
        return;
      }

      await prisma.admin.update({
        where: { phoneNumber },
        data: { verified: true },
      });

      const token = jwt.sign(
        { id: admin.id, phoneNumber: admin.phoneNumber },
        ADMIN_JWT_SECRET!
      );

      res.status(200).json({
        success: true,
        message: "admin verified successfully",
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          phoneNumber: admin.phoneNumber,
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

adminRouter.post(
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

      const admin = await prisma.admin.findUnique({
        where: { phoneNumber },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: "admin not registered. Please sign up first.",
        });
        return;
      }

      const totp = generateToken(phoneNumber + "ADMIN");

      if (process.env.NODE_ENV !== "development") {
        await sendMessage(`Your login OTP for Latent is ${totp}`, phoneNumber);
        res.status(200).json({
          success: true,
          message: "OTP sent successfully",
          adminId: admin.id,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "OTP generated successfully",
          adminId: admin.id,
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

adminRouter.post(
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

      const isVerified = verifyToken(phoneNumber + "ADMIN", otp);

      if (!isVerified || isVerified.delta === -1) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { phoneNumber },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: "admin not found",
        });
        return;
      }

      const token = jwt.sign(
        { id: admin.id, phoneNumber: admin.phoneNumber },
        ADMIN_JWT_SECRET!
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          phoneNumber: admin.phoneNumber,
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

export default adminRouter;
