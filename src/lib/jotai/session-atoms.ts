import { User } from '@prisma/client';
import { atom } from 'jotai';
import { Session } from 'next-auth';

export const sessionAtom = atom<Session | null>(null);
export const usersAtom = atom<User[]>([]);

if (process.env.NODE_ENV !== 'production') {
  sessionAtom.debugLabel = 'session';
  // sessionRoleAtom.debugLabel = 'sessionRole';

  // fetchSessionAtom.debugLabel = 'fetchSessions';
}
