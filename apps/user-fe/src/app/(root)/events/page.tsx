import { Suspense } from "react";
import EventsPage from "@/app/components/Events";
import TicketLoader from "@/app/components/TicketLoader";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen">
      <TicketLoader />
    </div>}>
      <EventsPage />
    </Suspense>
  );
}
