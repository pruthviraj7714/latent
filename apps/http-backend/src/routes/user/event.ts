import { Request, Response, Router } from "express";
import { prisma } from "@repo/db";
import { addMinPriceToEvents } from "../../utils/helper";
import {
  AuthenticatedRequest,
  verifyAuth,
} from "../../middlewares/authMiddleware";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

const eventRouter: Router = Router();

enum EventCategory {
  MUSIC = "MUSIC",
  SPORTS = "SPORTS",
  COMEDY = "COMEDY",
  TECH = "TECH",
  EDUCATION = "EDUCATION",
  WORKSHOP = "WORKSHOP",
  PREMIERE = "PREMIERE",
}

eventRouter.get(
  "/event/:eventId",
  verifyAuth(["USER"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId } = req.params;

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          seats: {
            include: {
              bookedSeat: true,
            },
          },
          city: true,
        },
      });

      const minPrice = event?.seats.length
        ? Math.min(...event.seats.map((seat) => seat.price))
        : null;

      const eventWithMinPrice = {
        ...event,
        minPrice,
      };
      res.status(200).json({ event: eventWithMinPrice });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.post(
  "/:eventId/view",
  verifyAuth(["USER"]),
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
  verifyAuth(["USER"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const events = await prisma.event.findMany({
        where: {
          isFeatured: true,
        },
        include: {
          seats: true,
        },
        take: 5,
      });

      const eventsWithMinPrice = addMinPriceToEvents(events);

      res.status(200).json({ events: eventsWithMinPrice });
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
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id!;
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: { event: true },
      });

      const categoryCount: Partial<Record<EventCategory, number>> = {};
      for (const b of bookings) {
        const cat = b.event.category;
        //@ts-ignore
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
        include: {
          seats: true,
        },
        orderBy: { views: "desc" },
        take: 5,
      });

      const eventsWithMinPrice = addMinPriceToEvents(events);

      res.status(200).json({ events: eventsWithMinPrice });
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
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const events = await prisma.event.findMany({
        where: {
          startTime: {
            gte: new Date(),
          },
        },
        include: {
          seats: true,
        },
        orderBy: {
          views: "desc",
        },
        take: 5,
      });

      const eventsWithMinPrice = addMinPriceToEvents(events);

      res.status(200).json({ events: eventsWithMinPrice });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/search-event",
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const searchQuery = req.query.search;

      if (!searchQuery) {
        res.status(400).json({
          message: "Search Query is missing!",
        });
        return;
      }

      const events = await prisma.event.findMany({
        where: {
          name: {
            contains: searchQuery as string,
            mode: "insensitive",
          },
        },
        include: {
          city: true,
          seats: true,
        },
      });

      const eventsWithMinPrice = addMinPriceToEvents(events);

      res.status(200).json({ events: eventsWithMinPrice });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/category/by-category",
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 8,
        category,
        cityNames = "",
        days = "",
        search = "",
      } = req.query;

      if (!category) {
        res.status(400).json({ message: "Category is missing!" });
        return;
      }

      const cat = category.toString().toUpperCase();
      const skip = (Number(page) - 1) * Number(limit);
      const now = new Date();

      const cityArray = typeof cityNames === "string" && cityNames.length > 0
        ? cityNames.split(",")
        : [];

      const daysArray = typeof days === "string" && days.length > 0
        ? days.split(",").map((d) => d.toLowerCase())
        : [];

      const startTimeFilters = daysArray.map((day) => {
        if (day === "today") {
          return {
            startTime: {
              gte: startOfDay(now),
              lte: endOfDay(now),
            },
          };
        } else if (
          ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(day)
        ) {
          const targetWeekdayIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(day);
          const currentWeekdayIndex = now.getDay();
          const diff = targetWeekdayIndex - currentWeekdayIndex;
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + diff);
          return {
            startTime: {
              gte: startOfDay(targetDate),
              lte: endOfDay(targetDate),
            },
          };
        }
        return null;
      }).filter(Boolean);

      const whereClause: any = {
        ...(cat !== "ALL" && { category: cat }),
        ...(cityArray.length > 0 && {
          OR: cityArray.map((name) => ({
            city: {
              name: {
                contains: name,
                mode: "insensitive",
              },
            },
          })),
        }),
        ...(startTimeFilters.length === 1 && startTimeFilters[0]),
        ...(startTimeFilters.length > 1 && {
          OR: startTimeFilters,
        }),
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      };

      const events = await prisma.event.findMany({
        where: whereClause,
        include: {
          city: true,
          seats: true,
        },
        skip,
        take: Number(limit),
        orderBy: {
          startTime: "asc",
        },
      });

      const total = await prisma.event.count({
        where: whereClause,
      });

      const eventsWithMinPrice = addMinPriceToEvents(events);

      res.status(200).json({
        success: true,
        total,
        events: eventsWithMinPrice,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

eventRouter.get(
  "/premieres",
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const events = await prisma.event.findMany({
        where: {
          isPremiere: true,
        },
        include: {
          seats: true,
        },
        take: 5,
      });

      const eventsWithMinPrice = addMinPriceToEvents(events);

      res.status(200).json({ events: eventsWithMinPrice });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default eventRouter;
