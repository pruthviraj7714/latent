"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { TicketCard } from "app/components/ticket-card";
import { fetchEventDetails } from "@/api/event";
import { useQuery } from "@tanstack/react-query";
import { IEvent } from "@repo/common/schema";
import { formatDate, formatEventDateTime } from "@/lib/utils";

interface TicketSelection {
  [key: string]: number;
}

export default function EventPage({ eventId }: { eventId: string }) {
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection>({});

  const {
    isPending: isEventLoading,
    isError: isEventError,
    data: event,
    error: eventError,
  } = useQuery<IEvent>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId),
  });

  if (!event) {
    return;
  }

  const ticketTypes = [
    { name: "VIP", price: 2000, available: 50 },
    { name: "Premium", price: 1500, available: 100 },
    { name: "Standard", price: 1000, available: 200 },
  ];

  const totalAmount = Object.entries(selectedTickets).reduce(
    (acc, [type, count]) => {
      const ticket = ticketTypes.find((t) => t.name === type);
      return acc + (ticket?.price || 0) * count;
    },
    0
  );

  const hasSelectedTickets = Object.values(selectedTickets).some(
    (count) => count > 0
  );

  return (
    <main className="min-h-screen max-w-7xl mx-auto flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8 px-4 lg:px-6 ">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src={event?.bannerImageUrl || "/placeholder.svg"}
              alt={event?.name!}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold text-neutral-50 mb-4">
              {event.name}
            </h1>
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="px-3 py-1 rounded-full text-white bg-red-500 border border-neutral-800">
                  {event.category}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-neutral-500 mb-1">Date</h3>
                <p className="text-lg">
                  {formatEventDateTime(event.startTime.toString()).date}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-neutral-500 mb-1">Time</h3>
                <p className="text-lg">
                  {formatEventDateTime(event.startTime.toString()).time}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-neutral-500 mb-1">Venue</h3>
              <p className="text-lg">{event.venue}</p>
              <p className="text-neutral-500">{event.city?.name + ", " + event.city?.state}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-4">
            <h3 className="text-sm text-neutral-500">Available Tickets</h3>
            <div className="space-y-3">
              {ticketTypes.map((ticket) => (
                <TicketCard
                  key={ticket.name}
                  name={ticket.name}
                  price={ticket.price}
                  available={ticket.available}
                  benefits={
                    ticket.name === "VIP"
                      ? "Priority Entry + Lounge Access"
                      : ticket.name === "Premium"
                        ? "Priority Entry"
                        : "Standard Entry"
                  }
                  selected={selectedTickets[ticket.name] || 0}
                  onSelect={(count) =>
                    setSelectedTickets((prev) => ({
                      ...prev,
                      [ticket.name]: count,
                    }))
                  }
                  showQuantityControls
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-800 p-6 space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            {Object.entries(selectedTickets).map(([type, count]) => {
              if (count === 0) return null;
              const ticket = ticketTypes.find((t) => t.name === type);
              const amount = (ticket?.price || 0) * count;
              return (
                <div key={type} className="flex justify-between text-sm">
                  <span>
                    {type} x {count}
                  </span>
                  <span>₹{amount.toLocaleString()}</span>
                </div>
              );
            })}

            {!hasSelectedTickets && (
              <div className="text-sm text-neutral-500">
                No tickets selected
              </div>
            )}

            <div className="border-t border-neutral-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">CGST (9%)</span>
                <span>₹{Math.round(totalAmount * 0.09).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">SGST (9%)</span>
                <span>₹{Math.round(totalAmount * 0.09).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Convenience Fee</span>
                <span>₹{(hasSelectedTickets ? 50 : 0).toLocaleString()}</span>
              </div>
              <div className="border-t border-neutral-800 pt-4 flex justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="font-medium text-bms-red">
                  ₹
                  {(
                    totalAmount +
                    Math.round(totalAmount * 0.18) +
                    (hasSelectedTickets ? 50 : 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-4">
            {hasSelectedTickets && (
              <Button
                className="py-6 text-md"
                variant="outline"
                onClick={() => setSelectedTickets({})}
              >
                Clear Selection
              </Button>
            )}
            <Button
              className="py-6 text-md"
              variant="default"
              disabled={!hasSelectedTickets}
            >
              {hasSelectedTickets ? "Proceed to Payment" : "Select Tickets"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
