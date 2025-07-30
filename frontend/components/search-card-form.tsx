import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface SearchCardFormProps {
  type: 'search';
  onSubmit: (data: { name: string }) => void;
  loading: boolean;
}

export function SearchCardForm({
  className,
  type = 'search',
  onSubmit,
  loading,
  ...props
}: React.ComponentProps<'div'> & SearchCardFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'search') {
      onSubmit({ name });
    } else {
      const registerData: RegisterData = { email, password, username, firstName, lastName };
      onSubmit(registerData);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">Find Cards</h2>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex flex-col flex-1">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter card name"
                    required
                  />
                </div>
                <Button type="submit" className="h-10">
                  Search
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
