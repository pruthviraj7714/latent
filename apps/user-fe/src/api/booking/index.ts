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
