import { EventCategory, PrismaClient, SeatType } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.create({
    data: {
      name: "Ravi Singh",
      phoneNumber: "9999999999",
      verified: true,
    },
  });

  if (!admin) throw new Error("No admin found. Seed an admin first.");

  const cities = [
    { name: "Mumbai", state: "Maharashtra" },
    { name: "Delhi", state: "Delhi" },
    { name: "Bangalore", state: "Karnataka" },
    { name: "Chennai", state: "Tamil Nadu" },
    { name: "Kolkata", state: "West Bengal" },
    { name: "Pune", state: "Maharashtra" },
    { name: "Hyderabad", state: "Telangana" },
    { name: "Rishikesh", state: "Uttarakhand" },
    { name: "Jaipur", state: "Rajasthan" },
    { name: "Gurgaon", state: "Haryana" },
    { name: "Chandigarh", state: "Chandigarh" },
    { name: "Goa", state: "Goa" },
  ];

  await Promise.all(
    cities.map((city) =>
      prisma.city.upsert({
        where: { name: city.name },
        update: {},
        create: {
          name: city.name,
          state: city.state,
        },
      })
    )
  );

  const cityMap = new Map();
  const allCities = await prisma.city.findMany();
  allCities.forEach((city) => cityMap.set(city.name, city.id));

  const events = [
    {
      name: "Mumbai Music Fest",
      city: "Mumbai",
      venue: "Jio Garden",
      category: "MUSIC",
      price: 500,
      seatType: "REGULAR",
      bannerImageUrl:
        "https://i.pinimg.com/736x/4a/c0/8a/4ac08a862fdbc3f464c5157b0e9f09d3.jpg",
    },
    {
      name: "Delhi Tech Talk",
      city: "Delhi",
      venue: "Pragati Maidan",
      category: "TECH",
      price: 800,
      seatType: "PREMIUM",
      bannerImageUrl:
        "https://i.pinimg.com/736x/20/aa/47/20aa47545e426d872fe5e6e5e675971c.jpg",
    },
    {
      name: "Laugh Night - Standup Special",
      city: "Bangalore",
      venue: "Comedy Club BLR",
      category: "COMEDY",
      price: 400,
      seatType: "REGULAR",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "IPL Semi Finals",
      city: "Chennai",
      venue: "Chepauk Stadium",
      category: "SPORTS",
      price: 1000,
      seatType: "BALCONY",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Kolkata Coding Bootcamp",
      city: "Kolkata",
      venue: "Tech Park",
      category: "WORKSHOP",
      price: 600,
      seatType: "SOFA",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Sunburn Arena",
      city: "Pune",
      venue: "Pune Ground A",
      category: "MUSIC",
      price: 1500,
      seatType: "VIP",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "AI Innovations Summit",
      city: "Bangalore",
      venue: "NIMHANS Convention Center",
      category: "TECH",
      price: 1200,
      seatType: "RECLINER",
      bannerImageUrl:
        "https://i.pinimg.com/736x/20/aa/47/20aa47545e426d872fe5e6e5e675971c.jpg",
    },
    {
      name: "Drama in the Dark",
      city: "Hyderabad",
      venue: "City Auditorium",
      category: "EDUCATION",
      price: 700,
      seatType: "COUPLE",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Startup Pitch Day",
      city: "Delhi",
      venue: "WeWork Delhi",
      category: "EDUCATION",
      price: 350,
      seatType: "REGULAR",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Bollywood Nights",
      city: "Mumbai",
      venue: "Grand Theatre",
      category: "PREMIERE",
      price: 900,
      seatType: "LUXURY",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "National Yoga Fest",
      city: "Rishikesh",
      venue: "Ganga Hall",
      category: "WORKSHOP",
      price: 250,
      seatType: "REGULAR",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Football League Finals",
      city: "Kolkata",
      venue: "Salt Lake Stadium",
      category: "SPORTS",
      price: 1100,
      seatType: "VIP",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Indie Music Carnival",
      city: "Jaipur",
      venue: "Pink City Grounds",
      category: "MUSIC",
      price: 600,
      seatType: "REGULAR",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Comic-Con India",
      city: "Bangalore",
      venue: "BIEC",
      category: "COMEDY",
      price: 700,
      seatType: "SOFA",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Future of Work Expo",
      city: "Gurgaon",
      venue: "DLF CyberHub",
      category: "TECH",
      price: 950,
      seatType: "PREMIUM",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Grand Premiere - King Khan Returns",
      city: "Mumbai",
      venue: "INOX Mumbai",
      category: "PREMIERE",
      price: 1800,
      seatType: "RECLINER",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Startup Fundraiser Pitch",
      city: "Delhi",
      venue: "India Habitat Center",
      category: "EDUCATION",
      price: 300,
      seatType: "COUPLE",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Live Coding Championship",
      city: "Hyderabad",
      venue: "T-Hub",
      category: "TECH",
      price: 500,
      seatType: "REGULAR",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "Art for Awareness",
      city: "Chandigarh",
      venue: "Sector 17 Plaza",
      category: "EDUCATION",
      price: 200,
      seatType: "REGULAR",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
    {
      name: "New Year Bash 2025",
      city: "Goa",
      venue: "Baga Beach Arena",
      category: "MUSIC",
      price: 2000,
      seatType: "LUXURY",
      bannerImageUrl:
        "https://i.pinimg.com/736x/d1/5b/3c/d15b3cbeb2d52db993e4e7fbb9b985cc.jpg",
    },
  ];

  for (const e of events) {
    const cityId = cityMap.get(e.city);
    const event = await prisma.event.create({
      data: {
        name: e.name,
        venue: e.venue,
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        cityId,
        category: e.category as EventCategory,
        isFeatured: Math.random() > 0.8,
        isPremiere: e.category === "PREMIERE",
        description: `${e.name} at ${e.venue}`,
        bannerImageUrl: e.bannerImageUrl,
        adminId: admin.id,
      },
    });

    for (let i = 1; i <= 50; i++) {
      await prisma.seat.create({
        data: {
          price: e.price,
          type: e.seatType as SeatType,
          seatNumber: `${e.seatType[0]}-${i}`,
          eventId: event.id,
        },
      });
    }
  }

  console.log("Seeding completed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
