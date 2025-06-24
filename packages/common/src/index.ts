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
  category: z.enum([
    "MUSIC",
    "SPORTS",
    "COMEDY",
    "TECH",
    "EDUCATION",
    "WORKSHOP",
    "PREMIERE",
  ]),
});

export const updateEventSchema = z.object({
  name: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  venue: z.string(),
  cityId: z.string(),
  category: z.enum([
    "MUSIC",
    "SPORTS",
    "COMEDY",
    "TECH",
    "EDUCATION",
    "WORKSHOP",
    "PREMIERE",
  ]),
  description: z.string(),
  bannerImageUrl: z.string(),
  seats: z.array(seatSchema),
});

export const CashfreewebhookSchema = z.object({
  type: z.enum(["PAYMENT_SUCCESS_WEBHOOK", "PAYMENT_FAILED_WEBHOOK"]),
  event_time: z.string(),
  data: z.object({
    order: z.object({
      order_id: z.string(),
      order_amount: z.number(),
      order_currency: z.string(),
      order_tags: z.unknown().nullable(),
    }),
    payment: z.object({
      cf_payment_id: z.string(),
      payment_status: z.enum(["SUCCESS", "FAILED", "PENDING"]),
      payment_amount: z.number(),
      payment_currency: z.string(),
      payment_message: z.string(),
      payment_time: z.string(),
      bank_reference: z.string(),
      auth_id: z.string().nullable(),
      payment_method: z.record(z.unknown()), 
      payment_group: z.string(),
    }),
    customer_details: z.object({
      customer_name: z.string().nullable(),
      customer_id: z.string(),
      customer_email: z.string().nullable(),
      customer_phone: z.string(),
    }),
    payment_gateway_details: z.object({
      gateway_name: z.string(),
      gateway_order_id: z.string(),
      gateway_payment_id: z.string(),
      gateway_status_code: z.string().nullable(),
      gateway_order_reference_id: z.union([z.string(), z.literal("null")]), 
      gateway_settlement: z.string(),
      gateway_reference_name: z.string().nullable(),
    }),
    payment_offers: z.null(),
  }),
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
      id: z.string(),
    })
  ),
  eventId: z.string(),
  amount: z.number(),
});

export const SeatAvailabilitySchema = z.object({
  seatIds: z.array(z.string()),
  eventId: z.string(),
});

export const UserEditSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  categoryPreference: z.enum([
    "MUSIC",
    "SPORTS",
    "COMEDY",
    "TECH",
    "EDUCATION",
    "WORKSHOP",
    "PREMIERE",
  ]),
});