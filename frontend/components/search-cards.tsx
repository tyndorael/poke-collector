import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface SearchCardFormProps {
  type: 'search';
  onSubmit: (data: any) => void;
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
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Search Cards</h1>
                <p className="text-muted-foreground text-balance">Find cards</p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Name</Label>
                <Input
                  id="name"
                  type="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="pikachu"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
