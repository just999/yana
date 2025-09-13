'use client';

import { useState } from 'react';

import { logout } from '@/actions/auth-actions';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Separator,
} from '@/components/ui';
import { registerInitialValues } from '@/lib/constants';
import { getProfileLinks } from '@/lib/helpers';
import { userAtom, UserProps } from '@/lib/jotai/user-atoms';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { User2Icon, UserCog2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GiExitDoor } from 'react-icons/gi';

import AddAvatarForm from './add-avatar-form';

type UserButtonProps = {};

const UserButton = () => {
  const { data: session, update, status } = useSession();
  const profileLinks = getProfileLinks(session?.user?.role);
  const [curUser, setCurUser] = useAtom(userAtom);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      await update(null);
      setCurUser(null);
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isLoggedIn = session?.user || curUser;

  if (!curUser) {
    return (
      <Button
        asChild
        size='sm'
        variant='ghost'
        className='dark:hover:bg-happy/30 m-0 h-6 border-1 border-amber-800 bg-amber-600 p-0 text-xs text-white backdrop-blur-xs dark:text-amber-50 dark:backdrop-blur-sm dark:hover:text-amber-200'
      >
        <Link href='/login'>
          <User2Icon size={12} /> Login
        </Link>
      </Button>
    );
  }

  const firstInitial = curUser?.name.charAt(0).toUpperCase() ?? 'U';
  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              className='relative ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-stone-300 bg-gray-200/60 dark:bg-stone-500/50'
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-56 py-4' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex items-center gap-2'>
              <div className='flex w-full flex-col items-center gap-2 space-y-1 leading-none'>
                <AddAvatarForm />

                {/* {session?.user?.name && (
                  <p className='font-medium'>{session?.user?.name}</p>
                )} */}
                {curUser?.email && (
                  <p className='text-muted-foreground truncate text-sm'>
                    {curUser?.email}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem className='mb-1 p-0'>
            <form action={handleSignOut} className='w-full'>
              <Button
                type='submit'
                className='group flex h-4 w-full justify-start py-4 text-xs text-sky-500'
                variant='ghost'
              >
                <GiExitDoor
                  size={18}
                  className='text-sky-500 group-hover:text-white'
                />{' '}
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
          <Separator />

          <DropdownMenuItem className='my-1 p-0'>
            <div
              className={cn(
                'group flex h-8 w-full items-center justify-start p-0 px-2 text-xs font-semibold text-stone-500'
              )}
            >
              <span
                // href={curUser?.role === 'ADMIN' ? 'admin' : 'user'}
                className={cn(
                  'flex h-8 w-full justify-start text-xs font-semibold text-stone-500'
                )}
              >
                <span className='hover:text-primary flex items-center justify-start gap-1 text-xs'>
                  <UserCog2
                    size={18}
                    className={cn('group-hover:text-white')}
                  />{' '}
                  {curUser?.name?.substring(0, 10)}... (
                  {curUser?.role === 'ADMIN' ? 'Admin' : 'User'})
                </span>
              </span>
            </div>
          </DropdownMenuItem>

          <Separator />
          {profileLinks.map(({ title, href, icon: Icon }) => (
            <DropdownMenuItem key={href} className='my-1 p-0'>
              <Button
                asChild
                className={cn(
                  'group h-8 w-full justify-start p-0 px-2 text-xs font-semibold text-stone-500'
                )}
                variant='ghost'
              >
                <Link
                  href={href}
                  className={cn(
                    'hover:text-primary text-sm font-medium transition-colors'
                  )}
                >
                  <span
                    className='flex items-center justify-start gap-1 text-xs'
                    // onClick={(e) => e.preventDefault()}
                  >
                    <Icon size={18} className={cn('group-hover:text-white')} />{' '}
                    {title}
                  </span>
                </Link>
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
