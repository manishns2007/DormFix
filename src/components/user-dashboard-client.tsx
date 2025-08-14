'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NewRequestDialog } from '@/components/new-request-dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function UserDashboardClient() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  return (
    <div>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Submit a New Request</CardTitle>
                    <Button onClick={() => setIsNewRequestOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    If you have a maintenance issue to report, click the button to create a new request.
                </p>
            </CardContent>
        </Card>
      <NewRequestDialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen} />
    </div>
  );
}
