'use client';

import { ReactNode } from 'react';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';

import StoreProvider from '../jotai/provider';

type ProvidersProps = {
  children: ReactNode;
  session: Session | null;
};

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role='alert'>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

const Providers = ({ children, session }: ProvidersProps) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SessionProvider session={session}>
        <StoreProvider>{children}</StoreProvider>
      </SessionProvider>{' '}
    </ErrorBoundary>
  );
};

export default Providers;
