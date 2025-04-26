import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  venue: z.string(),
  location: z.string(),
  description: z.string(),
  bannerImageUrl: z.string(),
  seats : z.any()
});

export const updateEventSchema = z.object({
  name: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  venue: z.string(),
  location: z.string(),
  description: z.string(),
  bannerImageUrl: z.string(),
  seats : z.any()
});

