import Image from "next/image";
import AuthForm from "./components/auth-form";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white flex flex-col justify-center items-center p-10">
          <div className="max-w-md w-full space-y-6 text-center">
            <Image
              src="https://i.pinimg.com/736x/4b/67/7c/4b677cc267aaed3b4a0c215a82858828.jpg"
              alt="Latent Logo"
              width={100}
              height={40}
              className="mx-auto rounded-full shadow-md"
            />
            <h1 className="text-4xl font-extrabold tracking-tight leading-snug">
              Welcome to <span className="text-yellow-300">Latent</span>
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
