"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback } from "react";
import { TicketCard } from "@/app/components/ticket-card";
import { addViewToEvent, fetchEventDetails } from "@/api/event";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IEvent, ISeat } from "@repo/common/types";
import { formatEventDateTime } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { getCashfreeInstance } from "@/lib/cashfree";
import { CONVENIENCE_FEE, GST } from "@/constants/constants";
import { fetchSeatAvailability } from "@/api/booking";

interface SelectedSeat {
  id: string;
  price: number;
  type: string;
}

export default function EventPage({ eventId }: { eventId: string }) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const queryClient = useQueryClient();

  const {
    isPending: isEventLoading,
    isError: isEventError,
    data: event,
    error: eventError,
  } = useQuery<IEvent>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId),
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const { mutateAsync: addView } = useMutation<IEvent>({
    mutationKey: ["addViewToEvent", eventId],
    mutationFn: () => addViewToEvent(eventId),
  });

  const checkSeatAvailability = useMutation({
    mutationFn: fetchSeatAvailability,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      addView().catch((err) => toast.error("Failed to add view", err));
    }
  }, [addView]);

  const verifySeatsAvailability = useCallback(async () => {
    if (selectedSeats.length === 0) return true;

    try {
      const seatIds = selectedSeats.map((seat) => seat.id);
      const result = await checkSeatAvailability.mutateAsync({
        eventId,
        seatIds,
      });

      if (!result.available) {
        await queryClient.invalidateQueries({
          queryKey: ["event", eventId],
        });

        toast.error(
          "Some selected seats are no longer available. Please select again."
        );
        setSelectedSeats([]);
        return false;
      }
      return true;
    } catch (error: any) {
      toast.error("Failed to verify seat availability");
      return false;
    }
  }, [selectedSeats, checkSeatAvailability, queryClient, eventId]);

  const handleProceedToPayment = async () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      const seatsAvailable = await verifySeatsAvailability();
      if (!seatsAvailable) {
        setIsProcessingPayment(false);
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/booking/book-tickets`,
        {
          eventId,
          seats: selectedSeats,
          amount: finalAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Redirecting to Booking page", { position: "top-center" });

      const {
        bookingId,
        userId,
        eventId: responseEventId,
        amount,
      } = response.data;
      const res2 = await axios.post("/api/payments/initiate-payment", {
        bookingId,
        userId,
        eventId: responseEventId,
        amount,
      });

      const data = res2.data;
      let checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self",
      };

      queryClient.invalidateQueries({
        queryKey: ["event", eventId],
      });

      getCashfreeInstance.checkout(checkoutOptions);
    } catch (error: any) {
      console.error("Error during booking/payment", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong during booking or payment"
      );

      queryClient.invalidateQueries({
        queryKey: ["event", eventId],
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const ticketTypesMap = new Map();
  const availableSeatsMap = new Map();

  if (event?.seats) {
    for (const seat of event.seats) {
      const key = `${seat.type}_${seat.price}`;

      if (!seat.bookedSeat) {
        if (!availableSeatsMap.has(key)) {
          availableSeatsMap.set(key, []);
        }
        availableSeatsMap.get(key).push({
          id: seat.id,
          price: seat.price,
          type: seat.type,
        });
      }

      if (ticketTypesMap.has(key)) {
        if (!seat.bookedSeat) {
          ticketTypesMap.get(key).available++;
        }
      } else {
        ticketTypesMap.set(key, {
          name: seat.type,
          price: seat.price,
          available: seat.bookedSeat ? 0 : 1,
        });
      }
    }
  }
  useEffect(() => {
    if (event && selectedSeats.length > 0) {
      const availableSeatIds = new Set(
        event.seats
          ?.filter((seat: ISeat) => !seat.bookedSeat)
          .map((seat: ISeat) => seat.id)
      );

      const updatedSelectedSeats = selectedSeats.filter((seat) =>
        availableSeatIds.has(seat.id)
      );

      if (updatedSelectedSeats.length !== selectedSeats.length) {
        toast.warning("Some of your selected seats are no longer available");
        setSelectedSeats(updatedSelectedSeats);
      }
    }
  }, [event, selectedSeats]);

  const ticketTypes = Array.from(ticketTypesMap.values());

  const selectedTicketsCount = selectedSeats.reduce(
    (acc, seat) => {
      if (!acc[seat.type]) {
        acc[seat.type] = 0;
      }
      acc[seat.type]!++;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleTicketSelection = (
    type: string,
    price: number,
    count: number
  ) => {
    const currentCount = selectedTicketsCount[type] || 0;
    const key = `${type}_${price}`;
    const availableSeats = availableSeatsMap.get(key) || [];

    if (count > currentCount) {
      const seatsToAdd = count - currentCount;
      const newSelectedSeats = [...selectedSeats];

      const selectedSeatIds = new Set(selectedSeats.map((seat) => seat.id));

      const availableUnselectedSeats = availableSeats.filter(
        (seat: SelectedSeat) => !selectedSeatIds.has(seat.id)
      );

      if (availableUnselectedSeats.length < seatsToAdd) {
        toast.error(
          `Only ${availableUnselectedSeats.length} ${type} seats available`
        );
        return;
      }

      for (let i = 0; i < seatsToAdd; i++) {
        newSelectedSeats.push(availableUnselectedSeats[i]);
      }

      setSelectedSeats(newSelectedSeats);
    } else if (count < currentCount) {
      const seatsToRemove = currentCount - count;
      const newSelectedSeats = [...selectedSeats];

      const seatsOfType = newSelectedSeats
        .map((seat, index) => ({ seat, index }))
        .filter((item) => item.seat.type === type);

      const indexesToRemove = seatsOfType
        .slice(-seatsToRemove)
        .map((item) => item.index)
        .sort((a, b) => b - a);

      for (const index of indexesToRemove) {
        newSelectedSeats.splice(index, 1);
      }

      setSelectedSeats(newSelectedSeats);
    }
  };

  const hasSelectedTickets = selectedSeats.length > 0;

  const totalAmount = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
  const gstAmount = Math.round(totalAmount * GST);
  const convenienceFee = hasSelectedTickets ? CONVENIENCE_FEE : 0;
  const finalAmount = totalAmount + gstAmount + convenienceFee;

  if (isEventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (isEventError || !event || !event.seats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">
            Something went wrong
          </h2>
          <p className="mt-2 text-neutral-400">Unable to load event details</p>
          <Button
            className="mt-4"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["event", eventId] })
            }
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-4xl font-bold mb-4">
              {event.name}
            </h1>
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="px-3 py-1 rounded-full text-sm text-white bg-red-500 border border-neutral-800">
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
              <p className="text-neutral-500">
                {event.city?.name + ", " + event.city?.state}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-neutral-500">Available Tickets</h3>
              {isEventLoading && (
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  Updating...
                </span>
              )}
            </div>
            <div className="space-y-3">
              {ticketTypes.map((ticket) => (
                <TicketCard
                  key={`${ticket.name}_${ticket.price}`}
                  name={ticket.name}
                  price={ticket.price}
                  available={ticket.available}
                  selected={selectedTicketsCount[ticket.name] || 0}
                  onSelect={(count) =>
                    handleTicketSelection(ticket.name, ticket.price, count)
                  }
                  showQuantityControls
                />
              ))}

              {ticketTypes.length === 0 && (
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 text-center">
                  <p className="text-neutral-400">No tickets available</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-800 p-6 space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            {Object.entries(selectedTicketsCount).map(([type, count]) => {
              if (count === 0) return null;
              const ticket = ticketTypes.find((t) => t.name === type);
              const amount = selectedSeats
                .filter((seat) => seat.type === type)
                .reduce((sum, seat) => sum + seat.price, 0);

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
                <span>
                  ₹{Math.round((totalAmount * GST) / 2).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">SGST (9%)</span>
                <span>
                  ₹{Math.round((totalAmount * GST) / 2).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Convenience Fee</span>
                <span>
                  ₹{(hasSelectedTickets ? CONVENIENCE_FEE : 0).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-neutral-800 pt-4 flex justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="font-medium text-bms-red">
                  ₹{finalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-4">
            {hasSelectedTickets && (
              <Button
                className="py-6 text-md"
                variant="outline"
                onClick={() => setSelectedSeats([])}
                disabled={isProcessingPayment}
              >
                Clear Selection
              </Button>
            )}
            <Button
              className={`py-6 text-md cursor-pointer ${hasSelectedTickets ? "bg-red-500 hover:bg-red-600" : ""}`}
              disabled={!hasSelectedTickets || isProcessingPayment}
              onClick={handleProceedToPayment}
            >
              {isProcessingPayment ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : hasSelectedTickets ? (
                "Proceed to Payment"
              ) : (
                "Select Tickets"
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
