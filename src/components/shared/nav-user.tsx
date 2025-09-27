'use client';

import { ReactNode, useEffect } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui';
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { Session } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';

import UserButton from './user-button';

type NavUserProps = {
  user: {
    id?: string;
    role?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  session: Session;
};

export function NavUser({ user, session }: NavUserProps): ReactNode {
  const { isMobile } = useSidebar();
  // const pathname = usePathname();
  const firstInitial = session?.user.name?.charAt(0).toUpperCase() ?? 'U';
  const router = useRouter();

  // useEffect(() => {
  //   setOpenMobile(false);
  // }, [pathname, setOpenMobile]);

  // if (!data) {
  //   return router.push('/');
  // }

  return (
    // <SidebarMenu>
    //   <SidebarMenuItem>
    //     <DropdownMenu modal={false}>
    //       <DropdownMenuTrigger asChild className='bg-accent'>
    //         <SidebarMenuButton
    //           size='lg'
    //           className='h4 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer gap-2'
    //         >
    //           {/* <Avatar className='h-8 w-8'>
    //             <AvatarImage src={user.avatar} alt={user.name} />
    //             <AvatarFallback className='bg-amber-600/15'>
    //               <User size={20} className='text-amber-500' />{' '}
    //               <div className='relative flex h-8 w-8 cursor-pointer items-center justify-center border bg-gray-200/20 dark:bg-stone-500/50'>
    //                 {firstInitial}
    //               </div>
    //             </AvatarFallback>
    //           </Avatar> */}

    //           <UserButton />
    //           <div className='grid flex-1 text-left text-sm leading-tight'>
    //             <span className='truncate font-medium'>{user.name}</span>
    //             <span className='truncate text-xs'>{user.email}</span>
    //           </div>
    //           <ChevronsUpDown className='ml-auto size-4' />
    //         </SidebarMenuButton>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent
    //         className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
    //         side={isMobile ? 'bottom' : 'right'}
    //         align='end'
    //         sideOffset={4}
    //       >
    //         <DropdownMenuLabel className='p-0 font-normal'>
    //           <div className='flex items-center gap-1 px-1 py-1.5 text-left text-sm'>
    //             <Avatar className='h-8 w-8'>
    //               <AvatarImage src={session?.user.avatar} alt={user.name} />
    //               <AvatarFallback className='bg-amber-600/15'>
    //                 {' '}
    //                 <User size={20} className='text-amber-500' />{' '}
    //               </AvatarFallback>
    //             </Avatar>
    //             <div className='grid flex-1 text-left text-sm leading-tight'>
    //               <span className='truncate font-medium'>{user.name}</span>
    //               <span className='truncate text-xs'>{user.email}</span>
    //             </div>
    //           </div>
    //         </DropdownMenuLabel>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuGroup>
    //           <DropdownMenuItem>
    //             <Sparkles />
    //             Upgrade to Pro
    //           </DropdownMenuItem>
    //         </DropdownMenuGroup>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuGroup>
    //           <DropdownMenuItem>
    //             <BadgeCheck />
    //             Account
    //           </DropdownMenuItem>
    //           <DropdownMenuItem>
    //             <CreditCard />
    //             Billing
    //           </DropdownMenuItem>
    //           <DropdownMenuItem>
    //             <Bell />
    //             Notifications
    //           </DropdownMenuItem>
    //         </DropdownMenuGroup>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuItem>
    //           <LogOut />
    //           Log out
    //         </DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   </SidebarMenuItem>
    // </SidebarMenu>

    <SidebarMenu className='w-full'>
      <SidebarMenuItem className='pb-2 pl-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
            >
              <Avatar className='mx-auto h-8 w-8 rounded-lg'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className=''>CN</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user.name}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
