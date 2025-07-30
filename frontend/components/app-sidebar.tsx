'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconTools,
  IconUsers,
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/lib/auth';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Collections',
      url: '/collections',
      icon: IconListDetails,
    },
    {
      title: 'Sets',
      url: '/sets',
      icon: IconDatabase,
    },
    {
      title: 'Cards',
      url: '/cards',
      icon: IconSearch,
    },
    {
      title: 'Tools',
      url: '/tools',
      icon: IconSettings,
    },
    /* {
      title: 'Stats',
      url: '/stats',
      icon: IconChartBar,
    }, */
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <Image
                  src="/pokeball.svg"
                  alt="PokeCollector Logo"
                  width={32}
                  height={32}
                  className="!size-5"
                  priority={true}
                />
                <span className="text-base font-semibold">PokeCollector</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated && user ? (
          <NavUser 
            user={{
              name: `${user.firstName} ${user.lastName}`.trim() || user.username,
              username: user.username,
              email: user.email,
              avatar: '/avatars/shadcn.jpg', // Default avatar for now
            }} 
            logout={logout} 
          />
        ) : (
          <></>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
