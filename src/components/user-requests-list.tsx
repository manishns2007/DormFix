
'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { Check, CheckCircle, Circle, HardHat, List, Loader } from 'lucide-react';
import { MaintenanceRequest, MaintenanceStatus, statuses } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from './icons';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface UserRequestsListProps {
  requests: MaintenanceRequest[];
}

const statusConfig = {
  Submitted: { icon: List, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  Assigned: { icon: HardHat, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  'In Progress': { icon: Loader, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  Completed: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500' },
};


const ProgressTimeline = ({ currentStatus }: { currentStatus: MaintenanceStatus }) => {
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="relative w-full py-4">
      {/* Dashed line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
      
      <div className="relative flex justify-between items-center">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const Icon = statusConfig[status].icon;
          
          return (
            <TooltipProvider key={status}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="z-10 flex flex-col items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                        isCompleted ? `${statusConfig[status].bgColor} text-white` : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs mt-2 text-center text-muted-foreground">{status}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{status}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};


export function UserRequestsList({ requests }: UserRequestsListProps) {
  if (requests.length === 0) {
    return (
      <Card className="text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">No Requests Yet!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You haven't submitted any maintenance requests. Click the "New Maintenance Request" button to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {requests.map(req => (
        <Card key={req.id} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CategoryIcon category={req.category} className="h-5 w-5" />
                  <span>{req.category} Issue in Room {req.roomNumber}</span>
                </CardTitle>
                <CardDescription>
                  Submitted {formatDistanceToNow(new Date(req.createdDate), { addSuffix: true })}
                </CardDescription>
              </div>
              <Badge variant={req.priority === 'High' ? 'destructive' : 'secondary'}>{req.priority} Priority</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground mb-4">{req.description}</p>
            <ProgressTimeline currentStatus={req.status} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
