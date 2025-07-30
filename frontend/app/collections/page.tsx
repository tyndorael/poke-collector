'use client';
import useSWR from 'swr';

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
import { Collection, CreateCollectionDto, CollectionVisibility } from '@/types';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge, DeleteIcon, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EditCollectionForm } from '@/components/edit-collection-form';
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function Page() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(isAuthenticated ? '/collections' : null, fetcher);

  const collections: Collection[] = data?.collections || [];

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await api.delete(`/collections/${collectionId}`);
      mutate();
      toast('Collection deleted successfully!');
    } catch (err: unknown) {
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
        {collections && collections.length === 0 ? (
          <div className="flex flex-col text-center align-middle justify-center">
            Add a collection to start to collect Pokémon Cards
          </div>
        ) : null}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {collections &&
                  collections.map((collection) => (
                    <Card key={collection.id} className="@container/card">
                      <CardHeader>
                        <CardDescription>{collection.description}</CardDescription>
                        <CardTitle
                          className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
                          onClick={() => router.push(`/collections/${collection.id}`)}
                        >
                          {collection.name}
                        </CardTitle>
                        <CardAction>
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <DeleteIcon className="cursor-pointer"></DeleteIcon>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your collection and remove
                                  your data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCollection(collection.id)}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Dialog>
                            <DialogTrigger>
                              <Edit />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit</DialogTitle>
                                <DialogDescription>
                                  <EditCollectionForm collectionId={collection.id} />
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </CardAction>
                      </CardHeader>
                      <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                          Last updated: {new Date(collection.updatedAt).toLocaleDateString()}
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
