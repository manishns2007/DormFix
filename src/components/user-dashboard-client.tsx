'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewRequestDialog } from '@/components/new-request-dialog';

export function UserDashboardClient() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(true);

  return (
    <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
        <p className="text-muted-foreground mb-6">You can submit a new maintenance request here.</p>
        <Button onClick={() => setIsNewRequestOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Request
        </Button>
      <NewRequestDialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen} />
    </div>
  );
}
