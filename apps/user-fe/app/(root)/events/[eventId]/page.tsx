import EventPage from "app/components/EventPage";

export default async function Page({ params }: { params: Promise<{ eventId: string }> }) {
  const eventId = (await params).eventId;

  return <EventPage eventId={eventId} />;
}
