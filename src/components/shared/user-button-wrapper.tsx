import { getUserByAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import { User } from '@prisma/client';
import { Session } from 'next-auth';

import UserButton from './user-button';

type UserButtonWrapperProps = unknown;

const UserButtonWrapper = async () => {
  const session = (await auth()) as Session;
  const user = (await getUserByAuthUserId()).data as User;
  return <UserButton />;
};

export default UserButtonWrapper;
