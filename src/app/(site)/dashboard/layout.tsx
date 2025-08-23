import { ReactNode } from 'react';

import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
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
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

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
      <DashboardSidebar className='max-w-56' />
      <div className='w-full pt-[70px]'>
        <SidebarInset className='rounded-xl'>
          <header className='sticky top-16 z-50 flex h-(--header-height) shrink-0 items-center gap-2 rounded-t-xl border-b bg-gray-900/70 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
            <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
              <SidebarTrigger className='-ml-1' />
              <Separator
                orientation='vertical'
                className='mr-2 data-[orientation=vertical]:h-4'
              />

              <SidebarBreadcrumb />
            </div>
          </header>
          <main className='mx-auto w-6xl p-4'>{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
