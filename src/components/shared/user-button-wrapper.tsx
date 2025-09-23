import { Suspense } from 'react';

import { getUserByAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import { User } from '@prisma/client';
import { Session } from 'next-auth';

import UserButton from './user-button';
import UserButtonFallback from './user-button-fallback';

type UserButtonWrapperProps = unknown;

const UserButtonWrapper = async () => {
  const session = (await auth()) as Session;
  const user = (await getUserByAuthUserId()).data as User;
  return (
    <Suspense fallback={<UserButtonFallback />}>
      <UserButton />
    </Suspense>
  );
};

export default UserButtonWrapper;
