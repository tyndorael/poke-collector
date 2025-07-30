'use client';
import useSWR from 'swr';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Collection, CreateCollectionDto, CollectionVisibility, CollectionCard, PokemonSet, Card } from '@/types';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { SheetTitle } from '@/components/ui/sheet';
import { DataTable } from '@/components/set-card-table/data-table';
import { columns } from '@/components/set-card-table/columns';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function Page() {
  const params = useParams();
  const setId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    data: setData,
    error: setError,
    isLoading: setLoading,
    mutate: mutateSet,
  } = useSWR(setId ? `/sets/${setId}` : null, fetcher);

  const {
    data: cardsData,
    error: cardsError,
    isLoading: cardsLoading,
    mutate: mutateCards,
  } = useSWR(setId ? `/sets/${setId}/cards?page=1&limit=200` : null, fetcher);

  const set: PokemonSet = setData;
  const cards: Card[] = cardsData?.cards || [];

  if (setLoading || cardsLoading) {
    return <Skeleton className="h-[20px] w-[100px] rounded-full" />;
  }

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
              <div className="flex flex-col gap-2 px-4 lg:px-6">{set.name}</div>
              <div className="flex flex-col gap-2 px-4 lg:px-6">{set.series}</div>
              <div className="flex flex-col gap-2 px-4 lg:px-6">Printed total: {set.printedTotal}</div>
              <div className="flex flex-col gap-2 px-4 lg:px-6">Total: {set.total}</div>
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-4">
                  <div className='"*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-1 @5xl/main:grid-cols-4"'>
                    <DataTable columns={columns} data={cards} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
