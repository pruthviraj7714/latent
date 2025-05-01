import {
  PrismaClient,
  EventCategory,
  SeatType,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding process...");

  console.log("Cleaning up existing data...");
  await prisma.payment.deleteMany({});
  await prisma.bookedSeat.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log("Creating Cities...");
  const cities = await Promise.all([
    prisma.city.create({
      data: { name: "Mumbai", state: "Maharashtra" },
    }),
    prisma.city.create({
      data: { name: "Delhi", state: "Delhi" },
    }),
    prisma.city.create({
      data: { name: "Bangalore", state: "Karnataka" },
    }),
    prisma.city.create({
      data: { name: "Chennai", state: "Tamil Nadu" },
    }),
    prisma.city.create({
      data: { name: "Kolkata", state: "West Bengal" },
    }),
    prisma.city.create({
      data: { name: "Hyderabad", state: "Telangana" },
    }),
    prisma.city.create({
      data: { name: "Pune", state: "Maharashtra" },
    }),
    prisma.city.create({
      data: { name: "Ahmedabad", state: "Gujarat" },
    }),
    prisma.city.create({
      data: { name: "Jaipur", state: "Rajasthan" },
    }),
    prisma.city.create({
      data: { name: "Goa", state: "Goa" },
    }),
  ]);

  console.log("Creating Admins...");
  const admins = await Promise.all([
    prisma.admin.create({
      data: {
        phoneNumber: "9876543210",
        name: "Admin Kumar",
        verified: true,
      },
    }),
    prisma.admin.create({
      data: {
        phoneNumber: "8765432109",
        name: "Priya Admin",
        verified: true,
      },
    }),
    prisma.admin.create({
      data: {
        phoneNumber: "7654321098",
        name: "Raj Administrator",
        verified: true,
      },
    }),
    prisma.admin.create({
      data: {
        phoneNumber: "6543210987",
        name: "Sneha Manager",
        verified: false,
      },
    }),
    prisma.admin.create({
      data: {
        phoneNumber: "5432109876",
        name: "Vikram Director",
        verified: true,
      },
    }),
  ]);

  console.log("Creating Users...");
  const users = await Promise.all(
    Array(30)
      .fill(null)
      .map((_, i) => {
        return prisma.user.create({
          data: {
            phoneNumber: `98${String(i).padStart(8, "0")}`,
            name: `User ${i + 1}`,
            verified: i % 3 === 0,
          },
        });
      })
  );

  console.log("Creating Events...");
  const eventDescriptions = [
    "Join us for an unforgettable night filled with amazing performances and spectacular displays. This event promises to be the highlight of the season with renowned artists, incredible lighting, and an atmosphere that will leave you breathless.",
    "Experience the excitement and thrill of this incredible showcase of talent and skill. This much-anticipated event brings together the best performers from around the country for a day filled with awe-inspiring moments.",
    "A unique opportunity to witness greatness in action. This premium event features exclusive performances that you won't see anywhere else, carefully curated to provide an exceptional experience for all attendees.",
    "Laugh until you cry at this hilarious event featuring the country's top comedians. With back-to-back performances throughout the evening, you're guaranteed non-stop entertainment and unforgettable memories.",
    "An educational journey that will expand your horizons and challenge your thinking. Our expert speakers will share invaluable insights and practical knowledge that you can apply in your daily life and career.",
    "Immerse yourself in this interactive workshop led by industry pioneers. Learn hands-on skills, network with like-minded individuals, and walk away with new capabilities that will set you apart in your field.",
    "Be among the first to witness this groundbreaking premiere. With VIP access and exclusive after-party opportunities, this red-carpet event is the most sought-after ticket of the season.",
    "A celebration of cultural heritage and artistic expression. This festival brings together diverse performances that showcase the rich tapestry of traditions from across the region and beyond.",
    "Push your limits at this high-energy sports competition. Whether you're a participant or spectator, the adrenaline and excitement will keep you engaged from start to finish.",
    "A peaceful retreat from the hustle and bustle of daily life. This event creates a space for reflection, connection, and personal growth through guided experiences and thoughtful discussions.",
  ];

  const bannerImages = [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
    "https://images.unsplash.com/photo-1603190287605-e6ade32fa852",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7",
    "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
    "https://images.unsplash.com/photo-1508997449629-303059a039c0",
  ];

  const eventNames = [
    "Summer Music Festival 2025",
    "Comedy Night Extravaganza",
    "Tech Conference 2025",
    "Premier League Finals",
    "International Film Premiere",
    "Digital Marketing Workshop",
    "Classical Music Symphony",
    "Standup Comedy Showcase",
    "Wellness and Yoga Retreat",
    "Entrepreneurship Summit",
    "Rock Band Reunion Tour",
    "Literary Festival",
    "Fashion Week Exhibition",
    "Science and Innovation Expo",
    "Culinary Masterclass",
    "Photography Workshop",
    "Annual Jazz Festival",
    "Gaming Championship",
    "Dance Performance Showcase",
    "Business Leadership Conference",
  ];

  const venues = [
    "Grand Auditorium",
    "City Convention Center",
    "Heritage Stadium",
    "Waterfront Arena",
    "Sunset Amphitheatre",
    "Royal Theatre",
    "Galaxy Multiplex",
    "Emerald Gardens",
    "Downtown Exhibition Hall",
    "Lakeside Resort",
    "Mountain View Resort",
    "Central Park Plaza",
    "Modern Art Museum",
    "University Campus Hall",
    "Beachfront Pavilion",
  ];

  const events = [];
  for (let i = 0; i < 40; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60));

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2 + Math.floor(Math.random() * 4));

    const randomCityIndex = Math.floor(Math.random() * cities.length);
    const randomAdminIndex = Math.floor(Math.random() * admins.length);
    const randomEventNameIndex = Math.floor(Math.random() * eventNames.length);
    const randomVenueIndex = Math.floor(Math.random() * venues.length);
    const randomDescriptionIndex = Math.floor(
      Math.random() * eventDescriptions.length
    );
    const randomBannerIndex = Math.floor(Math.random() * bannerImages.length);

    const categoryIndex = i % 7;
    const categories = [
      EventCategory.MUSIC,
      EventCategory.SPORTS,
      EventCategory.COMEDY,
      EventCategory.TECH,
      EventCategory.EDUCATION,
      EventCategory.WORKSHOP,
      EventCategory.PREMIERE,
    ];

    const event = await prisma.event.create({
      data: {
        name: eventNames[randomEventNameIndex]!,
        startTime: startDate,
        endTime: endDate,
        venue: venues[randomVenueIndex]!,
        cityId: cities[randomCityIndex]!.id,
        category: categories[categoryIndex]!,
        adminId: admins[randomAdminIndex]!.id,
        isFeatured: i % 5 === 0,
        isPremiere: i % 10 === 0,
        views: Math.floor(Math.random() * 10000),
        description: eventDescriptions[randomDescriptionIndex]!,
        bannerImageUrl: `${bannerImages[randomBannerIndex]}?random=${i}`,
      },
    });

    events.push(event);
  }

  console.log("Creating Seats for Events...");
  const seats = [];

  const seatConfigurations = [
    { type: SeatType.REGULAR, price: 150 },
    { type: SeatType.PREMIUM, price: 400 },
    { type: SeatType.RECLINER, price: 700 },
    { type: SeatType.VIP, price: 1300 },
    { type: SeatType.COUPLE, price: 800 },
    { type: SeatType.BALCONY, price: 350 },
    { type: SeatType.SOFA, price: 600 },
    { type: SeatType.LUXURY, price: 1500 },
  ];

  for (const event of events) {
    const seatCount = 20 + Math.floor(Math.random() * 100);

    for (let i = 0; i < seatCount; i++) {
      const seatTypeIndex = Math.floor(i / (seatCount / 8)) % 8;
      const seatConfig = seatConfigurations[seatTypeIndex]!;

      const price = seatConfig.price;

      const section = String.fromCharCode(65 + Math.floor(i / 30));
      const number = (i % 30) + 1;
      const seatNumber = `${section}${number}`;

      const hasLock = Math.random() > 0.9;
      const lockedUntil = hasLock
        ? new Date(Date.now() + Math.floor(Math.random() * 900000))
        : null;

      const seat = await prisma.seat.create({
        data: {
          price,
          type: seatConfig.type,
          seatNumber,
          lockedUntil,
          eventId: event.id,
        },
        include: {
          bookedSeat: true,
        },
      });

      seats.push(seat);
    }
  }

  console.log("Creating Bookings and Payments...");

  const bookingStatuses = [
    BookingStatus.SUCCESS,
    BookingStatus.FAILED,
    BookingStatus.PENDING,
    BookingStatus.EXPIRED,
  ];

  const paymentStatuses = [
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.PENDING,
  ];

  for (let i = 0; i < 150; i++) {
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const randomEventIndex = Math.floor(Math.random() * events.length);
    const randomEvent = events[randomEventIndex]!;

    const eventSeats = seats.filter(
      (s) => s.eventId === randomEvent.id && !s.bookedSeat
    );

    if (eventSeats.length === 0) continue;

    const seatsToBook = Math.min(
      1 + Math.floor(Math.random() * 4),
      eventSeats.length
    );
    const selectedSeats = eventSeats.slice(0, seatsToBook);

    const statusRandom = Math.random();
    let bookingStatus;
    if (statusRandom < 0.7) {
      bookingStatus = BookingStatus.SUCCESS;
    } else if (statusRandom < 0.8) {
      bookingStatus = BookingStatus.FAILED;
    } else if (statusRandom < 0.9) {
      bookingStatus = BookingStatus.PENDING;
    } else {
      bookingStatus = BookingStatus.EXPIRED;
    }

    const booking = await prisma.booking.create({
      data: {
        userId: users[randomUserIndex]!.id,
        eventId: randomEvent!.id,
        status: bookingStatus,
      },
    });

    if (
      bookingStatus === BookingStatus.SUCCESS ||
      bookingStatus === BookingStatus.PENDING
    ) {
      let paymentStatus;
      if (bookingStatus === BookingStatus.SUCCESS) {
        paymentStatus = PaymentStatus.SUCCESS;
      } else {
        paymentStatus =
          Math.random() < 0.5 ? PaymentStatus.PENDING : PaymentStatus.FAILED;
      }

      await prisma.payment.create({
        data: {
          userId: users[randomUserIndex]!.id,
          bookingId: booking.id,
          status: paymentStatus,
          eventId: randomEvent.id,
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
