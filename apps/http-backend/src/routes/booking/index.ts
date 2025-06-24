import { Response, Router } from "express";
import {
  SeatAvailabilitySchema,
  TicketBookingSchema,
} from "@repo/common";
import { prisma } from "@repo/db/client";
import { client } from "@repo/redis";
import {
  AuthenticatedRequest,
  verifyAuth,
} from "../../middlewares/authMiddleware";

const bookingRouter: Router = Router();

bookingRouter.post(
  "/book-tickets",
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { success, data, error } = TicketBookingSchema.safeParse(req.body);
      const userId = req.user?.id!;

      if (!success) {
        res.status(400).json({
          success: false,
          message: "Invalid input data.",
          error: error.format(),
        });
        return;
      }

      const { eventId, seats, amount } = data;

      const isAlreadyBooked = await prisma.bookedSeat.findMany({
        where: {
          seatId: {
            in: seats.map((s) => s.id),
          },
        },
      });

      if (isAlreadyBooked.length > 0) {
        res.status(400).json({
          message:
            "Sorry, some of the selected seats have already been booked. Please choose different seats.",
          success: false,
        });
        return;
      }

      const booking = await prisma.booking.create({
        data: {
          eventId,
          userId,
          status: "PENDING",
          bookedSeats: {
            createMany: {
              data: seats.map((s) => ({
                seatId: s.id,
              })),
            },
          },
          amount,
        },
      });

      await client.lPush(
        "event-bookings",
        JSON.stringify({
          bookingId: booking.id,
          eventId,
          seatIds: seats.map((s) => s.id),
        })
      );

      console.log("Successfully pushed booking into queue");

      res.status(201).json({
        message: "Your booking has been successfully initiated.",
        bookingId: booking.id,
        userId,
        eventId,
        amount,
        success: true,
      });
    } catch (error) {
      console.error("Error while booking tickets:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

bookingRouter.post(
  "/check-seat-availability",
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { success, data, error } = SeatAvailabilitySchema.safeParse(
        req.body
      );

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Invalid input data.",
          error: error.format(),
        });
        return;
      }

      const { eventId, seatIds } = data;

      const isAlreadyBooked = await prisma.bookedSeat.findMany({
        where: {
          booking: {
            eventId: eventId,
          },
          seatId: {
            in: seatIds,
          },
        },
      });

      if (isAlreadyBooked.length > 0) {
        res.status(400).json({
          message:
            "Sorry, some of the selected seats have already been booked. Please choose different seats.",
          available: false,
        });
        return;
      }

      res.status(200).json({
        message: "Seats are available.",
        available: true,
      });
    } catch (error) {
      console.error("Error while checking seat availability:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

bookingRouter.get(
  "/all",
  verifyAuth(["USER"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      const {
        page = "1",
        limit = "5",
        category = "",
        status = "",
        sortBy = "eventDate",
        order = "desc",
        search = "",
      } = req.query as {
        page?: string;
        limit?: string;
        category?: string;
        status?: string;
        sortBy?: string;
        order?: "asc" | "desc";
        search?: string;
      };

      const skip = (Number(page) - 1) * Number(limit);

      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));

      const whereClause: any = {
        userId,
        event: {
          ...(category && category !== "all"
            ? { category: category.toUpperCase() }
            : {}),
          ...(search
            ? { name: { contains: search, mode: "insensitive" } }
            : {}),
          ...(status === "upcoming" ? { startTime: { gt: now } } : {}),
          ...(status === "past" ? { startTime: { lt: now } } : {}),
          ...(status === "today"
            ? { startTime: { gte: startOfToday, lte: endOfToday } }
            : {}),
        },
      };

      const total = await prisma.booking.count({ where: whereClause });

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          event: {
            include: {
              city: true,
            },
          },
          bookedSeats: {
            select: {
              seatId: true,
            },
          },
        },
        orderBy: (() => {
          if (sortBy === "bookingDate") {
            return { createdAt: order };
          } else if (sortBy === "eventDate") {
            return { event: { startTime: order } };
          } else {
            return { amount: order };
          }
        })(),
        skip,
        take: Number(limit),
      });

      res.status(200).json({
        success: true,
        total,
        bookings,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      console.error("Error while fetching bookings:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
);

export default bookingRouter;
