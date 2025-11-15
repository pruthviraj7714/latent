import cron from "node-cron";
import { prisma } from "@repo/db";

async function clearUnProcessedBookings() {
  console.log("Running clearUnProcessedBookings job...");

  const now = new Date();

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      bookedSeats: {
        some: {
          seat: {
            lockedUntil: { lt: now },
          },
        },
      },
    },
    include: {
      bookedSeats: {
        include: {
          seat: true,
        },
      },
    },
  });

  for (const booking of expiredBookings) {
    const seatIds = booking.bookedSeats.map((bs) => bs.seatId);

    await prisma.$transaction(async (tx) => {
      await tx.bookedSeat.deleteMany({
        where: { bookingId: booking.id },
      });

      await tx.seat.updateMany({
        where: {
          id: {
            in: seatIds,
          },
        },
        data: {
          lockedUntil: null,
        },
      });

      await tx.payment.updateMany({
        where: {
          bookingId: booking.id,
          status: "PENDING",
        },
        data: {
          status: "FAILED",
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "EXPIRED",
        },
      });
    });

    console.log(`Cleared expired booking: ${booking.id}`);
  }
}

cron.schedule("*/5 * * * *", clearUnProcessedBookings);
