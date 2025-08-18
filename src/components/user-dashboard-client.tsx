'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewRequestDialog } from '@/components/new-request-dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function UserDashboardClient() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto">
        <Card className="text-center shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl font-bold">Welcome!</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    Have a maintenance issue? Submit a request, and we'll take care of it.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setIsNewRequestOpen(true)} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-5 w-5" /> New Maintenance Request
                </Button>
            </CardContent>
        </Card>
      <NewRequestDialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen} />
    </div>
  );
}
