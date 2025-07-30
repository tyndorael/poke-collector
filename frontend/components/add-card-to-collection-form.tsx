'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AddCardToCollectionDto, Card, Collection, CollectionVisibility, EditCollectionDto } from '@/types';
import router from 'next/router';
import useSWR from 'swr';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dispatch, SetStateAction, useState } from 'react';
const formSchema = z.object({
  collectionId: z.string(),
  normalQuantity: z.number().min(0),
  holoQuantity: z.number().min(0),
  reverseQuantity: z.number().min(0),
  firstEditionQuantity: z.number().min(0),
  wPromoQuantity: z.number().min(0),
});
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function AddCardToCollectionForm({
  card,
  setIsOpen,
}: {
  card: Card;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data, error, isLoading, mutate } = useSWR(isAuthenticated ? '/collections' : null, fetcher);
  const [isAddCardToCollectionLoading, setIsAddCardToCollectionLoading] = useState(false);

  const collections: Collection[] = data?.collections || [];

  const handleAddCardToCollection = async ({
    collectionId,
    normalQuantity,
    holoQuantity,
    reverseQuantity,
    firstEditionQuantity,
    wPromoQuantity,
  }) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Logic to open the create collection modal or redirect to the create collection page
    try {
      setIsAddCardToCollectionLoading(true);
      const dto: AddCardToCollectionDto = {
        cardId: card.id,
        normalQuantity,
        holoQuantity,
        reverseQuantity,
        firstEditionQuantity,
        wPromoQuantity,
      };
      await api.post(`/collections/${collectionId}/cards`, dto);
      mutate(); // Revalidate the collections data
      toast('Card added to collection successfully!');
      form.reset(); // Reset the form after submission
      setIsOpen(false);
    } catch (err: any) {
      toast(err.response?.data?.message || 'Error updating collection');
    } finally {
      setIsAddCardToCollectionLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionId: '',
      normalQuantity: 0,
      holoQuantity: 0,
      reverseQuantity: 0,
      firstEditionQuantity: 0,
      wPromoQuantity: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleAddCardToCollection(values);
  }

  if (authLoading || isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="collectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection to add the card" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collections &&
                    collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>Select your collection.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {card.variants?.normal && (
          <FormField
            control={form.control}
            disabled={!card.variants?.normal}
            name="normalQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount of normal cards</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount of normal cards"
                    {...field}
                    {...form.register('normalQuantity', { valueAsNumber: true })}
                  />
                </FormControl>
                <FormDescription>This is the amount of cards.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {card.variants?.holo && (
          <FormField
            control={form.control}
            disabled={!card.variants?.holo}
            name="holoQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount of holofoil cards</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount of holofoil cards"
                    {...field}
                    {...form.register('holoQuantity', { valueAsNumber: true })}
                  />
                </FormControl>
                <FormDescription>This is the amount of holofoil cards.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {card.variants?.reverse && (
          <FormField
            control={form.control}
            disabled={!card.variants?.reverse}
            name="reverseQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount of reverse cards</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount of reverse cards"
                    {...field}
                    {...form.register('reverseQuantity', { valueAsNumber: true })}
                  />
                </FormControl>
                <FormDescription>This is the amount of reverse cards.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {card.variants?.firstEdition && (
          <FormField
            control={form.control}
            disabled={!card.variants?.firstEdition}
            name="firstEditionQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount of first edition cards</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount of first edition cards"
                    {...field}
                    {...form.register('firstEditionQuantity', { valueAsNumber: true })}
                  />
                </FormControl>
                <FormDescription>This is the amount of first edition cards.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" disabled={isAddCardToCollectionLoading}>
          {isAddCardToCollectionLoading ? 'Adding...' : 'Add to collection'}
        </Button>
      </form>
    </Form>
  );
}
