"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ArrowRight,
  Bell,
  Ticket,
  Calendar,
  Users,
  Mail,
  CheckCircle,
  Star,
} from "lucide-react";
import EventCarousel from "@/app/components/event-carousel";
import EventCard from "@/app/components/event-card";
import MainLayout from "@/app/components/layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedEvents,
  getPremiereEvents,
  getRecommendedEvents,
} from "@/api/event";
import type { IEvent } from "@repo/common/types";
import { CATEGORIES, TESTIMONIALS } from "@/constants/constants";
import TicketLoader from "@/app/components/TicketLoader";
import { toast } from "sonner";

export default function HomePage() {
  const [email, setEmail] = useState("");
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

  const renderStars = (count: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ));
  };

  const handleSubscribe = (e: any) => {
    e.preventDefault();
    toast.info(`Thank you for subscribing with ${email}!`, {
      position: "top-center",
    });
    setEmail("");
  };

  if (
    isFeaturedLoading ||
    isPopularEventLoading ||
    isPremieredEventLoading ||
    isRecommendedLoading
  ) {
    return (
      <div className="min-h-screen">
        <TicketLoader />;
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="">
        <section className="mb-8">
          <Suspense
            fallback={
              <div className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
            }
          >
            <EventCarousel events={featuredEvents} />
          </Suspense>
        </section>

        <section className="mb-12 px-4 py-6">
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

        <section className="mb-12 px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recommended Events</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedEvents &&
              recommendedEvents.length > 0 &&
              recommendedEvents.map((event: IEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </section>

        <section className="mb-12 px-4 py-6">
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
                        <div className="col-span-full flex justify-center items-center py-16">
                          <p className="text-gray-500 text-center">
                            No events found in this category.
                          </p>
                        </div>
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

        <section className="mb-12 px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Events</h2>
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

        <section className="bg-red-600 py-16 w-full">
          <h2 className="text-3xl font-bold text-center text-white mb-10">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
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

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="w-full lg:w-1/2">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2">
                    What Our Users Say
                  </h2>
                  <p className="text-gray-600">
                    Discover why thousands of event-goers choose our platform
                  </p>
                </div>

                <div className="space-y-6">
                  {TESTIMONIALS.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="bg-white rounded-lg p-6 shadow-md"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600">
                            {testimonial.role}
                          </p>
                        </div>
                        <div className="ml-auto flex">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700">"{testimonial.text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-2/5">
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-8 text-white">
                  <h2 className="text-3xl font-bold mb-4">
                    Never Miss an Event
                  </h2>
                  <p className="mb-6">
                    Sign up for personalized event alerts and be the first to
                    know about new releases and exclusive offers
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start">
                      <Bell className="w-5 h-5 mr-2 mt-1 text-white" />
                      <div>
                        <h4 className="font-bold">Event Alerts</h4>
                        <p className="text-sm text-red-100">
                          Get notified about new events
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Ticket className="w-5 h-5 mr-2 mt-1 text-white" />
                      <div>
                        <h4 className="font-bold">Presale Access</h4>
                        <p className="text-sm text-red-100">
                          Buy tickets before anyone else
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 mr-2 mt-1 text-white" />
                      <div>
                        <h4 className="font-bold">Weekly Digest</h4>
                        <p className="text-sm text-red-100">
                          Curated events in your area
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="w-5 h-5 mr-2 mt-1 text-white" />
                      <div>
                        <h4 className="font-bold">Group Discounts</h4>
                        <p className="text-sm text-red-100">
                          Special offers for friends
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubscribe} className="mt-6">
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2 text-white"
                      >
                        Email Address
                      </label>
                      <div className="flex">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-grow rounded-l-lg px-4 py-3 text-white focus:outline-none"
                          placeholder="your@email.com"
                          required
                        />
                        <button
                          type="submit"
                          className="bg-white text-red-500 px-6 py-3 rounded-r-lg hover:bg-red-500 hover:text-white transition font-medium"
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-white" />
                      <p className="text-sm text-red-100">
                        We respect your privacy and will never share your
                        information.
                      </p>
                    </div>
                  </form>

                  <div className="mt-8 p-4 bg-red-700 bg-opacity-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="w-10 h-10 mr-4 text-white" />
                      <div>
                        <h4 className="font-bold text-lg">Refer a Friend</h4>
                        <p className="text-sm text-red-100">
                          Share the platform with friends and both get $10 off
                          your next booking!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
