import { auth } from '@/auth';
import { NavUser } from '@/components/shared/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui';
import { localAvatar } from '@/lib/constants';
import { SidebarItems } from '@/lib/helpers';
import { ArrowLeft } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';

export default async function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = (await auth()) as Session;

  return (
    <Sidebar
      collapsible='icon'
      variant='inset'
      className='max-w-56 pt-16'
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <Link href='/' className='text-sky-700 hover:text-sky-600'>
                <ArrowLeft />
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='underline'>Dashboard</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {SidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='pb-20'>
        <NavUser
          session={session}
          user={
            session?.user
              ? {
                  id: session.user.id,
                  role: session.user.role,
                  name: session.user.name ?? '',
                  email: session.user.email ?? '',
                  avatar: (session.user as any).avatar ?? localAvatar,
                }
              : { name: '', email: '' }
          }
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
