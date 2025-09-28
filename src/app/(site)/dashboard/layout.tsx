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

  // return (
  //   <SidebarProvider
  //     defaultOpen={defaultOpen}
  //     style={
  //       {
  //         '--sidebar-width': 'calc(var(--spacing) * 72)',
  //         '--header-height': 'calc(var(--spacing) * 12)',
  //       } as React.CSSProperties
  //     }
  //   >
  //     <AppSidebar className='max-w-56' />
  //     <div className='w-full pt-28 md:pt-[72px]'>
  //       <SidebarInset className='rounded-xl'>
  //         <header className='sticky top-16 z-50 flex h-(--header-height) w-full shrink-0 items-center gap-2 rounded-t-xl border-b backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) dark:bg-gray-900/70'>
  //           <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
  //             <SidebarTrigger className='-ml-1' />
  //             <Separator
  //               orientation='vertical'
  //               className='mr-2 data-[orientation=vertical]:h-4'
  //             />

  //             <SidebarBreadcrumb />
  //           </div>
  //         </header>
  //         <main className='mx-auto w-6xl p-4'>{children}</main>
  //       </SidebarInset>
  //     </div>
  //   </SidebarProvider>
  // );

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar className='max-w-56' />
      <div className='w-full pt-[70px]'>
        <SidebarInset className='rounded-xl'>
          <header className='sticky top-16 z-50 flex h-(--header-height) w-full shrink-0 items-center gap-2 rounded-t-xl border-b backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) dark:bg-gray-900/70'>
            <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
              <SidebarTrigger className='-ml-1' />
              <Separator
                orientation='vertical'
                className='mr-2 data-[orientation=vertical]:h-4'
              />

              <SidebarBreadcrumb />
            </div>
          </header>
          <main className='mx-auto w-full p-0 xl:p-4 2xl:max-w-6xl'>
            <div className='min-h-screen min-w-[420px] px-0 sm:px-6 lg:min-w-6xl lg:px-8'>
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
