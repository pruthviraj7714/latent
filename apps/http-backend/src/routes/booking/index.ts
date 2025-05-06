import { Request, Response, Router } from "express";
import {
  SeatAvailabilitySchema,
  TicketBookingSchema,
} from "@repo/common/schema";
import { prisma } from "@repo/db/client";
import { client } from "@repo/redis/client";
import { verifyAuth } from "../../middlewares/authMiddleware";

const bookingRouter: Router = Router();

interface UserAuthenticatedRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
  };
}

bookingRouter.post(
  "/book-tickets",
  verifyAuth(["USER"]),
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
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
  async (req: UserAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { success, data, error } = SeatAvailabilitySchema.safeParse(
        req.body
      );
      const userId = req.user?.id!;

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

export default bookingRouter;
