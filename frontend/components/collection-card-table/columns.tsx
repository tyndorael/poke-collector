'use client';

import { Card, CollectionCard } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { AddCardToCollectionForm } from '@/components/add-card-to-collection-form';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@radix-ui/react-context-menu';
import { DataTableRowActions } from './data-table-row-actions';

export const columns: ColumnDef<CollectionCard>[] = [
  {
    accessorKey: 'card',
    header: 'Card',
    cell: ({ row }) => {
      return (
        <Image
          src={row.original.card.smallImageUrl}
          alt={row.original.card.name}
          width={50}
          height={50}
          style={{ width: 'auto', height: 'auto' }}
        />
      );
    },
  },
  {
    accessorKey: 'cardId',
    header: 'ID',
  },
  {
    accessorKey: 'card.name',
    header: 'Name',
  },
  {
    accessorKey: 'normalQuantity',
    header: 'Normal',
  },
  {
    accessorKey: 'holoQuantity',
    header: 'Holofoil',
  },
  {
    accessorKey: 'reverseQuantity',
    header: 'Reverse',
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
