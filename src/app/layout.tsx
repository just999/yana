import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';

import './globals.css';

import { ReactNode, Suspense } from 'react';

import { getUserByAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import Header from '@/components/shared/header';
import UserButtonFallback from '@/components/shared/user-button-fallback';
import { Toaster } from '@/components/ui';
import useServerDarkMode from '@/hooks/use-server-dark-mode';
import Providers from '@/lib/providers/provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { Theme } from '@/lib/types';
import { cn, inter } from '@/lib/utils';
import type { User } from '@prisma/client';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: { template: '%s | My Blogs', default: 'Blogs' },
  description: 'Blogs to express yourself',
  icons: {
    icon: '/img/yana-ico.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  // const cookieStore = await cookies();
  // const cookieTheme = cookieStore.get('theme');
  // const theme = cookieTheme ? (cookieTheme.value as Theme) : 'dark';
  const user = (await getUserByAuthUserId()).data as User;

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn('antialiased', inter.className)}>
        <Providers session={session}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <Header user={user} />

            <div className='flex flex-col'>
              {children}
              <Toaster />
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
