import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) => {
  const parsedDate = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(parsedDate);
};

type DateTimeFormatOptions = {
  locale?: string;
  hour12?: boolean;
};

export function formatEventDateTime(
  isoString: string,
  options: DateTimeFormatOptions = { locale: "en-US", hour12: true }
) {
  const date = new Date(isoString);

  const formattedDate = date.toLocaleDateString(options.locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString(options.locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: options.hour12,
  });

  return { date: formattedDate, time: formattedTime };
}
