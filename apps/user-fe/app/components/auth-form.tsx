"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoIcon as Movie, Ticket, Phone } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/user/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setUserId(data.userId);
        setIsVerifying(true);
        toast.success("OTP Sent", {
          description: "Please check your phone for the OTP",
        });
      } else {
        toast.error("Error", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.success("Error", {
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setUserId(data.userId);
        setIsVerifying(true);
        toast.success("OTP Sent", {
          description: "Please check your phone for the OTP",
        });
      } else {
        toast.error("Error", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint =
        activeTab === "signin"
          ? `${BACKEND_URL}/api/v1/user/signin/verify`
          : `${BACKEND_URL}/api/v1/user/signup/verify`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success("Success", {
          description:
            activeTab === "signin"
              ? "Logged in successfully"
              : "Account created successfully",
        });

        router.push("/dashboard");
      } else {
        toast.error("Error", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to verify OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    const endpoint =
      activeTab === "signin" ? `${BACKEND_URL}/api/v1/user/signin` : `${BACKEND_URL}/api/v1/user/signup`;
    const body =
      activeTab === "signin" ? { phoneNumber } : { name, phoneNumber };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("OTP Sent", {
          description: "Please check your phone for the OTP",
        });
      } else {
        toast.error("Error", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.success("Error", {
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setIsVerifying(false);
    setOtp("");
  };

  if (isVerifying) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to your phone number
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={verifyOTP}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Enter OTP
              </Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                className="mt-1 block w-full text-center text-2xl tracking-widest"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-500"
              onClick={goBack}
            >
              Go Back
            </button>
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-500"
              onClick={resendOTP}
              disabled={isLoading}
            >
              Resend OTP
            </button>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          {activeTab === "signin"
            ? "Sign in to your account"
            : "Create your account"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {activeTab === "signin"
            ? "Sign in to access your bookings and more"
            : "Join Latent to book tickets for movies, events and more"}
        </p>
      </div>

      <Tabs
        defaultValue="signin"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex items-center gap-2">
            <Movie className="h-4 w-4" />
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            <div>
              <Label
                htmlFor="signin-phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="signin-phone"
                  name="phone"
                  type="tel"
                  required
                  className="pl-10"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Continue with OTP"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label
                htmlFor="signup-phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  required
                  className="pl-10"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

    </div>
  );
}
