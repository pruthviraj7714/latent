import { datetimeRegex, z } from "zod";

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
  data: z.object({
    order: z.object({
      order_id: z.string(),
      order_amount: z.number(),
      order_currency: z.string(),
      order_tags: z.nullable(z.unknown()), // You can make this more specific if needed
    }),
    payment: z.object({
      cf_payment_id: z.string(), // corrected from number to string
      payment_status: z.enum(["SUCCESS", "FAILED", "PENDING"]), // restrict to expected values
      payment_amount: z.number(),
      payment_currency: z.string(),
      payment_message: z.string(),
      payment_time: z.string(), // ISO 8601 string
      bank_reference: z.string(),
      auth_id: z.nullable(z.string()),
      payment_method: z.record(z.unknown()), // object type
      payment_group: z.string(),
    }),
    customer_details: z.object({
      customer_name: z.nullable(z.string()),
      customer_id: z.string(),
      customer_email: z.nullable(z.string()),
      customer_phone: z.string(),
    }),
    payment_gateway_details: z.object({
      gateway_name: z.string(),
      gateway_order_id: z.string(),
      gateway_payment_id: z.string(),
      gateway_status_code: z.nullable(z.string()),
      gateway_order_reference_id: z.string().or(z.literal("null")),
      gateway_settlement: z.string(),
      gateway_reference_name: z.nullable(z.string()),
    }),
    payment_offers: z.null(),
  }),
  event_time: z.string(),
  type: z.literal("PAYMENT_SUCCESS_WEBHOOK"), // more precise
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

type EventCategory =
  | "MUSIC"
  | "SPORTS"
  | "COMEDY"
  | "TECH"
  | "EDUCATION"
  | "WORKSHOP"
  | "PREMIERE";

type SeatType =
  | "REGULAR"
  | "PREMIUM"
  | "RECLINER"
  | "VIP"
  | "COUPLE"
  | "BALCONY"
  | "SOFA"
  | "LUXURY";

type BookingStatus =
  | "SUCCESS"
  | "FAILED"
  | "PENDING"
  | "EXPIRED"
  | "CANCELLED"
  | "COMPLETED";

type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface IUserInfo {
  id: string;
  phoneNumber: string;
  name: string;
  verified: boolean;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  categoryPreference: string | null;
  upcomingEvents: IBooking[];
  recentBookings: IBooking[];
}

export type IEditUserInfo = Pick<
  IUserInfo,
  "name" | "phoneNumber" | "categoryPreference"
>;

export interface IBooking {
  id: string;
  eventId: string;
  bookedSeats: IBookedSeat[];
  status: BookingStatus;
  userId: string;
  amount: number;
  createdAt: Date;
  event?: IEvent;
  payment: IPayment;
}

export interface IPayment {
  id: string;
  userId: string;
  bookingId: string;
  createdAt: Date;
  updatedAt: Date;
  status: PaymentStatus;
  eventId: string;
}

export interface IBookedSeat {
  id: string;
  seatId: string;
  bookingId: string;
}

export interface ICity {
  id: string;
  name: string;
  state: string;
  country: string;
  events?: IEvent[];
}

export interface ISeat {
  id: string;
  price: number;
  type: SeatType;
  seatNumber: number;
  lockedUntil?: Date;
  eventId: string;
  bookedSeat?: IBookedSeat;
}

export interface IEvent {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  venue: string;
  cityId?: string;
  city?: ICity;
  category: EventCategory;
  bookings: IBooking[];
  payments: IPayment[];
  seats?: ISeat[];
  isFeatured: boolean;
  isPremiere: boolean;
  views: number;
  description: string;
  bannerImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  adminId: string;
  minPrice: number;
}
