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
