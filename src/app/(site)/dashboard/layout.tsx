// import { ReactNode } from 'react';

// import AppSidebar from '@/components/dashboard/app-sidebar';
// import { MobileSafeSidebarTrigger } from '@/components/dashboard/mobile-sidebar-trigger';
// import SidebarBreadcrumb from '@/components/shared/sidebar-breadcrumb';
// import {
//   Separator,
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from '@/components/ui';
// import { cookies } from 'next/headers';

// type DashboardPageProps = {
//   children: ReactNode;
// };

// const DashboardLayout = async ({ children }: DashboardPageProps) => {
//   const cookieStore = await cookies();
//   const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

//   return (
//     <SidebarProvider
//       defaultOpen={defaultOpen}
//       style={
//         {
//           '--sidebar-width': 'calc(var(--spacing) * 72)',
//           '--header-height': 'calc(var(--spacing) * 12)',
//           '--sidebar-width-mobile': '20rem',
//         } as React.CSSProperties
//       }
//       data-mobile-safe='true'
//     >
//       <AppSidebar className='max-w-56' />
//       <div className='w-full pt-16 md:pt-[72px]'>
//         <SidebarInset className='rounded-xl'>
//           <header className='sticky top-16 z-50 flex h-(--header-height) w-full shrink-0 items-center gap-2 rounded-t-xl border-b backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) dark:bg-gray-900/70'>
//             <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
//               {/* <SidebarTrigger className='-ml-1' data-mobile-trigger='true' /> */}
//               <SidebarTrigger className='-ml-1' />
//               <Separator
//                 orientation='vertical'
//                 className='mr-2 data-[orientation=vertical]:h-4'
//               />

//               <SidebarBreadcrumb />
//             </div>
//           </header>
//           <main className='mx-auto max-w-6xl p-0 xl:p-4'>
//             <div className='max-w-[430px] px-4 sm:px-6 lg:w-full lg:px-8'>
//               {children}
//             </div>
//           </main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   );
// };

// export default DashboardLayout;

import { ReactNode } from 'react';

import AppSidebar from '@/components/dashboard/app-sidebar';
import { MobileSafeSidebarTrigger } from '@/components/dashboard/mobile-sidebar-trigger';
import SidebarBreadcrumb from '@/components/shared/sidebar-breadcrumb';
import {
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui';
import { cookies } from 'next/headers';

type DashboardPageProps = {
  children: ReactNode;
};

const DashboardLayout = async ({ children }: DashboardPageProps) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          '--sidebar-width': '14rem', // 224px
          '--sidebar-width-mobile': '85vw', // Use viewport width for better mobile experience
          '--header-height': '3rem', // 48px
        } as React.CSSProperties
      }
      data-mobile-safe='true'
    >
      <AppSidebar />

      <SidebarInset className='min-h-screen w-full pt-16 md:pt-[72px]'>
        {/* Header - Fixed height and positioning */}
        <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-12 w-full shrink-0 items-center gap-2 border-b backdrop-blur'>
          <div className='flex w-full items-center gap-2 px-3 sm:px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <SidebarBreadcrumb />
          </div>
        </header>

        {/* Main Content Area - Mobile-first responsive */}
        <main className='flex-1 overflow-auto'>
          <div className='w-full p-1 sm:p-4 md:p-6 lg:p-3'>
            {/* Content container with proper responsive widths */}
            <div className='mx-auto w-full px-1 sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl'>
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
