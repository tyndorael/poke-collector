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
import { CreateCollectionDto, CollectionVisibility } from '@/types';
import router from 'next/router';
import useSWR from 'swr';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(50),
  description: z.string().max(200, {
    message: 'Description must be at most 200 characters.',
  }),
});
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function CreateCollectionForm() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data, error, isLoading, mutate } = useSWR(isAuthenticated ? '/collections' : null, fetcher);

  const handleCreateCollection = async ({ name, description }) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Logic to open the create collection modal or redirect to the create collection page
    try {
      const dto: CreateCollectionDto = {
        name,
        description,
        visibility: CollectionVisibility.PRIVATE, // Default visibility
      };
      await api.post('/collections', dto);
      mutate(); // Revalidate the collections data
      toast('Collection created successfully!');
      form.reset(); // Reset the form after submission
    } catch (err: any) {
      toast(err.response?.data?.message || 'Error creating collection');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleCreateCollection(values);
  }

  if (authLoading || isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My collection" {...field} />
              </FormControl>
              <FormDescription>This is the collection name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="My amazing collection" {...field} />
              </FormControl>
              <FormDescription>This is the collection description.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
