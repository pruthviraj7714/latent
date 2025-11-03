import { prisma } from "@repo/db/client";

async function clearUnProcessedBookings() {
  console.log("Running clearUnProcessedBookings job...");

  const pendingBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      bookedSeats: {
        include : {
            seat : true
        },
      },
    },
  });

  const now = new Date();

  for (const booking of pendingBookings) {
    const expired = booking.bookedSeats.some((bs) => {
      return bs.seat.lockedUntil && bs.seat.lockedUntil < now;
    });

    if (expired) {
      await prisma.$transaction(async (tx) => {
        await tx.bookedSeat.deleteMany({
          where: { bookingId: booking.id },
        });

        await tx.seat.updateMany({
          where: {
            bookedSeat: {
                bookingId: booking.id,
            },
          },
          data: {
            lockedUntil: null,
          },
        });

        await tx.payment.updateMany({
          where: {
            bookingId: booking.id,
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
}

setInterval(clearUnProcessedBookings, 5 * 60 * 1000);
