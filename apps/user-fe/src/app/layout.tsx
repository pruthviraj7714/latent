import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "./components/footer";
import Providers from "./components/Providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Latent Booking",
  description:
    "A smooth and secure platform for managing your bookings and making payments with ease. Powered by Cashfree Payments.",
  keywords: ["Next.js", "Payments", "Bookings", "User Dashboard"],
  authors: [{ name: "Devpm" }],
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          {children}
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
