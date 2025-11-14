import { Request, Response, Router } from "express";
import { prisma } from "@repo/db";
import { generateToken, verifyToken } from "authenticator";
import jwt from "jsonwebtoken";
import { sendMessage } from "../../utils/twilio";
import { updateEventSchema } from "@repo/common";
import {
  AuthenticatedRequest,
  verifyAuth,
} from "../../middlewares/authMiddleware";
import { JWT_SECRET } from "../../config";

const superAdminRouter: Router = Router();

superAdminRouter.post(
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

      const admin = await prisma.user.findFirst({
        where: { phoneNumber, role: "SUPERADMIN" },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: "super admin not found with this creds.",
        });
        return;
      }

      const totp = generateToken(phoneNumber + "SUPERADMIN");

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

superAdminRouter.post(
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

      const isVerified = verifyToken(phoneNumber + "SUPERADMIN", otp);

      if (!isVerified || isVerified.delta === -1) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
        return;
      }

      const admin = await prisma.user.findFirst({
        where: { phoneNumber, role: "SUPERADMIN" },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: "super admin not found",
        });
        return;
      }

      const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET!);

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          phoneNumber: admin.phoneNumber,
          role : admin.role
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

superAdminRouter.post(
  "/add-city",
  verifyAuth(["SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, state } = req.body;

      if (!name || !state) {
        res.status(400).json({
          message: "Invalid Inputs",
        });
      }

      const isCityAlreadyExists = await prisma.city.findFirst({
        where: {
          OR: [{ name }, { state }],
        },
      });

      if (isCityAlreadyExists) {
        res.status(400).json({
          message: "City Already Exists",
        });
        return;
      }

      await prisma.city.create({
        data: {
          name,
          state,
        },
      });

      res.status(201).json({
        message: "City Successfully Added",
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

superAdminRouter.get(
  "/events",
  verifyAuth(["SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = await prisma.event.findMany({});

      res.status(200).json({
        events,
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

superAdminRouter.put(
  "/:eventId",
  verifyAuth(["SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsedBody = updateEventSchema.safeParse(req.body);
      const adminId = req.user?.id!;
      const eventId = req.params.eventId;

      if (!eventId) {
        res.status(400).json({ message: "Event Id is missing" });
        return;
      }
      if (!parsedBody.success) {
        res.status(400).json({
          message: "Invalid Inputs",
          error: parsedBody.error.format(),
        });
        return;
      }

      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

      if (!event) {
        res.status(400).json({
          message: "No Event found!",
        });
        return;
      }

      if (new Date() >= event.startTime) {
        res.status(403).json({
          message: "Event cannot be modified right now",
        });
        return;
      }

      const {
        bannerImageUrl,
        description,
        cityId,
        endTime,
        name,
        startTime,
        venue,
        seats,
      } = parsedBody.data;

      const txn = await prisma.$transaction(async (tx) => {
        const event = await tx.event.update({
          where: {
            id: eventId,
          },
          data: {
            bannerImageUrl,
            description,
            cityId,
            endTime,
            name,
            startTime,
            venue,
            adminId,
          },
        });

        await tx.seat.deleteMany({
          where: {
            eventId: eventId,
          },
        });

        if (seats && seats.length > 0) {
          await tx.seat.createMany({
            data: seats.map((s) => ({
              seatNumber: s.seatNumber,
              price: s.price,
              type: s.type,
              eventId: event.id,
            })),
          });
        }

        return event;
      });

      res.status(200).json({
        message: "Event Successfully updated",
        eventId: txn.id,
      });
    } catch (error) {
      console.error("Error while updating event:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default superAdminRouter;
