import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';

import './globals.css';

import { ReactNode } from 'react';

import { getUserByAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import Header from '@/components/shared/header';
import { Toaster } from '@/components/ui';
import { ThemeProvider } from '@/lib/contexts/theme-context';
import Providers from '@/lib/providers/provider';
import { Theme } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import { cookies } from 'next/headers';

const inter = Inter({
  subsets: ['latin'],
});

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

  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get('theme');
  const theme = cookieTheme ? (cookieTheme.value as Theme) : 'dark';
  const user = (await getUserByAuthUserId()).data as User;

  // In your index.js/main.tsx or similar
  if (process.env.NODE_ENV !== 'production') {
    // This will give you better error messages
    console.log('Running in development mode');
  }
  return (
    <html lang='en'>
      <body className={cn('antialiased', inter.className)}>
        <Providers session={session}>
          <ThemeProvider defaultTheme={theme}>
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
