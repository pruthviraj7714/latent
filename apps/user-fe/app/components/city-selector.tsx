"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAllCities, getTopCities } from "@/api/city";
import { ICity } from "@repo/common/schema";

export default function CitySelector() {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isPending: isCitiesLoading,
    isError: isCitiesError,
    data: cities,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: getAllCities,
  });

  const {
    isPending: isTopCitiesLoading,
    isError: isTopCitiesError,
    data: topcities,
    error: topcitiesError,
  } = useQuery({
    queryKey: ["top-cities"],
    queryFn: getTopCities,
  });

  const filteredCities = cities && cities.lenght > 0 && cities.filter(
    (city : ICity) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    // In a real app, you might want to store this in localStorage or context
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-white hover:bg-red-700">
          <MapPin className="h-5 w-5 mr-2" />
          {selectedCity}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select your city</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search for your city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {searchQuery === "" && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Popular Cities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {topcities && topcities.length > 0 && topcities.map((city : ICity) => (
                  <Button
                    key={city.id}
                    variant="outline"
                    className={`justify-start ${selectedCity === city.name ? "border-red-600 text-red-600" : ""}`}
                    onClick={() => handleSelectCity(city.name)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {city.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              {searchQuery === "" ? "All Cities" : "Search Results"}
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredCities && filteredCities.length > 0 ? (
                filteredCities.map((city : ICity) => (
                  <Button
                    key={city.id}
                    variant="ghost"
                    className={`w-full justify-start ${selectedCity === city.name ? "text-red-600" : ""}`}
                    onClick={() => handleSelectCity(city.name)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <div className="flex flex-col items-start">
                      <span>{city.name}</span>
                      <span className="text-xs text-gray-500">
                        {city.state}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No cities found
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
