// 'use client';

// import { useEffect } from 'react';

// import SearchInput from '@/components/shared/search-input';
// import { SITE_CONFIG } from '@/lib/constants';
// import { User } from '@/lib/generated/prisma/client';
// import { menuItems } from '@/lib/helpers';
// import { userAtom } from '@/lib/jotai/user-atoms';
// import { ballet, cn } from '@/lib/utils';
// import { useAtom } from 'jotai';
// import { useSession } from 'next-auth/react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';

// import Menu from './menu';
// import Search from './search';

// type HeaderProps = {
//   className?: string;
//   user: User;
// };

// const Header = ({ className, user }: HeaderProps) => {
//   const pathname = usePathname();
//   const [curUser, setCurUser] = useAtom(userAtom);
//   const router = useRouter();

//   const { data: session, update, status } = useSession();

//   useEffect(() => {
//     if (!session) router.push('/');
//   }, [session]);

//   useEffect(() => {
//     if (user) {
//       setCurUser({
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar ?? undefined,
//         role: user.role ?? undefined,
//         anonymous: user.anonymous,
//         school: user.school ?? undefined,
//         major: user.major ?? undefined,
//         phone: user.phone ?? undefined,
//         address: user.address ?? undefined,
//         city: user.city ?? undefined,
//       });
//     } else {
//       setCurUser(null);
//     }
//   }, [setCurUser]);

//   const isActive = (href: string) => {
//     if (href === pathname) return true;

//     if (href === '/dashboard' && pathname.startsWith('/dashboard')) {
//       return !pathname.includes('/new-blog');
//     }

//     if (href.includes('/new-blog') && pathname.includes('/new-blog')) {
//       return true;
//     }

//     return false;
//   };
//   return (
//     <header
//       className={cn(
//         'bg-muted/80 fixed inset-x-0 top-0 z-50 px-4 py-2 shadow-lg backdrop-blur-sm',
//         className
//       )}
//     >
//       <nav className='container mx-auto flex max-w-5xl items-center justify-between'>
//         <div className='flex h-12 w-full items-center justify-between p-2'>
//           <div className='flex-start flex gap-4'>
//             <Link href='/' className='flex w-full'>
//               <SITE_CONFIG.logo className='svg h-auto w-8 fill-orange-500 dark:fill-orange-400' />
//               <span
//                 className={cn(
//                   'ml-2 hidden text-xl font-bold lg:block',
//                   ballet.className
//                 )}
//               >
//                 {SITE_CONFIG.name}
//               </span>
//             </Link>

//             {curUser &&
//               menuItems.map((item) => (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={cn(
//                     'w-full rounded-md px-3 py-2 text-sm text-nowrap transition-colors duration-200',
//                     isActive(item.href)
//                       ? 'bg-gray-800/50 font-normal text-white underline decoration-amber-500/60 decoration-4 shadow-md'
//                       : 'hover:bg-muted hover:text-orange-500'
//                   )}
//                 >
//                   {item.label}
//                 </Link>
//               ))}
//           </div>

//           {curUser && (
//             <div className='hidden md:block'>
//               <SearchInput />
//             </div>
//           )}
//           <Menu />
//         </div>
//       </nav>
//       <Search />
//     </header>
//   );
// };

// export default Header;

'use client';

import { useEffect, useState } from 'react';

import Search from '@/components/shared/search';
import SearchInput from '@/components/shared/search-input';
import { SITE_CONFIG } from '@/lib/constants';
import { menuItems } from '@/lib/helpers';
import { userAtom } from '@/lib/jotai/user-atoms';
import { ballet, cn } from '@/lib/utils';
import { User } from '@prisma/client';
import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import Menu from './menu';

type HeaderProps = {
  className?: string;
  user: User;
};

const Header = ({ className, user }: HeaderProps) => {
  const pathname = usePathname();
  const [curUser, setCurUser] = useAtom(userAtom);
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: session, update, status } = useSession();

  useEffect(() => {
    if (!session) router.push('/');
  }, [router, session]);

  useEffect(() => {
    if (user) {
      setCurUser({
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        role: user.role ?? undefined,
        anonymous: user.anonymous,
        school: user.school ?? undefined,
        major: user.major ?? undefined,
        phone: user.phone ?? undefined,
        address: user.address ?? undefined,
        city: user.city ?? undefined,
      });
    } else {
      setCurUser(null);
    }
  }, [setCurUser, user]);

  const isActive = (href: string) => {
    if (href === pathname) return true;

    if (href === '/dashboard' && pathname.startsWith('/dashboard')) {
      return !pathname.includes('/new-blog');
    }

    if (href.includes('/new-blog') && pathname.includes('/new-blog')) {
      return true;
    }

    return false;
  };

  // Close search when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = () => setIsSearchOpen(false);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };

    if (isSearchOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchOpen]);

  // Close search on navigation
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'bg-muted/80 fixed inset-x-0 top-0 z-50 px-4 py-2 shadow-lg backdrop-blur-sm',
          className
        )}
      >
        <nav className='container mx-auto flex max-w-5xl items-center justify-between'>
          <div className='flex h-12 w-full items-center justify-between p-2'>
            {/* Left Side - Logo & Navigation */}
            <div className='flex-start flex gap-4'>
              <Link href='/' className='flex w-full'>
                <SITE_CONFIG.logo className='svg h-auto w-8 fill-orange-500 dark:fill-orange-400' />
                <span
                  className={cn(
                    'ml-2 hidden text-xl font-bold lg:block',
                    ballet.className
                  )}
                >
                  {SITE_CONFIG.name}
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              {curUser &&
                menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'w-full rounded-md px-3 py-2 text-sm text-nowrap transition-colors duration-200',
                      isActive(item.href)
                        ? 'bg-gray-800/50 font-normal text-white underline decoration-amber-500/60 decoration-4 shadow-md'
                        : 'hover:bg-muted hover:text-orange-500'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
            </div>

            {/* Right Side - Search & Menu */}
            <div className='flex items-center gap-2'>
              {/* Search - Always visible for logged in users */}
              {/* {curUser && (
                <div className='relative'>
                  <SearchInput
                    isOpen={isSearchOpen}
                    onToggle={() => setIsSearchOpen(!isSearchOpen)}
                    onClose={() => setIsSearchOpen(false)}
                  />
                </div>
              )} */}

              <Search />

              {/* Menu Component */}
              <Menu />
            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay - Only shows when search is open */}
      {isSearchOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/20 pt-16'
          onClick={() => setIsSearchOpen(false)}
        >
          {/* This div prevents event bubbling when clicking inside search */}
          <div
            className='container mx-auto max-w-5xl px-4'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search content will be positioned here by SearchInput */}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
