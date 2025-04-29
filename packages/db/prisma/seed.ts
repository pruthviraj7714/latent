import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const mumbai = await prisma.city.create({
    data: {
      name: "Mumbai",
      state: "Maharashtra",
    },
  });

  const delhi = await prisma.city.create({
    data: {
      name: "Delhi",
      state: "Delhi",
    },
  });

  const admin1 = await prisma.admin.create({
    data: {
      name: "John Doe",
      phoneNumber: "9876543210",
      verified: true,
    },
  });

  const admin2 = await prisma.admin.create({
    data: {
      name: "Jane Smith",
      phoneNumber: "8765432109",
      verified: true,
    },
  });

  const event1 = await prisma.event.create({
    data: {
      name: "Music Fest 2025",
      startTime: new Date("2025-06-01T18:00:00Z"),
      endTime: new Date("2025-06-01T23:00:00Z"),
      venue: "Stadium Arena",
      category: "MUSIC",
      cityId: mumbai.id,
      isFeatured: true,
      views: 45,
      description: "A grand music festival featuring top artists.",
      bannerImageUrl: "https://example.com/banner1.jpg",
      adminId: admin1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: "Tech Conference 2025",
      startTime: new Date("2025-07-15T09:00:00Z"),
      endTime: new Date("2025-07-15T17:00:00Z"),
      venue: "Tech Park Convention Center",
      category: "TECH",
      cityId: delhi.id,
      isPremiere: true,
      views: 435,
      description:
        "India's largest tech conference with keynotes, talks, and networking.",
      bannerImageUrl: "https://example.com/banner2.jpg",
      adminId: admin2.id,
    },
  });

  await prisma.seat.createMany({
    data: [
      {
        seatNumber: "A1",
        price: 500,
        type: "REGULAR",
        eventId: event1.id,
      },
      {
        seatNumber: "A2",
        price: 500,
        type: "REGULAR",
        eventId: event1.id,
      },
      {
        seatNumber: "VIP1",
        price: 1500,
        type: "VIP",
        eventId: event1.id,
      },
    ],
  });

  await prisma.seat.createMany({
    data: [
      {
        seatNumber: "B1",
        price: 700,
        type: "PREMIUM",
        eventId: event2.id,
      },
      {
        seatNumber: "B2",
        price: 700,
        type: "PREMIUM",
        eventId: event2.id,
      },
      {
        seatNumber: "SOFA1",
        price: 1200,
        type: "SOFA",
        eventId: event2.id,
      },
    ],
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
