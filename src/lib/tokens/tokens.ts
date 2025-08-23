import crypto, { randomBytes } from 'crypto';

import { db } from '@/lib/db';
import { getTwoFactorTokenByEmail } from '@/lib/tokens/two-factor-token';
import { formatError } from '@/lib/utils';
import { TokenType } from '@prisma/client';

export async function getTokenByEmail(email: string) {
  try {
    return db.token.findFirst({
      where: {
        email,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getTokenByToken(token: string) {
  try {
    return db.token.findFirst({
      where: {
        token,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function generateToken(email: string, type: TokenType) {
  const token = randomBytes(48).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const existingToken = await getTokenByEmail(email);

  if (existingToken) {
    await db.token.delete({
      where: {
        id: existingToken.id,
      },
    });
  }
  return db.token.create({
    data: {
      email,
      token,
      expires,
      type,
    },
  });
}

export const generateTwoFactorToken = async (
  email: string,
  type: TokenType
) => {
  {
    try {
      const token = crypto.randomInt(100_000, 1_000_000).toString();
      const expires = new Date(new Date().getTime() + 3600 * 1000);

      const existingToken = await getTwoFactorTokenByEmail(email);

      if (existingToken.data && existingToken.data.id) {
        await db.token.delete({
          where: {
            id: existingToken.data?.id,
          },
        });
      }

      const twoFactorToken = await db.token.create({
        data: {
          email,
          token,
          expires,
          type,
        },
      });

      return twoFactorToken;
    } catch {
      return null;
    }
  }
};
