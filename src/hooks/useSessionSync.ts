import { useEffect } from 'react';

import { sessionAtom } from '@/lib/jotai/session-atoms';
import { useSetAtom } from 'jotai';
import { useSession } from 'next-auth/react';

export const useSessionSync = () => {
  const { data: session, status } = useSession();
  const setSession = useSetAtom(sessionAtom);

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // Update Jotai atom with current session
    setSession(session);
  }, [session, status, setSession]);

  return { session, status };
};
