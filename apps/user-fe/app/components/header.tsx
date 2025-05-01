"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Ticket,
  Heart,
  Bell,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CitySelector from "./city-selector";
import { useQuery } from "@tanstack/react-query";
import { IEvent } from "@repo/common/schema";
import { fetchEventsBySearch } from "@/api/event";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    phoneNumber: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest(".search-item")) return;
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const {
    isPending: isEventsLoading,
    isError: isEventsError,
    data: events,
    error: eventsError,
  } = useQuery<IEvent[]>({
    queryKey: ["events", debouncedSearchQuery],
    queryFn: () => fetchEventsBySearch(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 2 && isSearchOpen,
    staleTime: 5 * 60 * 1000,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 2) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleSearchItemClick = (eventId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/events/${eventId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="bg-red-600">
        <div className="mx-auto px-4 py-2 flex justify-between items-center">
          <Link href="/home" className="flex items-center">
            <div className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-amber-400" />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-white">Latent</span>
                <span className="text-white/80">Booking</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-100 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search for events, plays, sports and activities"
                className="pl-10 bg-white text-white placeholder:text-red-200 border-none focus-visible:ring-1 focus-visible:ring-red-500"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchQuery.length > 2) setIsSearchOpen(true);
                }}
              />
              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg z-10 max-h-[300px] overflow-y-auto border border-gray-200">
                  {isEventsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 text-red-500 animate-spin mr-2" />
                      <span>Searching...</span>
                    </div>
                  ) : isEventsError ? (
                    <div className="p-4 text-center text-red-500">
                      Something went wrong. Please try again.
                    </div>
                  ) : events && events.length > 0 ? (
                    <div>
                      {events.map((event: IEvent) => (
                        <div
                          key={event.id}
                          className="search-item flex items-center justify-between p-3 hover:bg-gray-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSearchItemClick(event.id);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={event.bannerImageUrl}
                              className="h-10 w-10 rounded-md object-cover"
                              alt={event.name}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">
                                {event.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(event.startTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500">
                              Starts From
                            </span>
                            <span className="font-medium text-red-500">
                              ₹{event.minPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : debouncedSearchQuery ? (
                    <div className="p-4 text-center text-gray-600">
                      No events found for "{debouncedSearchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <CitySelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-red-700"
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">
                      {user.name.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Ticket className="h-4 w-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="text-white hover:bg-red-700"
                onClick={() => router.push("/")}
              >
                Sign In
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-red-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      <div className="md:hidden px-4 py-2 bg-white">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search events, plays, sports..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.length > 2) setIsSearchOpen(true);
            }}
          />
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white shadow-lg z-10 max-h-[400px] overflow-y-auto border border-gray-200 rounded-md">
              {isEventsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 text-red-500 animate-spin mr-2" />
                  <span>Searching...</span>
                </div>
              ) : isEventsError ? (
                <div className="p-4 text-center text-red-500">
                  Something went wrong. Please try again.
                </div>
              ) : events && events.length > 0 ? (
                <div>
                  {events.map((event: IEvent) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSearchItemClick(event.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={event.bannerImageUrl}
                          className="h-10 w-10 rounded-md object-cover"
                          alt={event.name}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {event.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.startTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">From</span>
                        <span className="font-medium text-red-500">
                          ₹{event.minPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : debouncedSearchQuery ? (
                <div className="p-4 text-center text-gray-600">
                  No events found for "{debouncedSearchQuery}"
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto space-x-6 py-3 text-sm font-medium hide-scrollbar">
            <li>
              <Link
                href="/events?category=all"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                All
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=premiere"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                Premiere
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=music"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                Music
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=education"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                Education
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=tech"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                Tech
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=comedy"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                Comedy
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=sports"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                Sports
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=workshop"
                className="text-gray-700 hover:text-red-600 whitespace-nowrap"
              >
                Workshop
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="py-2 px-4">
            <CitySelector />
          </div>
          <nav className="py-4">
            <ul className="space-y-2">
              {user ? (
                <>
                  <li className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <User className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link
                      href="/profile"
                      className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/bookings"
                      className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Ticket className="h-5 w-5" />
                      <span>My Bookings</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/wishlist"
                      className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Heart className="h-5 w-5" />
                      <span>Wishlist</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/notifications"
                      className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Bell className="h-5 w-5" />
                      <span>Notifications</span>
                    </Link>
                  </li>
                  <li className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Button
                    onClick={() => router.push("/")}
                    className="block w-full bg-red-600 hover:bg-red-700"
                  >
                    Sign In
                  </Button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
