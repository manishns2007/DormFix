
'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewRequestDialog } from '@/components/new-request-dialog';
import { MaintenanceRequest } from '@/lib/types';
import { UserRequestsList } from './user-requests-list';

interface UserDashboardClientProps {
  requests: MaintenanceRequest[];
}

export function UserDashboardClient({ requests }: UserDashboardClientProps) {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsNewRequestOpen(true)} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> New Maintenance Request
        </Button>
      </div>

      <UserRequestsList requests={requests} />
      
      <NewRequestDialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen} />
    </div>
  );
}
