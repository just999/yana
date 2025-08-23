// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const users = await prisma.user.findMany({
//     select: {
//       id: true,
//       avatar: true,
//       profileComplete: true,
//       anonymous: true,
//       school: true,
//       major: true,
//       phone: true,
//       address: true,
//       city: true,
//     },
//   });
//   for (const user of users) {
//     await prisma.profile.create({
//       data: {
//         userId: user.id,
//         avatar: user.avatar,
//         profileComplete: user.profileComplete,
//         anonymous: user.anonymous,
//         school: user.school,
//         major: user.major,
//         phone: user.phone,
//         address: user.address,
//         city: user.city,
//       },
//     });
//   }

//   console.log('Successfully seeds');
// }

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());
