'use client';

import { logout } from '@/actions/auth-actions';
import {
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { userAtom } from '@/lib/jotai/user-atoms';
import { useAtomValue } from 'jotai';
import { CircleUserRound, EllipsisVertical, LogOut, User2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import ThemeToggle from '../theme-toggle';
import MainNav from './main-nav';
import UserButton from './user-button';

type MenuProps = {};

const Menu = () => {
  // const role = session?.user?.role;
  const { data: session } = useSession();
  const user = useAtomValue(userAtom);
  const renderedUserSession = user ? (
    <SheetTitle>
      <div className='flex items-center gap-2'>
        <div>
          <CircleUserRound
            size={28}
            className='stroke-stone-400 stroke-[1.5] dark:stroke-stone-800'
          />
        </div>
        <div className='flex flex-col items-start space-y-1'>
          <div className='text-xs leading-none font-medium'>{user.name}</div>
          <div className='text-muted-foreground text-xs leading-none'>
            {user.email}
          </div>
        </div>
      </div>
      <form action={logout} className='w-full'>
        <SheetDescription>
          <Button
            className='h-4 w-full justify-start py-4 text-xs text-sky-500'
            variant='ghost'
          >
            <LogOut size={18} /> Sign Out
          </Button>
        </SheetDescription>
      </form>
    </SheetTitle>
  ) : (
    <SheetTitle>
      <Button
        asChild
        size='sm'
        variant={'ghost'}
        className='text-accent bg-amber-600'
      >
        <Link href='/login' className='text-gray-700'>
          <User2 size={20} /> Login
        </Link>
      </Button>
    </SheetTitle>
  );

  return (
    <div className='flex justify-start gap-3'>
      {/* Desktop Navigation */}
      <div className='hidden w-full max-w-xs items-center gap-2 md:flex'>
        <ThemeToggle />
        <UserButton />
      </div>

      {/* Mobile Navigation */}
      <div className='block md:hidden'>
        <Sheet>
          {/* Sheet Trigger (EllipsisVertical Icon) */}
          <SheetTrigger className='align-middle' asChild>
            <Button variant='ghost' size='icon' className='z-10 p-2'>
              <EllipsisVertical size={24} className='text-foreground' />
            </Button>
          </SheetTrigger>

          {/* Sheet Content */}
          <SheetContent className='flex w-[300px] flex-col items-start'>
            <SheetHeader>{renderedUserSession}</SheetHeader>

            {session && (
              <div>
                <Separator />
                <MainNav
                  className='w-full flex-col items-start'
                  type='mobile'
                  session={session}
                />
              </div>
            )}
            <Separator />
            <div className='flex h-8 items-center justify-start gap-2 px-2 text-xs'>
              <span>
                <ThemeToggle />
              </span>
              <span>Theme</span>
              <UserButton />
            </div>

            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Menu;
