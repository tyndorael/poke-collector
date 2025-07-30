'use client';

import useSWR from 'swr';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { UserStats } from '@/types';
import { DashboardSectionCards } from '@/components/dashboard-section-cards';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function Page() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading = true, mutate } = useSWR(isAuthenticated ? '/stats/me' : null, fetcher);

  const userStats: UserStats = data;

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {isLoading || userStats === undefined ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Skeleton className="h-[100px] w-[400px] rounded-lg" />
                </div>
              ) : (
                <DashboardSectionCards user={userStats} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
