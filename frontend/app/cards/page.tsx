'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import api from '@/lib/api';
import { toast } from 'sonner';
import { SearchCardForm } from '@/components/search-cards';
import { useState } from 'react';
import { DataTable } from '@/components/card-table/data-table';
import { columns } from '@/components/card-table/columns';

export default function Page() {
  const [cards, setCards] = useState([]);

  const handleSearchCards = async ({ name }: { name: string }) => {
    try {
      const cardsData = await api.get(`/cards?page=1&limit=100&search=${name}`);
      setCards(cardsData.data.cards);
      toast('Fetched cards successfully!');
    } catch (err: unknown) {
      toast(err.response?.data?.message || 'Error fetching cards');
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
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-1 @5xl/main:grid-cols-4">
                <SearchCardForm
                  type="search"
                  onSubmit={handleSearchCards}
                  className="col-span-1 md:col-span-2 lg:col-span-3"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4">
              <div className='"*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-1 @5xl/main:grid-cols-4"'>
                <DataTable columns={columns} data={cards} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
