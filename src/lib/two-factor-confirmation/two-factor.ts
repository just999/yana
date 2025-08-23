// import { db } from '@/lib/db';
// import { formatError } from '@/lib/utils';

// export const getTwoFactorConfirmationByUserId = async (userId: string) => {
//   try {
//     const twoFactorConfirmation = await db.twoFactor.findUnique({
//       where: { userId },
//     });

//     return twoFactorConfirmation;
//   } catch {
//     return null;
//   }
// };
