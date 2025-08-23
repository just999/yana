'use server';

import { getAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { formatError } from '@/lib/utils';

export const getAllUsers = async () => {
  try {
    const session = await auth();

    const role = session?.user.role;

    if (role !== 'ADMIN') {
      return {
        error: true,
        message: 'unauthorized',
      };
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            posts: true,
            likes: true,
            comments: true,
          },
        },
        reactions: {
          select: { type: true },
        },
      },
    });

    if (!users) {
      return {
        error: true,
        message: 'no user was found',
      };
    }

    const usersWithReactionCounts = users.map((user) => ({
      ...user,
      _count: {
        ...user._count,
        like: user.reactions.filter((r) => r.type === 'LIKE').length,
        dislike: user.reactions.filter((r) => r.type === 'DISLIKE').length,
        total: user.reactions.length,
      },
      reactions: undefined,
    }));

    return {
      error: false,
      message: 'Successfully fetch all users',
      data: usersWithReactionCounts,
    };
  } catch (err) {
    return { error: true, message: formatError(err) };
  }
};

export async function getUserByEmail(email: string) {
  try {
    const user = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        error: true,
        message: 'No user was found with this email',
      };
    }

    return {
      error: false,
      message: 'successfully fetch user by email',
      data: user,
    };
  } catch (err) {
    return { error: true, message: formatError(err) };
  }
}

// export async function getUserWithProfile(userId: string) {
//   return db.user.findUnique({
//     where: { id: userId },
//     include: {
//       profile: true,
//       _count: {
//         select: {
//           posts: true,
//           comments: true,
//           likes: true,
//         },
//       },
//     },
//   });
// }

// export async function updateUserProfile(userId: string, profileData: any) {
//   return db.profile.upsert({
//     where: { userId },
//     update: profileData,
//     create: {
//       userId,
//       ...profileData,
//     },
//   });
// }

export async function getUserAccount() {
  try {
    const userId = await getAuthUserId();
    const userAccount = await db.account.findFirst({
      where: {
        userId,
      },
    });

    if (!userAccount) {
      return {
        error: true,
        message: 'no user account was found, its must credential user',
      };
    }

    return {
      error: false,
      message: 'successfully fetch user account',
      data: userAccount,
    };
  } catch (err) {
    return { error: true, message: formatError(err) };
  }
}
