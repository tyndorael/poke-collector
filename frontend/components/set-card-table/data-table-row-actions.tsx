'use client';

import { useState } from 'react';

import { ResponsiveDialog } from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import { AddCardToCollectionForm } from '../add-card-to-collection-form';

import type { Card } from '@/types';
interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends Card>({ row }: DataTableRowActionsProps<TData>) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddCardToCollectionOpen, setAddCardToCollectionOpen] = useState(false);

  const cardId = row.original.id as string;

  return (
    <>
      <ResponsiveDialog
        isOpen={isAddCardToCollectionOpen}
        setIsOpen={setAddCardToCollectionOpen}
        title="Add card to collection"
        description="Select your collection to add it"
      >
        <AddCardToCollectionForm card={row.original} setIsOpen={setAddCardToCollectionOpen} />
      </ResponsiveDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(cardId)}>Copy card ID</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setAddCardToCollectionOpen(true);
            }}
          >
            Add to collection
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View Card</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
