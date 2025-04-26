import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.city.createMany({
    data: [
      { name: 'Mumbai', state: 'Maharashtra' },
      { name: 'Delhi', state: 'Delhi' },
      { name: 'Bangalore', state: 'Karnataka' },
      { name: 'Hyderabad', state: 'Telangana' },
      { name: 'Chennai', state: 'Tamil Nadu' },
      { name: 'Kolkata', state: 'West Bengal' },
      { name: 'Pune', state: 'Maharashtra' },
      { name: 'Jaipur', state: 'Rajasthan' },
      { name: 'Ahmedabad', state: 'Gujarat' },
      { name: 'Lucknow', state: 'Uttar Pradesh' },
    ],
  });
}

main()
  .then(() => {
    console.log('Cities seeded');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
