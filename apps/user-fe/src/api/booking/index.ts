import axios from "axios";

export const fetchSeatAvailability = async ({
  eventId,
  seatIds,
}: {
  eventId: string;
  seatIds: string[];
}): Promise<any> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/booking/check-seat-availability`,
    {
      eventId,
      seatIds,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

export const fetchBookings = async ({
  page = "1",
  limit = "5",
  category = "",
  status = "",
  sortBy = "eventDate",
  order = "desc",
  search = "",
}: {
  page: string;
  limit: string;
  category: string;
  status: string;
  sortBy: string;
  order: string;
  search: string;
}): Promise<any> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/booking/all`,
      {
        params: {
          page,
          limit,
          category,
          status,
          sortBy,
          order,
          search,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch bookings:", error);
    throw error?.response?.data || { message: "Unknown error occurred" };
  }
};
