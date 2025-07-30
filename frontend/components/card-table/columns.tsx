'use client';

import { Card } from '@/types';
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

export const columns: ColumnDef<Card>[] = [
  {
    accessorKey: 'smallImageUrl',
    header: 'Card',
    cell: ({ row }) => {
      return (
        <Image
          src={row.getValue('smallImageUrl') || '/pkm_placeholder.webp'}
          alt={row.getValue('name')}
          width={50}
          height={50}
          style={{ width: 'auto', height: 'auto' }}
        />
      );
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'setName',
    header: 'Set Name',
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
