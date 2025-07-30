'use client';
import useSWR from 'swr';
import Image from 'next/image';

import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Collection, CreateCollectionDto, CollectionVisibility, PokemonSet } from '@/types';
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
import { Badge, DeleteIcon, Edit, Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EditCollectionForm } from '@/components/edit-collection-form';
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function Page() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(isAuthenticated ? '/sets?page=1&limit=200' : null, fetcher);

  const sets: PokemonSet[] = data?.sets || [];

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await api.delete(`/collections/${collectionId}`);
      mutate(); // Revalidate the collections data
      toast('Collection deleted successfully!');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Error deleting collection');
    }
  };

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
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {sets &&
                  sets.map((set) => (
                    <Card key={set.id} className="@container/card" onClick={() => router.push(`/sets/${set.id}`)}>
                      <CardHeader>
                        <CardDescription>{set.series}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {set.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col">
                        <Image
                          src={set.logoUrl || '/pokemon-logo-placeholder.png'}
                          alt={set.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg"
                          style={{ width: 'auto', height: 'auto' }}
                        />
                      </CardContent>
                      <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                          Release date: {new Date(set.releaseDate).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
