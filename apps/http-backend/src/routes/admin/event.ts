import { Request, Response, Router } from "express";
import { createEventSchema } from "@repo/common/schema";
import { adminMiddleware } from "../../middlewares/authMiddleware";
import { prisma } from "@repo/db/client";

const adminEventRouter: Router = Router();

interface AdminAuthenticatedRequest extends Request {
  admin?: {
    id: string;
    phoneNumber: string;
  };
}

adminEventRouter.post(
  "/create",
  adminMiddleware,
  async (req: AdminAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsedBody = createEventSchema.safeParse(req.body);
      const adminId = req.admin?.id!;

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
        location,
        endTime,
        name,
        startTime,
        venue,
        seats,
      } = parsedBody.data;

      await prisma.event.create({
        data: {
          bannerImageUrl,
          description,
          location,
          endTime,
          name,
          startTime,
          venue,
          adminId,
          seats,
        },
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

adminEventRouter.get(
  "/:eventId",
  adminMiddleware,
  async (req: AdminAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const adminId = req.admin?.id!;

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
    adminMiddleware,
    async (req: AdminAuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const eventId = req.params.eventId;
        const adminId = req.admin?.id!;
  
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
          message : "EVent successfully Deleted"
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
    adminMiddleware,
    async (req: AdminAuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const eventId = req.params.eventId;
        const adminId = req.admin?.id!;
  
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
            events
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
