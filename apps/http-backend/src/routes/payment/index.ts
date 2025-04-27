import { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";
import { RazorpayWebhookSchema } from "@repo/common/schema";
import crypto from "crypto";

const paymentRouter: Router = Router();

paymentRouter.post("/", async (req: Request, res: Response) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"] as string;
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
      return;
    }

    const parsed = RazorpayWebhookSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error,
      });
      return;
    }

    const data = parsed.data;

    const notes = data.payload.payment.entity.notes;

    const { bookingId, userId, eventId, seatIds } = notes;

    if (!bookingId || !userId || !eventId || !seatIds || seatIds.length === 0) {
      res.status(400).json({
        success: false,
        message:
          "Required metadata (bookingId, userId, eventId, seatId) missing in notes",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId,
          userId,
          eventId,
          status: "SUCCESS",
        },
      });

      await tx.bookedSeat.createMany({
        data: seatIds.map((sId) => ({
          bookingId,
          seatId: sId,
        })),
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "SUCCESS",
          payment: {
            connect: { id: payment.id },
          },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Payment successfully processed",
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});
export default paymentRouter;
