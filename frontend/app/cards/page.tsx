'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as _ from 'lodash';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SearchCardForm } from '@/components/search-card-form';
import api from '@/lib/api';
import { CardListViewer } from '@/components/card-list-viewer';
import { Collection, Card } from '@/types';
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
  const [cards, setCards] = useState<Card[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isAuthenticated } = useAuth();

  const handleSearchCards = async ({ name }: { name: string }) => {
    try {
      setIsLoading(true);
      setSearchTerm(name);
      setCurrentPage(1);
      
      const cardsData = await api.get(`/cards?page=1&limit=20&search=${name}`);
      setCards(cardsData.data.cards);
      setHasMoreCards(cardsData.data.cards.length === 20); // Assume no more if less than limit
      toast('Fetched cards successfully!');
    } catch (err: unknown) {
      toast(_.get(err, 'response.data.message', 'Error fetching cards'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreCards = useCallback(async () => {
    if (isLoading || !hasMoreCards || !searchTerm) return;

    try {
      setIsLoading(true);
      const nextPage = currentPage + 1;
      
      const cardsData = await api.get(`/cards?page=${nextPage}&limit=20&search=${searchTerm}`);
      const newCards = cardsData.data.cards;
      
      if (newCards.length > 0) {
        setCards(prevCards => [...prevCards, ...newCards]);
        setCurrentPage(nextPage);
        setHasMoreCards(newCards.length === 20); // Assume no more if less than limit
      } else {
        setHasMoreCards(false);
      }
    } catch (err: unknown) {
      console.error('Error loading more cards:', err);
      toast('Error loading more cards');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMoreCards, searchTerm, currentPage]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!isAuthenticated) return;
      
      try {
        const collectionsData = await api.get('/collections?limit=100');
        setCollections(collectionsData.data.collections || []);
      } catch (err: unknown) {
        console.error('Error fetching collections:', err);
      }
    };

    if (isAuthenticated) {
      fetchCollections();
    }
  }, [isAuthenticated]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight ||
        isLoading ||
        !hasMoreCards
      ) {
        return;
      }
      loadMoreCards();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMoreCards, loadMoreCards]);

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
                        Adding card to:
                      </Label>
                      <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                        <SelectTrigger id="collection-select">
                          <SelectValue placeholder="Choose a collection" />
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
                <>
                  <CardListViewer 
                    cards={cards} 
                    collections={collections}
                    selectedCollection={selectedCollection}
                  />
                  
                  {isLoading && (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-muted-foreground">Loading more cards...</div>
                    </div>
                  )}
                  
                  {!hasMoreCards && cards.length > 0 && !isLoading && (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-muted-foreground">No more cards to load</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  {isLoading ? 'Searching for cards...' : 'No cards found. Please search for cards.'}
                </div>
              )}
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
