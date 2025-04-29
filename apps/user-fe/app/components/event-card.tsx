import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IEvent } from "@repo/common/schema";

export default function EventCard({ event }: { event: IEvent }) {
  const formatDate = (date: string | Date) => {
    const parsedDate = new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(parsedDate);
  };

  const formatTime = (date: string | Date) => {
    const parsedDate = new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(parsedDate);
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48">
          <Image
            src={event.bannerImageUrl || "/placeholder.svg"}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{event.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
            <span>{formatDate(event.startTime)}</span>
            <Clock className="h-4 w-4 ml-2 mr-1 text-gray-400" />
            <span>{formatTime(event.startTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500">Starting from</div>
              {/* <div className="font-bold text-red-600">₹{event.minPrice}</div> */}
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              Book
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
