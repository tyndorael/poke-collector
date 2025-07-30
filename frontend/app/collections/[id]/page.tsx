'use client';
import useSWR from 'swr';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Collection, CreateCollectionDto, CollectionVisibility, CollectionCard } from '@/types';
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
import { SectionCardPrices } from '@/components/card-prices';
import { DataTable } from '@/components/collection-card-table/data-table';
import { columns } from '@/components/collection-card-table/columns';
import { CollectionSummary } from '@/components/collection-summary';
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function Page() {
  const params = useParams();
  const collectionId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    data: collectionData,
    error: collectionError,
    isLoading: collectionLoading,
    mutate: mutateCollection,
  } = useSWR(collectionId ? `/collections/${collectionId}` : null, fetcher);
  const {
    data: cardsData,
    error: cardsError,
    isLoading: cardsLoading,
    mutate: mutateCards,
  } = useSWR(collectionId ? `/collections/${collectionId}/cards` : null, fetcher);
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR(collectionId ? `/collections/${collectionId}/stats` : null, fetcher);

  const collection: Collection = collectionData;
  const collectionCards: CollectionCard[] = cardsData?.collectionCards || [];
  const stats = statsData;

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
            {collectionLoading || cardsLoading || statsLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ) : collectionError || cardsError || statsError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-4">Error loading collection</h2>
                <p className="text-gray-500">Please try again later.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="flex flex-col items-center justify-center gap-2 px-4 lg:px-6 text-3xl">
                  {collection.name}
                </div>
                <div className="flex flex-col items-center gap-2 px-4 lg:px-6 text-1xl text-accent-foreground">
                  {collection.description}
                </div>
                <CollectionSummary collection={stats} />
                <div className="flex">
                  <div className="w-auto flex-auto px-4 lg:px-6">
                    <DataTable data={collectionCards} columns={columns} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
