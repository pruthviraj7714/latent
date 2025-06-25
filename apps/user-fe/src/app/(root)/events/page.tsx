import { Suspense } from "react";
import EventsPage from "@/app/components/Events";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPage />
    </Suspense>
  );
}
