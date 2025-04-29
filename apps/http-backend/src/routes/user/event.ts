import { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";
import { userMiddleware } from "../../middlewares/authMiddleware";

const eventRouter: Router = Router();

interface UserAuthenticatedRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
  };
}

enum EventCategory {
  MUSIC = "MUSIC",
  SPORTS = "SPORTS",
  COMEDY = "COMEDY",
  TECH = "TECH",
  EDUCATION = "EDUCATION",
  WORKSHOP = "WORKSHOP",
  PREMIERE = "PREMIERE",
}

eventRouter.post(
  "/:eventId/view",
  userMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId } = req.params;

      await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      res.status(200).json({ message: "View counted" });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/featured",
  userMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const events = await prisma.event.findMany({
        where: {
          isFeatured: true,
        },
        take: 5,
      });

      res.status(200).json({ events });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/recommended",
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id!;
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: { event: true },
      });

      const categoryCount: Partial<Record<EventCategory, number>> = {};
      for (const b of bookings) {
        const cat = b.event.category;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }

      const recommendedCategory =
        Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "PREMIERE";

      const events = await prisma.event.findMany({
        where: {
          category: recommendedCategory as EventCategory,
          startTime: { gte: new Date() },
        },
        orderBy: { views: "desc" },
        take: 5,
      });

      res.status(200).json({ events });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/popular",
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const events = await prisma.event.findMany({
        where: {
          startTime: {
            gte: new Date(),
          },
        },
        orderBy: {
          views: "desc",
        },
        take: 5,
      });
      res.status(200).json({ events });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/by-category",
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const category = req.query.category;

      if (!category) {
        res.status(400).json({
          message: "Category is missing!",
        });
        return;
      }

      const events = await prisma.event.findMany({
        where: {
          category: category as EventCategory,
        },
      });

      res.status(200).json({ events });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/premieres",
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const events = await prisma.event.findMany({
        where: {
          isPremiere: true,
        },
        take: 5,
      });

      res.status(200).json({ events });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/cities/all",
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cities = await prisma.city.findMany({});
      res.status(200).json({
        cities,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/cities/top",
  userMiddleware,
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const topCities = await prisma.city.findMany({
        take: 5,
        orderBy: {
          events: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: { events: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        cities: topCities,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default eventRouter;
