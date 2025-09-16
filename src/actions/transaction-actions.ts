import { error } from 'console';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { formatError } from '@/lib/utils';

export async function getTransactionByUserId() {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }
    const userId = session?.user.id;

    const trans = await db.transaction.findMany({
      where: { userId },
    });

    if (!trans) {
      return {
        error: true,
        message: 'user no have any transaction',
      };
    }

    return {
      error: false,
      message: 'Successfully fetch transaction',
      data: trans,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}
