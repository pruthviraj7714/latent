"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import EventCard from "app/components/event-card";
import MainLayout from "app/components/layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { fetchEventsByCategory } from "@/api/event";
import type { ICity, IEvent } from "@repo/common/types";
import { getAllCities } from "@/api/city";

const categoryMetadata = {
  music: {
    title: "Music",
    description: "Live performances, concerts, and music festivals",
    bannerImage: "/images/categories/music-banner.png",
    icon: "/images/categories/music.png",
  },
  sports: {
    title: "Sports",
    description: "Exciting sporting events and tournaments",
    bannerImage: "/images/categories/sports-banner.png",
    icon: "/images/categories/sports.png",
  },
  comedy: {
    title: "Comedy",
    description: "Stand-up comedy shows and humorous performances",
    bannerImage: "/images/categories/comedy-banner.png",
    icon: "/images/categories/comedy.png",
  },
  tech: {
    title: "Tech",
    description: "Technology events, expos, and innovation showcases",
    bannerImage: "/images/categories/tech-banner.png",
    icon: "/images/categories/tech.png",
  },
  education: {
    title: "Education",
    description: "Seminars, courses, and academic events",
    bannerImage: "/images/categories/education-banner.png",
    icon: "/images/categories/education.png",
  },
  workshop: {
    title: "Workshop",
    description: "Hands-on training sessions and skill-building events",
    bannerImage: "/images/categories/workshop-banner.png",
    icon: "/images/categories/workshop.png",
  },
  premiere: {
    title: "Premiere",
    description: "Exclusive first-time screenings and grand openings",
    bannerImage: "/images/categories/premiere-banner.png",
    icon: "/images/categories/premiere.png",
  },
};

export default function EventsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [category, setCategory] = useState(categoryParam || "all");
  const [sortBy, setSortBy] = useState("date");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSeatTypes, setSelectedSeatTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState("");

  const {
    isPending: isEventsLoading,
    isError: isEventsError,
    data,
    error: eventError,
  } = useQuery<any>({
    queryKey: [
      "events-category",
      categoryParam,
      currentPage,
      selectedCities,
      searchQuery,
      selectedDates,
    ],
    queryFn: () =>
      fetchEventsByCategory({
        category: categoryParam!,
        limit: "8",
        days: selectedDates,
        page: String(currentPage),
        search: searchQuery,
        cityNames: selectedCities,
      }),
  });

  const {
    isPending: isCitiesLoading,
    isError: isCitiesError,
    data: cities,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: getAllCities,
  });

  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);

  const currentCategory = categoryMetadata[
    category as keyof typeof categoryMetadata
  ] || {
    title: "All Events",
    description: "Discover amazing events happening near you",
    bannerImage: "/images/categories/all-events-banner.png",
  };

  const dateOptions = [
    "Today",
    "Tomorrow",
    "This Weekend",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleDateFilter = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleCityFilter = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const clearAllFilters = () => {
    setSelectedDates([]);
    setSelectedCities([]);
    setSelectedSeatTypes([]);
    setSearchQuery("");
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(inputValue);
    },500)

    return () => clearTimeout(timeout);
  }, [inputValue])

  const hasActiveFilters =
    selectedDates.length > 0 ||
    selectedCities.length > 0 ||
    selectedSeatTypes.length > 0 ||
    searchQuery !== "";

  if (isCitiesLoading || isEventsLoading) {
    return <div className="min-h-screen">Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <section className="mb-8 relative rounded-lg overflow-hidden">
          <div className="h-48 md:h-64 relative">
            <Image
              src={currentCategory.bannerImage || "/placeholder.svg"}
              alt={currentCategory.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="p-6 md:p-10 text-white max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {currentCategory.title}
                </h1>
                <p className="text-sm md:text-base">
                  {currentCategory.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Search events..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center w-full md:w-2/3 justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters{" "}
                    {hasActiveFilters && (
                      <Badge className="ml-1 bg-red-600">!</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[400px] overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your event search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 px-2">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="date">
                        <AccordionTrigger>Date</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2">
                            {dateOptions.map((date) => (
                              <div
                                key={date}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`date-${date}`}
                                  checked={selectedDates.includes(date)}
                                  onCheckedChange={() => handleDateFilter(date)}
                                />
                                <label
                                  htmlFor={`date-${date}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {date}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="city">
                        <AccordionTrigger>City</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {cities.map((city: ICity) => (
                              <div
                                key={city.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`city-${city.name}`}
                                  checked={selectedCities.includes(city.name)}
                                  onCheckedChange={() =>
                                    handleCityFilter(city.name)
                                  }
                                />
                                <label
                                  htmlFor={`city-${city.name}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {city.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <div className="mt-6 space-y-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearAllFilters}
                      >
                        Clear All Filters
                      </Button>
                      <SheetClose asChild>
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          Apply Filters
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date: Earliest First</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date{" "}
                      {selectedDates.length > 0 && `(${selectedDates.length})`}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Select Dates</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 px-2">
                      <div className="grid grid-cols-2 gap-2">
                        {dateOptions.map((date) => (
                          <div
                            key={date}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`date-desktop-${date}`}
                              checked={selectedDates.includes(date)}
                              onCheckedChange={() => handleDateFilter(date)}
                            />
                            <label
                              htmlFor={`date-desktop-${date}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {date}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      City{" "}
                      {selectedCities.length > 0 &&
                        `(${selectedCities.length})`}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Select Cities</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 px-2">
                      <div className="grid grid-cols-1 gap-2">
                        {cities.map((city: ICity) => (
                          <div
                            key={city.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`city-desktop-${city.name}`}
                              checked={selectedCities.includes(city.name)}
                              onCheckedChange={() =>
                                handleCityFilter(city.name)
                              }
                            />
                            <label
                              htmlFor={`city-desktop-${city.name}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {city.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 md:hidden">
          <Tabs defaultValue={category} onValueChange={setCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="concerts">Concerts</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="theatre">Theatre</TabsTrigger>
              <TabsTrigger value="comedy">Comedy</TabsTrigger>
              <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        {hasActiveFilters && (
          <section className="mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active Filters:</span>
              {selectedDates.map((date) => (
                <Badge
                  key={date}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {date}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleDateFilter(date)}
                  />
                </Badge>
              ))}
              {selectedCities.map((city) => (
                <Badge
                  key={city}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {city}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCityFilter(city)}
                  />
                </Badge>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPriceRange([0, 5000])}
                  />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
            </div>
          </section>
        )}

        <section className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {data.events && data.events.length}{" "}
              {data.events && data.events.length === 1 ? "Event" : "Events"}{" "}
              Found
            </h2>
          </div>
        </section>

        <section className="mb-12">
          {data.events && data.events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.events.map((event : IEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <Image
                  src="/images/no-results.png"
                  alt="No events found"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search criteria to find more
                events.
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </section>

        {Math.ceil(data.total / data.limit) > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="cursor-pointer"
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
                className="cursor-pointer"
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
      </div>
    </MainLayout>
  );
}
