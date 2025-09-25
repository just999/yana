import { ReactNode } from 'react';

import './globals.css';

import { getUserByAuthUserId } from '@/actions/auth-actions';
import { auth } from '@/auth';
import Header from '@/components/shared/header';
import { Toaster } from '@/components/ui';
import Providers from '@/lib/providers/provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { cn, inter } from '@/lib/utils';
import type { User } from '@prisma/client';
import type { Metadata } from 'next';

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
