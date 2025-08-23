'use client';

import { ReactNode, useEffect } from 'react';

import { sessionAtom } from '@/lib/jotai/session-atoms';
import { useSetAtom } from 'jotai';
import { Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';

export function AppProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  const setSession = useSetAtom(sessionAtom);

  // Initialize with server-side session
  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  // Sync with client-side session
  const { data: clientSession, status } = useSession();
  useEffect(() => {
    if (status !== 'loading') {
      setSession(clientSession);
    }
  }, [clientSession, status, setSession]);

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
