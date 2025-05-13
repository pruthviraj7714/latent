import axios from "axios";

type FetchEventsParams = {
  page?: string;
  limit?: string;
  category?: string;
  days?: string[];
  cityNames?: string[];
  search?: string;
};

export const fetchEventDetails = async (eventId: string) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/event/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.event;
};

export const fetchEventsByCategory = async ({
  page = "1",
  limit = "8",
  category = "all",
  days = [],
  cityNames = [],
  search = "",
} : FetchEventsParams) => {
  const query = new URLSearchParams({
    category,
    page,
    limit,
    search,
  });

  if (cityNames.length > 0) {
    cityNames.forEach((name) => query.append("cityNames", name));
  }

  if (days.length > 0) {
    days.forEach((day) => query.append("days", day));
  }

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/category/by-category?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.data;
};

export const getFeaturedEvents = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/featured`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.events;
};

export const getPopularEvents = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/popular`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.events;
};

export const getRecommendedEvents = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/recommended`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.events;
};

export const getEventsByCategory = async (category: string) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/by-category?category=${category}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.events;
};

export const getPremiereEvents = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/premieres`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.events;
};

export const fetchEventsBySearch = async (searchQuery: string) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/search-event?search=${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.events;
};

export const addViewToEvent = async (eventId: string) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/events/${eventId}/view`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data.events;
};
