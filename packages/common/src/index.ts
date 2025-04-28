import { z } from "zod";

export const seatSchema = z.object({
  price: z.number(),
  type: z.enum([
    "REGULAR",
    "PREMIUM",
    "RECLINER",
    "VIP",
    "COUPLE",
    "BALCONY",
    "SOFA",
    "LUXURY",
  ]),
  seatNumber: z.string(),
  id: z.string().optional(),
});

export const createEventSchema = z.object({
  name: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  venue: z.string(),
  cityId: z.string(),
  description: z.string(),
  bannerImageUrl: z.string(),
  seats: z.array(seatSchema),
});

export const updateEventSchema = z.object({
  name: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  venue: z.string(),
  cityId: z.string(),
  description: z.string(),
  bannerImageUrl: z.string(),
  seats: z.array(seatSchema),
});

export const RazorpayWebhookSchema = z.object({
  entity: z.literal("event"),
  account_id: z.string(),
  event: z.string(),
  contains: z.array(z.string()),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        entity: z.literal("payment"),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        order_id: z.string(),
        invoice_id: z.string().nullable(),
        international: z.boolean(),
        method: z.string(),
        amount_refunded: z.number(),
        refund_status: z.string().nullable(),
        captured: z.boolean(),
        description: z.string(),
        card_id: z.string(),
        bank: z.string().nullable(),
        wallet: z.string().nullable(),
        vpa: z.string().nullable(),
        email: z.string(),
        contact: z.string(),
        notes: z.object({
          bookingId: z.string(),
          userId: z.string(),
          eventId: z.string(),
          seatIds: z.array(z.string()),
        }),
        fee: z.number(),
        tax: z.number(),
        created_at: z.number(),
      }),
    }),
  }),
  created_at: z.number(),
  webHookSecret: z.string(),
});

export const TicketBookingSchema = z.object({
  seats: z.array(
    z.object({
      price: z.number(),
      type: z.enum([
        "REGULAR",
        "PREMIUM",
        "RECLINER",
        "VIP",
        "COUPLE",
        "BALCONY",
        "SOFA",
        "LUXURY",
      ]),
      seatNumber: z.string(),
      id: z.string()
    })
  ),
  eventId: z.string(),
});
