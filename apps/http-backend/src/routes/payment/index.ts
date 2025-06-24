import { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";
import { CashfreewebhookSchema } from "@repo/common";

const paymentRouter: Router = Router();

paymentRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    console.log("Webhook received body:", JSON.stringify(req.body, null, 2));
    // const parsed = CashfreewebhookSchema.safeParse(req.body);

    // console.log(parsed.data);
    
    // if (!parsed.success) {
    //   res.status(400).json({
    //     success: false,
    //     error: parsed.error,
    //   });
    //   return;
    // }

    const { customer_id } = req.body.data.customer_details;
    const { order_id, order_amount } = req.body.data.order;

    const booking = await prisma.booking.findUnique({
      where: {
        id: order_id,
      },
    });

    if (!booking) {
      res.status(400).json({
        message: "No Booking found with this order id",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId: customer_id,
          eventId: booking.eventId,
          amount: order_amount,
          status: "SUCCESS",
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
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
      message: "Ticket successfully booked",
    });
    console.log("Ticket successfully booked");
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
