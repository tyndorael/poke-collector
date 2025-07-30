'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as _ from 'lodash';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SearchCardForm } from '@/components/search-card-form';
import { DataTable } from '@/components/card-table/data-table';
import { columns } from '@/components/card-table/columns';
import api from '@/lib/api';
import { Separator } from '@radix-ui/react-separator';
import { CardListViewer } from '@/components/card-list-viewer';
import { Collection } from '@/types';
import { useAuth } from '@/lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Page() {
  const [cards, setCards] = useState([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const { isAuthenticated } = useAuth();

  const handleSearchCards = async ({ name }: { name: string }) => {
    try {
      const cardsData = await api.get(`/cards?page=1&limit=100&search=${name}`);
      setCards(cardsData.data.cards);
      toast('Fetched cards successfully!');
    } catch (err: unknown) {
      toast(_.get(err, 'response.data.message', 'Error fetching cards'));
    }
  };

  useEffect(() => {
    const fetchCollections = async () => {
      if (!isAuthenticated) return;
      
      try {
        const collectionsData = await api.get('/collections?limit=100');
        setCollections(collectionsData.data.collections || []);
      } catch (err: unknown) {
        console.error('Error fetching collections:', err);
        // Don't show error toast for collections as it's not critical
      }
    };

    if (isAuthenticated) {
      fetchCollections();
    }
  }, [isAuthenticated]);

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
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-1 @5xl/main:grid-cols-4">
                <SearchCardForm
                  type="search"
                  onSubmit={handleSearchCards}
                  className="col-span-1 md:col-span-2 lg:col-span-5"
                />
                
                {isAuthenticated && collections.length > 0 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-5">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="collection-select" className="text-sm font-medium">
                        Select Collection for Card Management
                      </Label>
                      <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                        <SelectTrigger id="collection-select">
                          <SelectValue placeholder="Choose a collection to add cards to" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map((collection) => (
                            <SelectItem key={collection.id} value={collection.id}>
                              {collection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
            <div className="flex flex-col gap-4 px-4 py-2">
              {cards.length > 0 ? (
                <CardListViewer 
                  cards={cards} 
                  collections={collections}
                  selectedCollection={selectedCollection}
                />
              ) : (
                <div className="text-center text-muted-foreground">No cards found. Please search for cards.</div>
              )}
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
