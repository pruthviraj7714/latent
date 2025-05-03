import { Request, Response, Router } from "express";
import { createEventSchema, updateEventSchema } from "@repo/common/schema";
import { prisma } from "@repo/db/client";
import {
  AuthenticatedRequest,
  verifyAuth,
} from "../../middlewares/authMiddleware";

const adminEventRouter: Router = Router();

adminEventRouter.post(
  "/create",
  verifyAuth(["ADMIN", "SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsedBody = createEventSchema.safeParse(req.body);
      const adminId = req.user?.id!;

      if (!parsedBody.success) {
        res.status(404).json({
          message: "Invalid Inputs",
          error: parsedBody.error.format(),
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
        category,
      } = parsedBody.data;

      const txn = await prisma.$transaction(async (tx) => {
        const event = await tx.event.create({
          data: {
            bannerImageUrl,
            description,
            cityId,
            endTime,
            name,
            startTime,
            venue,
            adminId,
            category,
          },
        });
        await tx.seat.createMany({
          data: seats.map((s) => ({
            seatNumber: s.seatNumber,
            price: s.price,
            type: s.type,
            eventId: event.id,
          })),
        });

        return event;
      });

      res.status(201).json({
        message: "Event Successfully Created",
        eventId: txn.id,
      });
    } catch (error) {
      console.error("Error while creating event:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

adminEventRouter.put(
  "/:eventId",
  verifyAuth(["ADMIN", "SUPERADMIN"]),
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

adminEventRouter.get(
  "/:eventId",
  verifyAuth(["ADMIN", "SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const adminId = req.user?.id!;

      if (!eventId) {
        res.status(404).json({
          message: "event Id is missing",
        });
        return;
      }

      const event = await prisma.event.findFirst({
        where: {
          adminId,
          id: eventId,
        },
      });

      if (!event) {
        res.status(400).json({
          message: "No Event with given id found",
        });
      }

      res.status(200).json({
        event,
      });
    } catch (error) {
      console.error("Error while getting event:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

adminEventRouter.delete(
  "/:eventId",
  verifyAuth(["ADMIN", "SUPERADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const adminId = req.user?.id!;

      if (!eventId) {
        res.status(404).json({
          message: "event Id is missing",
        });
        return;
      }

      const event = await prisma.event.delete({
        where: {
          adminId,
          id: eventId,
        },
      });

      if (!event) {
        res.status(400).json({
          message: "No Event with given id found",
        });
      }

      res.status(200).json({
        message: "EVent successfully Deleted",
      });
    } catch (error) {
      console.error("Error while deleting event:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

adminEventRouter.get(
  "/events",
  verifyAuth(["ADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const adminId = req.user?.id!;

      if (!eventId) {
        res.status(404).json({
          message: "event Id is missing",
        });
        return;
      }

      const events = await prisma.event.findMany({
        where: {
          adminId,
        },
      });

      if (!events) {
        res.status(400).json({
          message: "No Events found!",
        });
      }

      res.status(200).json({
        events,
      });
    } catch (error) {
      console.error("Error while getting events:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default adminEventRouter;
