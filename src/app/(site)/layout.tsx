import { ReactNode } from 'react';

import { getUserByAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import Footer from '@/components/footer';
import Header from '@/components/shared/header';
import { User } from '@prisma/client';
import type { Session } from 'next-auth';

export default async function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = (await auth()) as Session;

  const user = (await getUserByAuthUserId()).data as User;

  return (
    <div className='scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex min-h-screen flex-col'>
      <Header user={user} />
      <main className='flex-1'>{children}</main>
      <Footer className='fixed inset-x-0 bottom-0' />
    </div>
  );
}
