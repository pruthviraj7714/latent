import Image from "next/image";
import AuthForm from "./components/auth-form";
import { Ticket } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white flex flex-col justify-center items-center p-10">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center items-center gap-2">
              <Ticket className="w-6 h-6 text-amber-400" />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-white">Latent</span>
                <span className="text-white/80">Booking</span>
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-snug">
              Welcome to <span className="text-amber-400">Latent</span>
            </h1>
            <p className="text-lg opacity-90">
              Your one-stop destination for booking tickets to the best events
            </p>
            <div>
              <Image
                src="https://i.pinimg.com/736x/45/96/3b/45963ba52bf5a0044718b96949a6f046.jpg"
                alt="Booking Illustration"
                width={400}
                height={300}
                className="rounded-2xl shadow-2xl mx-auto"
              />
            </div>
            <p className="text-sm opacity-80">
              Join millions of users who book tickets hassle-free
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-white">
          <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
            <AuthForm />
          </div>
        </div>
      </div>
    </main>
  );
}
