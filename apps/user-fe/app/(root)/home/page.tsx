"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowRight } from "lucide-react";
import EventCarousel from "app/components/event-carousel";
import EventCard from "app/components/event-card";
import MainLayout from "app/components/layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedEvents,
  getPremiereEvents,
  getRecommendedEvents,
} from "@/api/event";
import { IEvent } from "@repo/common/schema";
import { CATEGORIES } from "@/constants/constants";

export default function HomePage() {
  const {
    isPending: isFeaturedLoading,
    isError: isFeaturedError,
    data: featuredEvents,
    error: featuredError,
  } = useQuery({
    queryKey: ["featuredEvents"],
    queryFn: getFeaturedEvents,
  });

  const {
    isPending: isRecommendedLoading,
    isError: isRecommendedError,
    data: recommendedEvents,
    error: recommendedError,
  } = useQuery({
    queryKey: ["recommendedEvents"],
    queryFn: getRecommendedEvents,
  });

  const {
    isPending: isPremieredEventLoading,
    isError: isPremieredEventError,
    data: premieredEvents,
    error: premieredEventError,
  } = useQuery({
    queryKey: ["premieredEvents"],
    queryFn: getPremiereEvents,
  });

  const {
    isPending: isPopularEventLoading,
    isError: isPopularEventError,
    data: popularEvents,
    error: popularEventError,
  } = useQuery({
    queryKey: ["premieredEvents"],
    queryFn: getPremiereEvents,
  });

  console.log(premieredEvents);
  console.log(recommendedEvents);
  console.log(popularEvents);
  console.log(featuredEvents);

  return (
    <MainLayout>
      <div className=" px-4 py-6">
        <section className="mb-8">
          <Suspense
            fallback={
              <div className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
            }
          >
            <EventCarousel events={featuredEvents} />
          </Suspense>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What's on your mind?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Music", icon: "/images/categories/music.png" },
              { name: "Comedy", icon: "/images/categories/comedy.png" },
              { name: "Sports", icon: "/images/categories/sports.png" },
              { name: "Tech", icon: "/images/categories/tech.png" },
              { name: "Workshop", icon: "/images/categories/workshop.png" },
              { name: "Education", icon: "/images/categories/education.png" },
              { name: "Premiere", icon: "/images/categories/premiere.png" },
            ].map((category) => (
              <Link
                href={`/events?category=${category.name.toLowerCase()}`}
                key={category.name}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-50 mb-2 overflow-hidden">
                  <Image
                    src={category.icon || "/placeholder.svg"}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recommended Events</h2>
            <Link
              href="/events"
              className="text-red-600 flex items-center text-sm font-medium"
            >
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedEvents &&
              recommendedEvents.length > 0 &&
              recommendedEvents.map((event: IEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </section>

        <section className="mb-12">
          <Tabs defaultValue="music">
            <TabsList className="w-full justify-start overflow-x-auto mb-6">
              {CATEGORIES.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((category) => (
              <TabsContent
                key={category}
                value={category}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {isFeaturedLoading ? (
                    <p className="text-gray-500">Loading events...</p>
                  ) : (
                    <>
                      {featuredEvents &&
                      featuredEvents.filter(
                        (e: IEvent) => e.category === category.toUpperCase()
                      ).length > 0 ? (
                        featuredEvents
                          .filter(
                            (e: IEvent) => e.category === category.toUpperCase()
                          )
                          .map((event: IEvent) => (
                            <EventCard key={event.id} event={event} />
                          ))
                      ) : (
                        <p className="text-gray-500">
                          No events in this category.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="mb-12 bg-gray-900 py-8 px-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Premieres</h2>
              <p className="text-gray-400">Brand new releases every Friday</p>
            </div>
            <Link
              href="/events?category=premiere"
              className="text-red-400 flex items-center text-sm font-medium"
            >
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isPremieredEventLoading ? (
              <p className="text-gray-400">Loading premieres...</p>
            ) : premieredEvents && premieredEvents.length > 0 ? (
              premieredEvents.map((premiere: IEvent) => (
                <Card
                  key={premiere.id}
                  className="bg-gray-800 border-gray-700 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="relative h-64">
                      <Image
                        src={premiere.bannerImageUrl || "/placeholder.svg"}
                        alt={premiere.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <Badge className="bg-red-600 mb-2">Premiere</Badge>
                        <h3 className="text-white font-bold">
                          {premiere.name}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-400">No premiere events found.</p>
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Events</h2>
            <Link
              href="/events/popular"
              className="text-red-600 flex items-center text-sm font-medium"
            >
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isPopularEventLoading ? (
              <p className="text-gray-500">Loading popular events...</p>
            ) : popularEvents && popularEvents.length > 0 ? (
              popularEvents.map((event: IEvent) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <p className="text-gray-500">No popular events available.</p>
            )}
          </div>
        </section>

        <section className="mb-12 bg-red-600 rounded-lg py-12 px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-10">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-white  rounded-lg shadow hover:shadow-md transition w-72">
              <div className="text-red-600  text-5xl mb-4">🎟️</div>
              <h3 className="text-xl font-semibold text-gray-800  mb-2">
                Browse Events
              </h3>
              <p className="text-gray-800 ">
                Explore movies, concerts, and more in your city or online.
              </p>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-white " />

            <div className="text-center p-6 bg-white  rounded-lg shadow hover:shadow-md transition w-72">
              <div className="text-red-600 dark:text-red-400 text-5xl mb-4">
                🛒
              </div>
              <h3 className="text-xl font-semibold text-gray-800  mb-2">
                Book Tickets
              </h3>
              <p className="text-gray-800  ">
                Select your seats, confirm booking, and pay securely.
              </p>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-white " />

            <div className="text-center p-6 bg-white  rounded-lg shadow hover:shadow-md transition w-72">
              <div className="text-red-600  text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-800  mb-2">
                Enjoy the Show
              </h3>
              <p className="text-gray-800  ">
                Use your e-ticket and experience the event live!
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
