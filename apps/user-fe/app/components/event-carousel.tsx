"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  name: string;
  startTime: Date;
  venue: string;
  cityId: string;
  cityName: string;
  bannerImageUrl: string;
  description: string;
  minPrice: number;
}

export default function EventCarousel({ events }: { events: Event[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (events.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    if (events.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + events.length) % events.length
    );
  };

  useEffect(() => {
    if (events && events.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [events]);

  const formatDate = (date: string | Date) => {
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

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No upcoming events</div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden">
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px]">
        {events &&
          events.length > 0 &&
          events.map((event, index) => (
            <div
              key={event.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={event.bannerImageUrl || "/placeholder.svg"}
                alt={event.name}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
                <div className="max-w-3xl">
                  <Badge className="bg-red-600 mb-2">
                    {formatDate(event.startTime)}
                  </Badge>
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    {event.name}
                  </h2>
                  <p className="text-sm md:text-base mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-4 items-center">
                    <p className="text-sm md:text-base">
                      {event.venue} | {event.cityName}
                    </p>
                    <p className="font-semibold">Starts at ₹{event.minPrice}</p>
                    <Link href={`/events/${event.id}`}>
                      <Button className="bg-red-600 hover:bg-red-700">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-20 left-0 right-0 flex justify-center space-x-2">
        {events &&
          events.length > 0 &&
          events.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
      </div>
    </div>
  );
}
