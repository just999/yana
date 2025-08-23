import { db } from '@/lib/db';
import { formatError } from '@/lib/utils';

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await db.token.findFirst({
      where: {
        token,
      },
    });

    return {
      error: false,
      message: 'successfully fetch token',
      data: twoFactorToken,
    };
  } catch (err) {
    return null;
  }
};
export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await db.token.findFirst({
      where: {
        email,
      },
    });

    return {
      error: false,
      message: 'successfully fetch token',
      data: twoFactorToken,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
};
