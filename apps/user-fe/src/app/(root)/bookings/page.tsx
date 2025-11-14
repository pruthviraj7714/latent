"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isAfter, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  Share2,
  Search,
  Filter,
  Ticket,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import MainLayout from "@/app/components/layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { fetchBookings } from "@/api/booking";
import type { IBooking } from "@repo/common";
import { formatEventDateTime } from "@/lib/utils";
import { toast } from "sonner";

type IStatus = "upcoming" | "today" | "past";

const STATUS = ["upcoming", "today", "past"];

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [status, setStatus] = useState<IStatus | string>("");
  const [sortBy, setSortBy] = useState<string>("bookingDate");
  const [order, setOrder] = useState<string>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const router = useRouter();

  const { data, isPending: isLoading } = useQuery({
    queryKey: [
      "bookings",
      currentPage,
      sortBy,
      order,
      searchQuery,
      filterCategory,
      status,
    ],
    queryFn: () =>
      fetchBookings({
        page: currentPage.toString(),
        limit: "5",
        category: filterCategory,
        status: status,
        sortBy,
        order,
        search: searchQuery,
      }),
  });

  const handleDownloadTickets = async (booking: IBooking) => {
    toast.info("Preparing Ticket", {
      description: `Generating ticket for ${booking.event?.name}...`,
    });
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); 
  
      const ticketContent = `This is a simulated ticket for event: ${booking.event?.name || "Unknown Event"}`;
      const blob = new Blob([ticketContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = `${booking.event?.name || "event"}-ticket.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  
      toast.success("Download Started", {
        description: `Simulated ticket for ${booking.event?.name} is downloading.`,
      });
    } catch (error) {
      console.error("Ticket download error:", error);
      toast.error("Download Failed", {
        description: "Something went wrong while simulating the ticket download.",
      });
    }
  };
  

  const handleShareBooking = async (booking: IBooking) => {
    const shareData = {
      title: `Booking for ${booking.event?.name}`,
      text: `Here are my booking details for ${booking.event?.name}.`,
      url: `${window.location.origin}/bookings/${booking.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share error:", err);
        toast.error("Sharing Failed", {
          description: "Something went wrong while trying to share.",
        });
      }
    } else {
      toast.error("Sharing Not Supported", {
        description: "Your browser does not support native sharing.",
      });
    }
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-");
    setSortBy(field!);
    setOrder(direction!);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Ticket className="mr-3 h-7 w-7 text-red-600" />
              My Bookings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all your bookings in one place
            </p>
          </div>
          <Button
            onClick={() => router.push("/home")}
            className="bg-red-600 hover:bg-red-700"
          >
            Explore More Events
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="all" onClick={() => setFilterCategory("all")}>
                All Bookings ({data.total})
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                onClick={() => setStatus("upcoming")}
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" onClick={() => setStatus("past")}>
                Past
              </TabsTrigger>
              <TabsTrigger value="today" onClick={() => setStatus("today")}>
                Today
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-10 w-full md:w-[250px]"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={selectedFilter}
                  onValueChange={(value) => {
                    setSelectedFilter(value);

                    if (STATUS.includes(value)) {
                      setStatus(value);
                      setFilterCategory("all");
                    } else {
                      setFilterCategory(value);
                      setStatus("");
                    }
                  }}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="upcoming">Upcoming Events</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                    <SelectItem value="today">Today's Events</SelectItem>
                    <SelectItem value="premiere">Movies</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="concert">Concerts</SelectItem>
                    <SelectItem value="movies">Movies</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={`${sortBy}-${order}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eventDate-desc">
                      Event Date (Newest)
                    </SelectItem>
                    <SelectItem value="eventDate-asc">
                      Event Date (Oldest)
                    </SelectItem>
                    <SelectItem value="bookingDate-desc">
                      Booking Date (Newest)
                    </SelectItem>
                    <SelectItem value="bookingDate-asc">
                      Booking Date (Oldest)
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price (High to Low)
                    </SelectItem>
                    <SelectItem value="price-asc">
                      Price (Low to High)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-6">
            {renderBookingsList()}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {renderBookingsList()}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {renderBookingsList()}
          </TabsContent>

          <TabsContent value="today" className="space-y-6">
            {renderBookingsList()}
          </TabsContent>
        </Tabs>

        <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedBooking && (
              <>
                <DialogHeader>
                  <DialogTitle>Booking Details</DialogTitle>
                  <DialogDescription>
                    Booking ID: {selectedBooking.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative h-40 w-full md:w-40 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          selectedBooking.event?.bannerImageUrl ||
                          "/placeholder.svg"
                        }
                        alt={selectedBooking.event?.name || "Event"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold">
                        {selectedBooking.event?.name}
                      </h3>

                      <div className="flex items-center text-gray-500 mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {
                            formatEventDateTime(
                              selectedBooking.event?.startTime.toString()!
                            ).date
                          }
                        </span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {
                            formatEventDateTime(
                              selectedBooking.event?.startTime.toString()!
                            ).time
                          }
                        </span>
                      </div>

                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {selectedBooking.event?.venue},{" "}
                          {selectedBooking.event?.city?.name}
                        </span>
                      </div>

                      <div className="mt-3">
                        <Badge
                          className={
                            selectedBooking.status === "SUCCESS"
                              ? "bg-green-600"
                              : "bg-blue-600"
                          }
                        >
                          {selectedBooking.status.charAt(0).toUpperCase() +
                            selectedBooking.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Ticket Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Number of Tickets
                          </p>
                          <p className="font-medium">
                            {selectedBooking.bookedSeats.length} tickets
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Payment Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="font-medium">
                            ₹{selectedBooking.amount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Booking Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Booking Date</p>
                          <p className="font-medium">
                            {formatEventDateTime(
                              selectedBooking.createdAt.toString()
                            ).date +
                              " " +
                              formatEventDateTime(
                                selectedBooking.createdAt.toString()
                              ).time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Booking ID</p>
                          <p className="font-medium">{selectedBooking.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <div className="flex flex-wrap gap-2 w-full justify-end">
                    {selectedBooking.status === "SUCCESS" &&
                      isAfter(
                        new Date(selectedBooking.event?.startTime!),
                        new Date()
                      ) && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleDownloadTickets(selectedBooking)
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Tickets
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareBooking(selectedBooking)}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </>
                      )}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );

  function renderBookingsList() {
    if (data.bookings.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="mb-4">
            <Ticket className="h-16 w-16 mx-auto text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "No bookings match your search criteria."
              : filterCategory === "upcoming"
                ? "You don't have any upcoming bookings."
                : filterCategory === "past"
                  ? "You don't have any past bookings."
                  : filterCategory === "today"
                    ? "You don't have any bookings for today."
                    : "You don't have any bookings yet."}
          </p>
          <Button onClick={() => router.push("/home")}>Explore Events</Button>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {data.bookings.map((booking: IBooking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-48 md:h-auto md:w-48 md:flex-shrink-0">
                    <Image
                      src={booking.event?.bannerImageUrl || "/placeholder.svg"}
                      alt={booking.event?.name ?? "Event"}
                      fill
                      className={`object-cover`}
                    />
                  </div>

                  <div className="p-6 flex-grow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          {booking.event?.name}
                        </h3>
                        <div className="flex items-center text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {
                              formatEventDateTime(
                                booking.event?.startTime.toString()!
                              ).date
                            }
                          </span>
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {
                              formatEventDateTime(
                                booking.event?.startTime.toString()!
                              ).time
                            }
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {booking.event?.venue}, {booking.event?.city?.name}
                          </span>
                        </div>
                      </div>

                      <Badge
                        className={
                          booking.status === "SUCCESS"
                            ? "bg-green-600"
                            : "bg-blue-600"
                        }
                      >
                        {booking.status === "SUCCESS" &&
                        isAfter(new Date(booking.createdAt), new Date())
                          ? "Upcoming"
                          : booking.status === "SUCCESS" &&
                              isBefore(new Date(booking.createdAt), new Date())
                            ? "Confirmed"
                            : booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Tickets</p>
                        <p className="font-medium">
                          {booking.bookedSeats.length} tickets
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium">₹{booking.amount}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">
                          Booking ID: {booking.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsViewingDetails(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Math.ceil(data.total / data.limit) > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Previous</span>
              </Button>

              <div className="text-sm">
                Page {currentPage} of {Math.ceil(data.total / data.limit)}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(data.total / data.limit))
                  )
                }
                disabled={currentPage === Math.ceil(data.total / data.limit)}
              >
                <span className="sr-only md:not-sr-only md:mr-2">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }
}
