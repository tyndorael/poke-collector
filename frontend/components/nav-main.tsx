'use client';
import { useRouter } from 'next/navigation';

import { IconCirclePlusFilled, IconMail, type Icon } from '@tabler/icons-react';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { CreateCollectionForm } from './create-collection-form';
import { useAuth } from '@/lib/auth';
import { CollectionVisibility, CreateCollectionDto } from '@/types';
import useSWR from 'swr';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Sheet>
              <SheetTrigger asChild>
                <SidebarMenuButton tooltip="New Collection">
                  <IconCirclePlusFilled />
                  <span>New Collection</span>
                </SidebarMenuButton>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px]">
                <SheetHeader>
                  <SheetTitle>New Collection</SheetTitle>
                  <SheetDescription>Create a new collection to start tracking your cards.</SheetDescription>
                </SheetHeader>
                {/* Add form or content for creating a new collection here */}
                <div className="flex flex-col gap-4 m-4">
                  <CreateCollectionForm />
                </div>
              </SheetContent>
            </Sheet>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => {
                  router.push(item.url);
                }}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
