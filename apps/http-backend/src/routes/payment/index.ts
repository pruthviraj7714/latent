import { Request, Response, Router } from "express";
import { prisma } from "@repo/db";
import { CashfreewebhookSchema } from "@repo/common";

const paymentRouter: Router = Router();

paymentRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const parsed = CashfreewebhookSchema.safeParse(req.body);
    console.log("webhook hit");
    console.log(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error,
      });
    }

    const { customer_id } = parsed.data.data.customer_details;
    const { order_id, order_amount } = parsed.data.data.order;
    const eventType = parsed.data.type;

    const booking = await prisma.booking.findUnique({
      where: { id: order_id },
      include: { payment: true },
    });

    if (!booking) {
      return res.status(400).json({ message: "No Booking found with this order id" });
    }

    if (booking.status === "SUCCESS" || booking.status === "FAILED") {
      console.log("Already processed webhook. Ignoring duplicate hit.");
      return res.status(200).json({ success: true, message: "Webhook already processed" });
    }

    const statusMap: Record<string, "SUCCESS" | "FAILED"> = {
      PAYMENT_SUCCESS_WEBHOOK: "SUCCESS",
      PAYMENT_FAILED_WEBHOOK: "FAILED",
      PAYMENT_USER_DROPPED_WEBHOOK: "FAILED",
    };

    const finalStatus = statusMap[eventType];

    if (!finalStatus) {
      return res.status(400).json({ message: "Unknown webhook type" });
    }

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.upsert({
        where: { bookingId: booking.id },
        update: {
          status: finalStatus,
          amount: order_amount,
        },
        create: {
          bookingId: booking.id,
          userId: customer_id,
          eventId: booking.eventId,
          amount: order_amount,
          status: finalStatus,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: finalStatus,
          payment: { connect: { id: payment.id } },
        },
      });
    });

    return res.status(200).json({
      success: finalStatus === "SUCCESS",
      message:
        finalStatus === "SUCCESS"
          ? "Ticket successfully booked"
          : eventType === "PAYMENT_USER_DROPPED_WEBHOOK"
          ? "Payment Aborted"
          : "Payment Failed",
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});


export default paymentRouter;
