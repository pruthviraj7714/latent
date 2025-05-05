"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Edit, Calendar } from "lucide-react";
import MainLayout from "app/components/layouts/main-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserInfo, EditUserInfo } from "@/api/user";
import { CATEGORIES } from "@/constants/constants";
import { IEditUserInfo, IUserInfo } from "@repo/common/schema";
import { formatEventDateTime } from "@/lib/utils";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    isPending: loading,
    isError,
    data: user,
    error,
  } = useQuery<IUserInfo>({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<IEditUserInfo | null>(null);

  const { mutateAsync: updateUser, isPending: isEditing } = useMutation<
    any,
    Error,
    IEditUserInfo
  >({
    mutationFn: EditUserInfo,
    mutationKey: ["updatedInfo"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading || !user) {
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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-32 w-32 border-2 border-white shadow-md">
                <AvatarImage src={"/profile.png"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => {
                  setEditedUser({
                    name: user.name,
                    categoryPreference: user.categoryPreference,
                    phoneNumber: user.phoneNumber,
                  });
                  setIsEditOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p>{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Phone Number
                </p>
                <p>{user.phoneNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {user.upcomingEvents.slice(0, 2).map((booking) => (
                    <div key={booking.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            booking.event?.bannerImageUrl || "/placeholder.svg"
                          }
                          alt={booking.event?.name ?? "Event Name"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium truncate">
                          {booking.event?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {
                            formatEventDateTime(
                              booking.event?.startTime.toString()!
                            ).date
                          }{" "}
                          •{" "}
                          {
                            formatEventDateTime(
                              booking.event?.startTime.toString()!
                            ).time
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No upcoming events
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => router.push("/bookings")}
              >
                View All Bookings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Favorite Category
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge key={user.categoryPreference} variant="secondary">
                    {user.categoryPreference
                      ? user.categoryPreference?.charAt(0).toUpperCase() +
                        user.categoryPreference?.toLowerCase().slice(1)
                      : "Not Selected"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent bookings and activity on Latent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.recentBookings && user.recentBookings.length > 0 ? (
                user.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          booking.event?.bannerImageUrl || "/placeholder.svg"
                        }
                        alt={booking.event?.name ?? "Event"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{booking.event?.name}</p>
                          <p className="text-sm text-gray-500">
                            {
                              formatEventDateTime(
                                booking.event?.startTime.toString()!
                              ).date
                            }{" "}
                            • {booking.event?.venue},{" "}
                            {booking.event?.city?.name}
                          </p>
                        </div>
                        <Badge
                          className={
                            booking.status === "SUCCESS"
                              ? "bg-green-600"
                              : booking.status === "CANCELLED"
                                ? "bg-gray-500"
                                : "bg-blue-600"
                          }
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">
                        <span className="text-gray-500">Booked on:</span>{" "}
                        {formatEventDateTime(booking.createdAt.toString()).date}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-7 flex justify-center items-center">
                  <span className="text-md text-gray-500 font-semibold text-center">
                    No Recent Activity found
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => router.push("/bookings")}
            >
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and preferences.
            </DialogDescription>
          </DialogHeader>

          {editedUser && (
            <div className="py-4 space-y-6">
              <div className="flex flex-col gap-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedUser.name}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, name: e.target.value })
                  }
                />

                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editedUser.phoneNumber}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      phoneNumber: e.target.value,
                    })
                  }
                />

                <Label>Favorite Category</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={
                        editedUser.categoryPreference === category.toUpperCase()
                          ? "default"
                          : "outline"
                      }
                      className={
                        editedUser.categoryPreference === category.toUpperCase()
                          ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                          : "hover:bg-red-100 cursor-pointer"
                      }
                      onClick={() => {
                        setEditedUser({
                          ...editedUser,
                          categoryPreference: category.toUpperCase(),
                        });
                      }}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={async () => {
                if (editedUser) {
                  await updateUser(editedUser);
                  setIsEditOpen(false);
                }
              }}
              disabled={isEditing}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
