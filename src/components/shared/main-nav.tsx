'use client';

import { useState } from 'react';

import { logout } from '@/actions/auth-actions';
import { getProfileLinks } from '@/lib/helpers';
import { userAtom } from '@/lib/jotai/user-atoms';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { UserCog2 } from 'lucide-react';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GiExitDoor } from 'react-icons/gi';

import { Button, Label, Separator } from '../ui';

// import AddAvatarForm from './add-avatar-form';

type MainNavProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  type?: 'mobile' | 'desktop';
};

const MainNav = ({ className, type, ...props }: MainNavProps) => {
  const { data: session, update, status } = useSession();
  const [curUser, setCurUser] = useAtom(userAtom);
  const profileLinks = getProfileLinks(session?.user?.role);
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

  return (
    <div className='w-56 py-0'>
      {/* <Label className='font-normal'>
        <div className='flex items-center gap-2'>
          <div className='flex w-full flex-col items-center gap-2 space-y-1 leading-none'>
            <AddAvatarForm />

            {session?.user?.name && (
                  <p className='font-medium'>{session?.user?.name}</p>
                )}
            {curUser?.email && (
              <p className='text-muted-foreground truncate text-sm'>
                {curUser?.email}
              </p>
            )}
          </div>
        </div>
      </Label> */}

      {/* <div className='mb-1 p-0'>
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
      </div> */}
      {/* <Separator /> */}
      {/* 
      <div className='my-1 p-0'>
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
              <UserCog2 size={18} className={cn('group-hover:text-white')} />{' '}
              {curUser?.name?.substring(0, 10)}... (
              {curUser?.role === 'ADMIN' ? 'Admin' : 'User'})
            </span>
          </span>
        </div>
      </div> */}

      {/* <Separator /> */}
      {profileLinks.map(({ title, href, icon: Icon }) => (
        <div key={href} className='my-1 p-0'>
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
        </div>
      ))}
    </div>
  );
};

export default MainNav;
